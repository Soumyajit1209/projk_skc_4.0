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

    // Get stats
    const [totalUsersRows] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'")

    const [activeUsersRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user' AND status = 'active'",
    )

    const [maleUsersRows] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users u 
      JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.role = 'user' AND up.gender = 'Male'
    `)

    const [femaleUsersRows] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users u 
      JOIN user_profiles up ON u.id = up.user_id 
      WHERE u.role = 'user' AND up.gender = 'Female'
    `)

    await connection.end()

    return NextResponse.json({
      totalUsers: (totalUsersRows as any[])[0].count,
      activeUsers: (activeUsersRows as any[])[0].count,
      maleUsers: (maleUsersRows as any[])[0].count,
      femaleUsers: (femaleUsersRows as any[])[0].count,
    })
  } catch (error) {
    console.error("Admin stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
