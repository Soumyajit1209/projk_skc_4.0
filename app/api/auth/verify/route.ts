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

    // Get user details
    const [rows] = await connection.execute(
      "SELECT id, name, email, phone, role, status FROM users WHERE id = ? AND status = 'active'", 
      [decoded.userId]
    )

    const users = rows as any[]
    const user = users[0]

    if (!user) {
      await connection.end()
      return NextResponse.json({ error: "User not found or inactive" }, { status: 404 })
    }

    let profileComplete = true // Default for admin users

    // Check if profile is complete for regular users
    if (user.role === 'user') {
      const [profileRows] = await connection.execute(
        "SELECT id, status FROM user_profiles WHERE user_id = ?", 
        [decoded.userId]
      )
      
      const profiles = profileRows as any[]
      profileComplete = profiles.length > 0 && profiles[0].status !== 'rejected'
    }

    await connection.end()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        profileComplete,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}