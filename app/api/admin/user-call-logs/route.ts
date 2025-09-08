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
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    const connection = await mysql.createConnection(dbConfig)

    // If userId is provided, get call logs for specific user
    if (userId) {
      const [rows] = await connection.execute(`
        SELECT 
          cs.id as session_id,
          cs.caller_id,
          cs.receiver_id,
          cs.status,
          cs.duration,
          cs.cost,
          cs.caller_virtual_number,
          cs.receiver_virtual_number,
          COALESCE(cs.started_at, cs.created_at) as started_at,
          cs.ended_at,
          cs.created_at,
          caller.name as caller_name,
          caller.phone as caller_phone,
          caller_profile.profile_photo as caller_photo,
          receiver.name as receiver_name,
          receiver.phone as receiver_phone,
          receiver_profile.profile_photo as receiver_photo,
          CASE 
            WHEN cs.caller_id = ? THEN 'outgoing'
            WHEN cs.receiver_id = ? THEN 'incoming'
            ELSE 'unknown'
          END as call_type,
          CASE 
            WHEN cs.caller_id = ? THEN receiver.name
            ELSE caller.name
          END as other_party_name,
          CASE 
            WHEN cs.caller_id = ? THEN receiver.phone
            ELSE caller.phone
          END as other_party_phone,
          CASE 
            WHEN cs.caller_id = ? THEN receiver_profile.profile_photo
            ELSE caller_profile.profile_photo
          END as other_party_photo
        FROM call_sessions cs
        LEFT JOIN users caller ON cs.caller_id = caller.id
        LEFT JOIN users receiver ON cs.receiver_id = receiver.id
        LEFT JOIN user_profiles caller_profile ON caller.id = caller_profile.user_id
        LEFT JOIN user_profiles receiver_profile ON receiver.id = receiver_profile.user_id
        WHERE (cs.caller_id = ? OR cs.receiver_id = ?)
        ORDER BY cs.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, userId, userId, userId, userId, userId, userId, limit, offset])

      const [countRows] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM call_sessions cs
        WHERE (cs.caller_id = ? OR cs.receiver_id = ?)
      `, [userId, userId])

      const totalCount = (countRows as any[])[0].total

      await connection.end()

      const callLogs = (rows as any[]).map(row => ({
        session_id: row.session_id,
        call_type: row.call_type,
        other_party_name: row.other_party_name,
        other_party_phone: row.other_party_phone,
        other_party_photo: row.other_party_photo,
        status: row.status,
        duration: row.duration || 0,
        cost: parseFloat(row.cost) || 0,
        virtual_number: row.call_type === 'outgoing' ? row.caller_virtual_number : row.receiver_virtual_number,
        started_at: row.started_at,
        ended_at: row.ended_at,
        created_at: row.created_at,
        caller_name: row.caller_name,
        receiver_name: row.receiver_name
      }))

      return NextResponse.json({
        callLogs,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    }

    // If no userId, return all users with call statistics
    const [userRows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        up.profile_photo,
        COUNT(CASE WHEN cs.caller_id = u.id THEN 1 END) as outgoing_calls,
        COUNT(CASE WHEN cs.receiver_id = u.id THEN 1 END) as incoming_calls,
        COUNT(cs.id) as total_calls,
        COUNT(CASE WHEN cs.status = 'completed' AND cs.caller_id = u.id THEN 1 END) as completed_outgoing,
        COUNT(CASE WHEN cs.status = 'completed' AND cs.receiver_id = u.id THEN 1 END) as completed_incoming,
        COUNT(CASE WHEN cs.status = 'completed' THEN 1 END) as completed_calls,
        COALESCE(SUM(CASE WHEN cs.status = 'completed' THEN CEIL(cs.duration/60) ELSE 0 END), 0) as total_minutes,
        COALESCE(AVG(CASE WHEN cs.status = 'completed' AND cs.duration > 0 THEN cs.duration ELSE NULL END), 0) as avg_call_duration,
        COALESCE(SUM(cs.cost), 0) as total_cost,
        MAX(cs.created_at) as last_call_date,
        uc.credits_remaining,
        uc.credits_purchased,
        uc.expires_at as credits_expire
      FROM users u
      LEFT JOIN call_sessions cs ON (u.id = cs.caller_id OR u.id = cs.receiver_id)
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_call_credits uc ON u.id = uc.user_id AND uc.expires_at > NOW()
      WHERE u.role = 'user'
      GROUP BY u.id, u.name, u.email, u.phone, up.profile_photo, uc.credits_remaining, uc.credits_purchased, uc.expires_at
      HAVING total_calls > 0
      ORDER BY last_call_date DESC, total_calls DESC
      LIMIT ? OFFSET ?
    `, [limit, offset])

    const [userCountRows] = await connection.execute(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN call_sessions cs ON (u.id = cs.caller_id OR u.id = cs.receiver_id)
      WHERE u.role = 'user' AND cs.id IS NOT NULL
    `)

    const totalUsers = (userCountRows as any[])[0].total

    await connection.end()

    const users = (userRows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      profile_photo: row.profile_photo,
      outgoing_calls: row.outgoing_calls || 0,
      incoming_calls: row.incoming_calls || 0,
      total_calls: row.total_calls || 0,
      completed_outgoing: row.completed_outgoing || 0,
      completed_incoming: row.completed_incoming || 0,
      completed_calls: row.completed_calls || 0,
      total_minutes: parseInt(row.total_minutes) || 0,
      avg_call_duration: parseFloat(row.avg_call_duration) || 0,
      total_cost: parseFloat(row.total_cost) || 0,
      last_call_date: row.last_call_date,
      credits_remaining: row.credits_remaining || 0,
      credits_purchased: row.credits_purchased || 0,
      credits_expire: row.credits_expire,
      has_active_credits: row.credits_remaining > 0 && new Date(row.credits_expire) > new Date()
    }))

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    })

  } catch (error) {
    console.error("User call logs error:", error)
    return NextResponse.json({ error: "Failed to fetch call logs" }, { status: 500 })
  }
}