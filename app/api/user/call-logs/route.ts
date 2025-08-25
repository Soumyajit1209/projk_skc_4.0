// app/api/user/call-logs/route.ts (Create this new file)
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