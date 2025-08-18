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

    const [rows] = await connection.execute("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.userId])

    // Check if profile is complete
    const [profileRows] = await connection.execute("SELECT COUNT(*) as count FROM user_profiles WHERE user_id = ?", [
      decoded.userId,
    ])

    await connection.end()

    const users = rows as any[]
    const user = users[0]

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const profileComplete = (profileRows as any[])[0].count > 0

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileComplete,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
