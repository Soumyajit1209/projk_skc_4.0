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

// Get user's active plan
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    const connection = await mysql.createConnection(dbConfig)

    // Get user's most recent verified payment and plan
    const [rows] = await connection.execute(`
      SELECT 
        p.id as payment_id,
        p.status,
        p.verified_at,
        p.created_at as payment_date,
        pl.name as plan_name,
        pl.price,
        pl.duration_months,
        pl.features,
        pl.description,
        DATE_ADD(p.verified_at, INTERVAL pl.duration_months MONTH) as expires_at
      FROM payments p
      JOIN plans pl ON p.plan_id = pl.id
      WHERE p.user_id = ? AND p.status = 'verified'
      ORDER BY p.verified_at DESC
      LIMIT 1
    `, [decoded.userId])

    await connection.end()

    const activePlan = (rows as any[])[0]

    if (!activePlan) {
      return NextResponse.json({ activePlan: null })
    }

    // Check if plan is still active (not expired)
    const now = new Date()
    const expiresAt = new Date(activePlan.expires_at)
    const isActive = now <= expiresAt

    return NextResponse.json({ 
      activePlan: isActive ? {
        ...activePlan,
        isActive: true,
        daysLeft: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      } : null
    })
  } catch (error) {
    console.error("Active plan fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}