import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, type } = await request.json()

    if (!identifier || !password || !type) {
      return NextResponse.json({ error: "Identifier, password, and type are required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Query users table for both user and admin login
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE (email = ? OR phone = ?) AND status = 'active'", 
      [identifier, identifier]
    )
    
    const users = rows as any[]
    const user = users[0]

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await connection.end()
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if the user role matches the requested login type
    if (type === "admin" && user.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied. Admin privileges required." }, { status: 403 })
    }

    if (type === "user" && user.role !== "user") {
      await connection.end()
      return NextResponse.json({ error: "Invalid login type for this account" }, { status: 403 })
    }

    let profileComplete = true // Default for admin users

    // Check if profile is complete for regular users
    if (user.role === 'user') {
      const [profileRows] = await connection.execute(
        "SELECT id, status FROM user_profiles WHERE user_id = ?", 
        [user.id]
      )
      
      const profiles = profileRows as any[]
      profileComplete = profiles.length > 0 && profiles[0].status !== 'rejected'
    }

    await connection.end()

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: user.role, // Keep for backward compatibility
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    )

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    if (user.role === "admin") {
      return NextResponse.json({
        message: "Admin login successful",
        token,
        admin: {
          admin_id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileComplete: true,
        },
      })
    } else {
      return NextResponse.json({
        message: "Login successful",
        token,
        user: {
          user_id: user.id,
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileComplete: profileComplete,
        },
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}