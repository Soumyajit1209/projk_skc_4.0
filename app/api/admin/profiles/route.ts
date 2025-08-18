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

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])

    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch all user profiles with user data
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        up.age,
        up.gender,
        up.caste,
        up.religion,
        up.state,
        up.city,
        up.occupation,
        up.education,
        up.marital_status,
        up.profile_photo
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC
    `)

    await connection.end()

    return NextResponse.json({
      profiles: rows,
    })
  } catch (error) {
    console.error("Admin profiles fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
