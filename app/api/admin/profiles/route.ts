import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get("gender")
    const ageMin = searchParams.get("ageMin")
    const ageMax = searchParams.get("ageMax")
    const caste = searchParams.get("caste")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const status = searchParams.get("status")

    const connection = await mysql.createConnection(dbConfig)

    let query = `
      SELECT p.*, u.email, u.phone 
      FROM user_profiles p 
      JOIN users u ON p.user_id = u.id 
      WHERE 1=1
    `
    const params: any[] = []

    if (gender) {
      query += " AND p.gender = ?"
      params.push(gender)
    }
    if (ageMin) {
      query += " AND p.age >= ?"
      params.push(Number.parseInt(ageMin))
    }
    if (ageMax) {
      query += " AND p.age <= ?"
      params.push(Number.parseInt(ageMax))
    }
    if (caste) {
      query += " AND p.caste LIKE ?"
      params.push(`%${caste}%`)
    }
    if (city) {
      query += " AND p.city LIKE ?"
      params.push(`%${city}%`)
    }
    if (state) {
      query += " AND p.state LIKE ?"
      params.push(`%${state}%`)
    }
    if (status) {
      query += " AND p.status = ?"
      params.push(status)
    }

    query += " ORDER BY p.created_at DESC"

    const [rows] = await connection.execute(query, params)
    await connection.end()

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }
}
