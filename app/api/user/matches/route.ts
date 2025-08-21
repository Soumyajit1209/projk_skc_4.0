// app/api/user/matches/route.ts
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

    // Verify user role (only regular users can access this)
    const [userRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const user = (userRows as any[])[0]
    if (!user || user.role !== "user") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get all matches for this user with complete profile details
    const [matchRows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        up.age,
        up.gender,
        up.height,
        up.weight,
        up.caste,
        up.religion,
        up.mother_tongue,
        up.marital_status,
        up.education,
        up.occupation,
        up.income,
        up.state,
        up.city,
        up.family_type,
        up.family_status,
        up.about_me,
        up.partner_preferences,
        up.profile_photo,
        m.created_at as matched_at,
        m.created_by_admin,
        admin_user.name as matched_by_admin_name
      FROM matches m
      JOIN users u ON m.matched_user_id = u.id
      JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN users admin_user ON m.created_by_admin = admin_user.id
      WHERE m.user_id = ? 
        AND u.status = 'active' 
        AND up.status = 'approved'
      ORDER BY m.created_at DESC
    `, [decoded.userId])

    await connection.end()

    return NextResponse.json({ 
      matches: matchRows,
      total: (matchRows as any[]).length
    })
  } catch (error) {
    console.error("User matches fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get single match profile details
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { matchedUserId } = await request.json()

    if (!matchedUserId) {
      return NextResponse.json({ error: "Matched user ID is required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Verify user role
    const [userRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const user = (userRows as any[])[0]
    if (!user || user.role !== "user") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Verify that this user is actually matched with the requested profile
    const [matchVerification] = await connection.execute(
      "SELECT id FROM matches WHERE user_id = ? AND matched_user_id = ?",
      [decoded.userId, matchedUserId]
    )

    if ((matchVerification as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Get complete profile details
    const [profileRows] = await connection.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        up.age,
        up.gender,
        up.height,
        up.weight,
        up.caste,
        up.religion,
        up.mother_tongue,
        up.marital_status,
        up.education,
        up.occupation,
        up.income,
        up.state,
        up.city,
        up.family_type,
        up.family_status,
        up.about_me,
        up.partner_preferences,
        up.profile_photo,
        up.created_at,
        up.updated_at
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? 
        AND u.status = 'active' 
        AND up.status = 'approved'
    `, [matchedUserId])

    const profile = (profileRows as any[])[0]

    if (!profile) {
      await connection.end()
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    await connection.end()

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Match profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}