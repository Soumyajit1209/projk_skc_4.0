import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email])

    await connection.end()

    const users = rows as any[]
    const user = users[0]

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Check if profile is complete
    const [profileRows] = await mysql.createConnection(dbConfig).then(async (conn) => {
      const result = await conn.execute("SELECT COUNT(*) as count FROM user_profiles WHERE user_id = ?", [user.id])
      await conn.end()
      return result
    })

    const profileComplete = (profileRows as any[])[0].count > 0

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileComplete,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
