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

    // Get total users
    const [userRows] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const totalUsers = (userRows as any)[0].count

    // Get pending profiles
    const [pendingRows] = await connection.execute("SELECT COUNT(*) as count FROM profiles WHERE status = ?", [
      "pending",
    ])
    const pendingProfiles = (pendingRows as any)[0].count

    // Get approved profiles
    const [approvedRows] = await connection.execute("SELECT COUNT(*) as count FROM profiles WHERE status = ?", [
      "approved",
    ])
    const approvedProfiles = (approvedRows as any)[0].count

    // Get total matches
    const [matchRows] = await connection.execute("SELECT COUNT(*) as count FROM matches")
    const totalMatches = (matchRows as any)[0].count

    await connection.end()

    return NextResponse.json({
      totalUsers,
      pendingProfiles,
      approvedProfiles,
      totalMatches,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
