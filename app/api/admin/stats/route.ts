import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig)

    // Get total users (excluding admins)
    const [userRows] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE role = 'user'")
    const totalUsers = (userRows as any)[0].count

    // Get pending profiles
    const [pendingRows] = await connection.execute("SELECT COUNT(*) as count FROM user_profiles WHERE status = ?", [
      "pending",
    ])
    const pendingProfiles = (pendingRows as any)[0].count

    // Get approved profiles
    const [approvedRows] = await connection.execute("SELECT COUNT(*) as count FROM user_profiles WHERE status = ?", [
      "approved",
    ])
    const approvedProfiles = (approvedRows as any)[0].count

    // Get rejected profiles
    const [rejectedRows] = await connection.execute("SELECT COUNT(*) as count FROM user_profiles WHERE status = ?", [
      "rejected",
    ])
    const rejectedProfiles = (rejectedRows as any)[0].count

    // Get total matches
    const [matchRows] = await connection.execute("SELECT COUNT(*) as count FROM matches")
    const totalMatches = (matchRows as any)[0].count

    // Get total payments
    const [paymentRows] = await connection.execute("SELECT COUNT(*) as count FROM payments")
    const totalPayments = (paymentRows as any)[0].count

    // Get pending payments
    const [pendingPaymentRows] = await connection.execute("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'")
    const pendingPayments = (pendingPaymentRows as any)[0].count

    // Get verified payments
    const [verifiedPaymentRows] = await connection.execute("SELECT COUNT(*) as count FROM payments WHERE status = 'verified'")
    const verifiedPayments = (verifiedPaymentRows as any)[0].count

    // Get recent registrations (last 30 days)
    const [recentRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    )
    const recentRegistrations = (recentRows as any)[0].count

    await connection.end()

    return NextResponse.json({
      totalUsers,
      pendingProfiles,
      approvedProfiles,
      rejectedProfiles,
      totalMatches,
      totalPayments,
      pendingPayments,
      verifiedPayments,
      recentRegistrations,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}