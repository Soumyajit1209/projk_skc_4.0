import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function GET(request: NextRequest) {
  try {
    const connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(
      "SELECT * FROM plans WHERE is_active = 1  ORDER BY type, price ASC"
    )

    const plans = (rows as any[]).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration_months: plan.duration_months,
      features: plan.features ? plan.features.split(',').map((f: string) => f.trim()) : [],
      description: plan.description,
      type: plan.type,
      call_credits: plan.call_credits,
      can_view_details: plan.can_view_details === 1,
      can_make_calls: plan.can_make_calls === 1,
      created_at: plan.created_at
    }))

    await connection.end()

    return NextResponse.json({
      plans: plans
    })

  } catch (error) {
    console.error("Plans fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}