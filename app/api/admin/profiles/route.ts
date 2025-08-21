// app/api/admin/profiles/route.ts
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

    const { searchParams } = new URL(request.url)
    const gender = searchParams.get("gender")
    const ageMin = searchParams.get("ageMin")
    const ageMax = searchParams.get("ageMax")
    const caste = searchParams.get("caste")
    const city = searchParams.get("city")
    const state = searchParams.get("state")
    const status = searchParams.get("status")

    const connection = await mysql.createConnection(dbConfig)

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Updated query to properly join users and user_profiles tables
    let query = `
      SELECT 
        p.id,
        p.user_id,
        u.name,
        u.email,
        u.phone,
        p.age,
        p.gender,
        p.height,
        p.weight,
        p.caste,
        p.religion,
        p.mother_tongue,
        p.marital_status,
        p.education,
        p.occupation,
        p.income,
        p.state,
        p.city,
        p.family_type,
        p.family_status,
        p.about_me,
        p.partner_preferences,
        p.profile_photo,
        p.status,
        p.rejection_reason,
        p.created_at,
        p.updated_at
      FROM user_profiles p 
      JOIN users u ON p.user_id = u.id 
      WHERE u.role = 'user'
    `
    const params: any[] = []

    if (gender && gender !== 'all') {
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
    if (caste && caste !== 'all') {
      query += " AND p.caste = ?"
      params.push(caste)
    }
    if (city && city !== 'all') {
      query += " AND p.city = ?"
      params.push(city)
    }
    if (state && state !== 'all') {
      query += " AND p.state = ?"
      params.push(state)
    }
    if (status && status !== 'all') {
      query += " AND p.status = ?"
      params.push(status)
    }

    query += " ORDER BY p.created_at DESC"

    const [rows] = await connection.execute(query, params)
    await connection.end()

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Admin profiles fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
  }
}