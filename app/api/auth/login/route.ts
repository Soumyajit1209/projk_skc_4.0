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

async function loginUser(identifier: string, password: string) {
  const connection = await mysql.createConnection(dbConfig)
  const [rows] = await connection.execute("SELECT * FROM users WHERE email = ? OR phone = ?", [identifier, identifier])
  await connection.end()
  const users = rows as any[]
  const user = users[0]

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null
  }

  return {
    user_id: user.id,
    email: user.email,
    phone: user.phone,
  }
}

async function loginAdmin(identifier: string, password: string) {
  const connection = await mysql.createConnection(dbConfig)
  const [rows] = await connection.execute("SELECT * FROM admins WHERE username = ? OR email = ?", [
    identifier,
    identifier,
  ])
  await connection.end()
  const admins = rows as any[]
  const admin = admins[0]

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return null
  }

  return {
    admin_id: admin.id,
    username: admin.username,
    email: admin.email,
  }
}

function generateToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "7d" })
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, type } = await request.json()

    if (!identifier || !password || !type) {
      return NextResponse.json({ error: "Identifier, password, and type are required" }, { status: 400 })
    }

    if (type === "user") {
      const user = await loginUser(identifier, password)

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const token = generateToken({
        user_id: user.user_id,
        email: user.email,
        type: "user",
      })

      const cookieStore = await cookies()
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({
        message: "Login successful",
        user: {
          user_id: user.user_id,
          email: user.email,
          phone: user.phone,
        },
      })
    } else if (type === "admin") {
      const admin = await loginAdmin(identifier, password)

      if (!admin) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const token = generateToken({
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        type: "admin",
      })

      const cookieStore = await cookies()
      cookieStore.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return NextResponse.json({
        message: "Admin login successful",
        admin: {
          admin_id: admin.admin_id,
          username: admin.username,
          email: admin.email,
        },
      })
    } else {
      return NextResponse.json({ error: "Invalid login type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
