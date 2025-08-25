import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"
import jwt from "jsonwebtoken"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

function calculateCallCost(durationSeconds: number, costPerMinute: number = 1): number {
  const minutes = Math.ceil(durationSeconds / 60) // Round up to nearest minute
  return minutes * costPerMinute
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Exotel webhook payload contains call details
    const {
      CallSid,
      CallStatus,
      CallDuration,
      RecordingUrl,
      CustomField
    } = body

    if (!CallSid) {
      return NextResponse.json({ error: "CallSid is required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Find the call session
    const [sessionRows] = await connection.execute(
      "SELECT * FROM call_sessions WHERE exotel_call_sid = ?",
      [CallSid]
    )

    const session = (sessionRows as any[])[0]

    if (!session) {
      await connection.end()
      return NextResponse.json({ error: "Call session not found" }, { status: 404 })
    }

    // Update call session based on status
    let updateQuery = ""
    let updateParams: any[] = []

    switch (CallStatus) {
      case 'in-progress':
        updateQuery = "UPDATE call_sessions SET status = 'in_progress', started_at = NOW() WHERE id = ?"
        updateParams = [session.id]
        break

      case 'completed':
      case 'busy':
      case 'no-answer':
      case 'failed':
        const duration = parseInt(CallDuration) || 0
        const cost = calculateCallCost(duration, session.cost_per_minute)
        
        updateQuery = `
          UPDATE call_sessions 
          SET status = ?, duration = ?, cost = ?, ended_at = NOW(), recording_url = ?
          WHERE id = ?
        `
        updateParams = [CallStatus, duration, cost, RecordingUrl || null, session.id]

        // If call was completed successfully, deduct credits and create call log
        if (CallStatus === 'completed' && duration > 0) {
          // Deduct credits from both users (they share the cost)
          const creditsToDeduct = Math.ceil(cost / 2) // Split cost between users

          // Deduct from caller's credits
          await connection.execute(`
            UPDATE user_call_credits 
            SET credits_remaining = GREATEST(0, credits_remaining - ?)
            WHERE user_id = ? AND credits_remaining > 0 AND expires_at > NOW()
            ORDER BY expires_at ASC
            LIMIT 1
          `, [creditsToDeduct, session.caller_id])

          // Deduct from receiver's credits (if they have any)
          await connection.execute(`
            UPDATE user_call_credits 
            SET credits_remaining = GREATEST(0, credits_remaining - ?)
            WHERE user_id = ? AND credits_remaining > 0 AND expires_at > NOW()
            ORDER BY expires_at ASC
            LIMIT 1
          `, [creditsToDeduct, session.receiver_id])

          // Create call logs for both users
          await connection.execute(`
            INSERT INTO call_logs (
              user_id, other_user_id, call_session_id, call_type, duration, cost, created_at
            ) VALUES (?, ?, ?, 'outgoing', ?, ?, NOW())
          `, [session.caller_id, session.receiver_id, session.id, duration, creditsToDeduct])

          await connection.execute(`
            INSERT INTO call_logs (
              user_id, other_user_id, call_session_id, call_type, duration, cost, created_at
            ) VALUES (?, ?, ?, 'incoming', ?, ?, NOW())
          `, [session.receiver_id, session.caller_id, session.id, duration, creditsToDeduct])
        }
        break

      default:
        updateQuery = "UPDATE call_sessions SET status = ? WHERE id = ?"
        updateParams = [CallStatus, session.id]
    }

    // Execute the update
    if (updateQuery) {
      await connection.execute(updateQuery, updateParams)
    }

    await connection.end()

    return NextResponse.json({ 
      success: true, 
      message: "Webhook processed successfully" 
    })

  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// GET endpoint to retrieve call logs for a user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const connection = await mysql.createConnection(dbConfig)

    const [logRows] = await connection.execute(`
      SELECT 
        cl.*,
        other_user.name as other_user_name,
        other_profile.profile_photo as other_user_photo,
        cs.caller_virtual_number,
        cs.receiver_virtual_number
      FROM call_logs cl
      JOIN users other_user ON cl.other_user_id = other_user.id
      JOIN user_profiles other_profile ON cl.other_user_id = other_profile.user_id
      JOIN call_sessions cs ON cl.call_session_id = cs.id
      WHERE cl.user_id = ?
      ORDER BY cl.created_at DESC
      LIMIT 50
    `, [decoded.userId])

    const logs = (logRows as any[]).map(log => ({
      id: log.id,
      caller_name: log.call_type === 'outgoing' ? 'You' : log.other_user_name,
      receiver_name: log.call_type === 'outgoing' ? log.other_user_name : 'You',
      other_user_name: log.other_user_name,
      other_user_photo: log.other_user_photo,
      duration: log.duration,
      cost: log.cost,
      call_type: log.call_type,
      masked_number: log.call_type === 'outgoing' ? log.caller_virtual_number : log.receiver_virtual_number,
      created_at: log.created_at
    }))

    await connection.end()

    return NextResponse.json({
      logs: logs
    })

  } catch (error) {
    console.error("Call logs error:", error)
    return NextResponse.json({ error: "Failed to fetch call logs" }, { status: 500 })
  }
}