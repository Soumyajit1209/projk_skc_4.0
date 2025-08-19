// app/api/admin/payments/route.ts
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

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get all payments with user and plan details
    const [rows] = await connection.execute(`
      SELECT 
        p.id, p.transaction_id, p.amount, p.payment_method, p.screenshot,
        p.status, p.admin_notes, p.created_at, p.verified_at,
        u.id as user_id, u.name as user_name, u.email as user_email,
        pl.name as plan_name, pl.price as plan_price,
        va.name as verified_by_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN plans pl ON p.plan_id = pl.id
      LEFT JOIN users va ON p.verified_by = va.id
      ORDER BY p.created_at DESC
    `)

    await connection.end()

    return NextResponse.json({ payments: rows })
  } catch (error) {
    console.error("Admin payments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { paymentId, status, adminNotes } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Payment ID and status are required" }, { status: 400 })
    }

    if (!["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update payment status
    await connection.execute(
      `UPDATE payments 
       SET status = ?, admin_notes = ?, verified_by = ?, verified_at = NOW() 
       WHERE id = ?`,
      [status, adminNotes || null, decoded.userId, paymentId]
    )

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin payment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}