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

    // Get current user's profile
    const [currentUserRows] = await connection.execute(
      "SELECT gender, religion, caste, state FROM user_profiles WHERE user_id = ?",
      [decoded.userId],
    )

    const currentUser = (currentUserRows as any[])[0]

    if (!currentUser) {
      await connection.end()
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Find matches based on opposite gender and similar preferences
    const oppositeGender = currentUser.gender === "Male" ? "Female" : "Male"

    const [matchRows] = await connection.execute(
      `SELECT 
        u.id, u.name,
        up.age, up.gender, up.caste, up.religion, up.state, up.city, 
        up.occupation, up.education, up.profile_photo, up.about_me
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id != ? 
        AND up.gender = ?
        AND u.status = 'active'
        AND (up.religion = ? OR up.state = ?)
      ORDER BY 
        CASE WHEN up.religion = ? THEN 1 ELSE 2 END,
        CASE WHEN up.state = ? THEN 1 ELSE 2 END,
        RAND()
      LIMIT 20`,
      [
        decoded.userId,
        oppositeGender,
        currentUser.religion,
        currentUser.state,
        currentUser.religion,
        currentUser.state,
      ],
    )

    await connection.end()

    return NextResponse.json({ matches: matchRows })
  } catch (error) {
    console.error("Matches fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
