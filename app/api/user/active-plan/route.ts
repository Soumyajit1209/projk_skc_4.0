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

    // Get active normal subscription
    const [normalSubRows] = await connection.execute(`
      SELECT 
        us.*,
        p.name as plan_name,
        p.price,
        p.duration_months
      FROM user_subscriptions us
      JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = ? 
        AND us.status = 'active'
        AND p.type = 'normal'
        AND us.expires_at > NOW()
      ORDER BY us.expires_at DESC
      LIMIT 1
    `, [decoded.userId])

    // Get active call subscription
    const [callSubRows] = await connection.execute(`
      SELECT 
        uc.*,
        p.name as plan_name,
        p.price,
        p.call_credits
      FROM user_call_credits uc
      JOIN plans p ON uc.plan_id = p.id
      WHERE uc.user_id = ? 
        AND uc.credits_remaining > 0
        AND uc.expires_at > NOW()
      ORDER BY uc.expires_at DESC
      LIMIT 1
    `, [decoded.userId])

    const normalSub = (normalSubRows as any[])[0]
    const callSub = (callSubRows as any[])[0]

    const plans: any = {}

    // Process normal plan
    if (normalSub) {
      const expiresAt = new Date(normalSub.expires_at)
      const now = new Date()
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      plans.normal_plan = {
        plan_name: normalSub.plan_name,
        price: normalSub.price,
        duration_months: normalSub.duration_months,
        expires_at: normalSub.expires_at,
        daysLeft: Math.max(0, daysLeft),
        isActive: daysLeft > 0
      }
    }

    // Process call plan
    if (callSub) {
      const expiresAt = new Date(callSub.expires_at)
      const now = new Date()
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      plans.call_plan = {
        plan_name: callSub.plan_name,
        credits_remaining: callSub.credits_remaining,
        expires_at: callSub.expires_at,
        daysLeft: Math.max(0, daysLeft),
        isActive: daysLeft > 0 && callSub.credits_remaining > 0
      }
    }

    await connection.end()

    return NextResponse.json({
      plans: plans
    })

  } catch (error) {
    console.error("Active plans error:", error)
    return NextResponse.json({ error: "Failed to fetch active plans" }, { status: 500 })
  }
}