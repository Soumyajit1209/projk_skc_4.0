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

// Exotel configuration
const EXOTEL_SID = process.env.EXOTEL_SID
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN
const EXOTEL_APP_ID = process.env.EXOTEL_APP_ID
const EXOTEL_CALLER_ID = process.env.EXOTEL_CALLER_ID // Your verified Exotel number

// Function to create masked number using Exotel
async function createMaskedCall(callerNumber: string, receiverNumber: string, userId: number, targetUserId: number) {
  try {
    const url = `https://api.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect`
    
    const formData = new URLSearchParams()
    formData.append('From', callerNumber)
    formData.append('To', receiverNumber)
    formData.append('CallerId', EXOTEL_CALLER_ID)
    formData.append('CallType', 'trans')
    formData.append('TimeLimit', '3600') // 1 hour max
    formData.append('TimeOut', '30') // 30 seconds timeout
    formData.append('StatusCallback', `${process.env.APP_URL}/api/calls/webhook`)
    formData.append('StatusCallbackEvents', 'terminal')
    formData.append('Record', 'true')
    formData.append('CustomField', JSON.stringify({ userId, targetUserId }))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${EXOTEL_SID}:${EXOTEL_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    const data = await response.json()
    
    if (response.ok && data.Call) {
      return {
        success: true,
        callSid: data.Call.Sid,
        status: data.Call.Status,
        maskedNumber: EXOTEL_CALLER_ID
      }
    } else {
      throw new Error(data.message || 'Failed to initiate call')
    }
  } catch (error) {
    console.error('Exotel API error:', error)
    throw error
  }
}

// Function to generate virtual number for display
function generateVirtualNumber(): string {
  // Generate a virtual number format like +91-XXXX-XXXXXX
  const areaCode = Math.floor(Math.random() * 9000) + 1000
  const number = Math.floor(Math.random() * 900000) + 100000
  return `+91-${areaCode}-${number}`
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Check if user has active call credits
    const [callCreditsRows] = await connection.execute(`
      SELECT 
        uc.*,
        p.name as plan_name,
        p.call_credits,
        p.price as cost_per_call
      FROM user_call_credits uc
      JOIN plans p ON uc.plan_id = p.id
      WHERE uc.user_id = ? 
        AND uc.credits_remaining > 0
        AND uc.expires_at > NOW()
      ORDER BY uc.expires_at ASC
      LIMIT 1
    `, [decoded.userId])

    const callCredits = (callCreditsRows as any[])[0]

    if (!callCredits) {
      await connection.end()
      return NextResponse.json({ 
        error: "No active call credits. Please purchase a call plan to make calls." 
      }, { status: 403 })
    }

    // Get caller details
    const [callerRows] = await connection.execute(`
      SELECT u.*, up.* FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.status = 'active'
    `, [decoded.userId])

    const caller = (callerRows as any[])[0]

    if (!caller) {
      await connection.end()
      return NextResponse.json({ error: "Caller not found" }, { status: 404 })
    }

    // Get target user details
    const [targetRows] = await connection.execute(`
      SELECT u.*, up.* FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.status = 'active'
    `, [targetUserId])

    const targetUser = (targetRows as any[])[0]

    if (!targetUser) {
      await connection.end()
      return NextResponse.json({ error: "Target user not found" }, { status: 404 })
    }

    // Check if users are matched
    const [matchRows] = await connection.execute(`
      SELECT * FROM user_matches 
      WHERE (user_id = ? AND matched_user_id = ?) 
         OR (user_id = ? AND matched_user_id = ?)
    `, [decoded.userId, targetUserId, targetUserId, decoded.userId])

    if ((matchRows as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ 
        error: "You can only call matched users" 
      }, { status: 403 })
    }

    // Generate virtual numbers for display
    const callerVirtualNumber = generateVirtualNumber()
    const receiverVirtualNumber = generateVirtualNumber()

    try {
      // Initiate call through Exotel
      const callResult = await createMaskedCall(
        caller.phone,
        targetUser.phone,
        decoded.userId,
        targetUserId
      )

      // Create call session record
      const [callSessionResult] = await connection.execute(`
        INSERT INTO call_sessions (
          caller_id, receiver_id, exotel_call_sid, status,
          caller_virtual_number, receiver_virtual_number,
          caller_real_number, receiver_real_number,
          cost_per_minute, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        decoded.userId,
        targetUserId,
        callResult.callSid,
        'initiated',
        callerVirtualNumber,
        receiverVirtualNumber,
        caller.phone,
        targetUser.phone,
        1 // ₹1 per minute
      ])

      const callSessionId = (callSessionResult as any).insertId

      await connection.end()

      return NextResponse.json({
        success: true,
        callSessionId,
        callerVirtualNumber,
        receiverVirtualNumber,
        targetName: targetUser.name,
        status: 'connecting',
        message: 'Call is being connected. Please wait...',
        callUrl: `/call/${callSessionId}` // Frontend call interface
      })

    } catch (exotelError) {
      await connection.end()
      console.error('Call initiation failed:', exotelError)
      return NextResponse.json({ 
        error: "Failed to initiate call. Please try again." 
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Call initiation error:", error)
    return NextResponse.json({ error: "Call initiation failed" }, { status: 500 })
  }
}

// GET endpoint to get call session details
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    const [sessionRows] = await connection.execute(`
      SELECT 
        cs.*,
        caller.name as caller_name,
        receiver.name as receiver_name,
        caller_profile.profile_photo as caller_photo,
        receiver_profile.profile_photo as receiver_photo
      FROM call_sessions cs
      JOIN users caller ON cs.caller_id = caller.id
      JOIN users receiver ON cs.receiver_id = receiver.id
      JOIN user_profiles caller_profile ON cs.caller_id = caller_profile.user_id
      JOIN user_profiles receiver_profile ON cs.receiver_id = receiver_profile.user_id
      WHERE cs.id = ? AND (cs.caller_id = ? OR cs.receiver_id = ?)
    `, [sessionId, decoded.userId, decoded.userId])

    const session = (sessionRows as any[])[0]

    if (!session) {
      await connection.end()
      return NextResponse.json({ error: "Call session not found" }, { status: 404 })
    }

    await connection.end()

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        duration: session.duration,
        cost: session.cost,
        caller_name: session.caller_name,
        receiver_name: session.receiver_name,
        caller_photo: session.caller_photo,
        receiver_photo: session.receiver_photo,
        caller_virtual_number: session.caller_virtual_number,
        receiver_virtual_number: session.receiver_virtual_number,
        is_caller: decoded.userId === session.caller_id,
        created_at: session.created_at,
        ended_at: session.ended_at
      }
    })

  } catch (error) {
    console.error("Get call session error:", error)
    return NextResponse.json({ error: "Failed to get call session" }, { status: 500 })
  }
}