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
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Check if user already exists
    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

    if ((existingUsers as any[]).length > 0) {
      await connection.end()
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, hashedPassword, "user"],
    )

    const userId = (result as any).insertId

    await connection.end()

    const token = jwt.sign({ userId, email, role: "user" }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email,
        name,
        role: "user",
        profileComplete: false,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
