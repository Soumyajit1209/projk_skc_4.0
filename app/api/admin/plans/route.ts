// app/api/plans/route.ts
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

    // Get all active plans
    const [rows] = await connection.execute(`
      SELECT id, name, price, duration_months, features, description, is_active
      FROM plans 
      WHERE is_active = true
      ORDER BY price ASC
    `)

    await connection.end()

    return NextResponse.json({ plans: rows })
  } catch (error) {
    console.error("Plans fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, price, duration_months, features, description } = await request.json()

    if (!name || !price || !duration_months) {
      return NextResponse.json({ error: "Name, price and duration are required" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Create new plan
    const [result] = await connection.execute(
      `INSERT INTO plans (name, price, duration_months, features, description, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, true, NOW())`,
      [name, price, duration_months, features || null, description || null]
    )

    await connection.end()

    return NextResponse.json({ 
      success: true, 
      planId: (result as any).insertId 
    })
  } catch (error) {
    console.error("Plan creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}