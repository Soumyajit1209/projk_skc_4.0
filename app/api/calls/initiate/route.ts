// app/api/calls/initiate/route.ts
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

// Exotel configuration
const EXOTEL_SID = process.env.EXOTEL_SID
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY
const EXOTEL_API_TOKEN = process.env.EXOTEL_API_TOKEN
const EXOTEL_SUBDOMAIN = process.env.EXOTEL_SUBDOMAIN
const EXOTEL_VIRTUAL_NUMBER = process.env.EXOTEL_VIRTUAL_NUMBER

async function initiateExotelCall(
  callerNumber: string,
  receiverNumber: string,
  userId: number,
  targetUserId: number
) {
  try {
    const url = `https://${process.env.EXOTEL_SUBDOMAIN}/v1/Accounts/${process.env.EXOTEL_SID}/Calls/connect.json`

    const formData = new URLSearchParams()
    formData.append('From', callerNumber)
    formData.append('To', receiverNumber)
    formData.append('CallerId', process.env.EXOTEL_VIRTUAL_NUMBER ?? "")
    formData.append('CallType', 'trans')
    formData.append('TimeLimit', '3600')
    formData.append('TimeOut', '30')
    formData.append('StatusCallback', `${process.env.APP_URL}/api/calls/webhook`)
    formData.append('Record', 'true')
    formData.append('CustomField', JSON.stringify({
      userId,
      targetUserId,
      timestamp: Date.now()
    }))

    const authHeader =
      'Basic ' +
      Buffer.from(
        `${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}`
      ).toString('base64')

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
    })

    const data = await response.json()

    if (response.ok && data.Call && data.Call.Sid) {
      return {
        success: true,
        callSid: data.Call.Sid,
        status: data.Call.Status,
        virtualNumber: process.env.EXOTEL_VIRTUAL_NUMBER,
      }
    } else {
      console.error('Exotel API Error:', data)
      throw new Error(
        data.RestException?.Message ||
        data.message ||
        'Exotel API call failed'
      )
    }
  } catch (error) {
    console.error('Exotel API Error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const { targetUserId } = await request.json()

    if (!targetUserId || isNaN(targetUserId)) {
      return NextResponse.json({ error: "Valid target user ID is required" }, { status: 400 })
    }

    if (!EXOTEL_SID || !EXOTEL_API_KEY || !EXOTEL_API_TOKEN || !EXOTEL_VIRTUAL_NUMBER) {
      console.error('Missing Exotel configuration')
      return NextResponse.json({
        error: "Call service not configured",
        code: "CONFIG_ERROR"
      }, { status: 500 })
    }

    connection = await mysql.createConnection(dbConfig)
    const [callerCreditsRows] = await connection.execute(`
      SELECT id, credits_remaining, expires_at FROM user_call_credits 
      WHERE user_id = ? 
        AND credits_remaining > 0
        AND expires_at > NOW()
      ORDER BY expires_at ASC
      LIMIT 1
    `, [decoded.userId])

    if ((callerCreditsRows as any[]).length === 0) {
      return NextResponse.json({
        error: "You don't have active call credits. Please purchase a call plan.",
        code: "NO_CREDITS"
      }, { status: 403 })
    }

    // Check if receiver has active credits  
    const [receiverCreditsRows] = await connection.execute(`
      SELECT id, credits_remaining FROM user_call_credits 
      WHERE user_id = ? 
        AND credits_remaining > 0
        AND expires_at > NOW()
      LIMIT 1
    `, [targetUserId])

    if ((receiverCreditsRows as any[]).length === 0) {
      return NextResponse.json({
        error: "The user you're trying to call doesn't have active call credits.",
        code: "TARGET_NO_CREDITS"
      }, { status: 403 })
    }

    // Get user phone numbers and details
    const [usersRows] = await connection.execute(`
      SELECT 
        u.id, u.name, u.phone, u.status,
        up.profile_photo
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id IN (?, ?) AND u.status = 'active'
    `, [decoded.userId, targetUserId])

    const users = (usersRows as any[])

    if (users.length !== 2) {
      return NextResponse.json({ error: "One or both users not found" }, { status: 404 })
    }

    const caller = users.find(u => u.id === decoded.userId)
    const receiver = users.find(u => u.id === targetUserId)

    // Validate phone numbers
    if (!caller.phone || !receiver.phone) {
      return NextResponse.json({
        error: "Phone numbers are required for both users",
        code: "MISSING_PHONE"
      }, { status: 400 })
    }

    // Check if users are matched
    const [matchRows] = await connection.execute(`
      SELECT id FROM matches 
      WHERE (user_id = ? AND matched_user_id = ?) 
         OR (user_id = ? AND matched_user_id = ?)
      LIMIT 1
    `, [decoded.userId, targetUserId, targetUserId, decoded.userId])

    if ((matchRows as any[]).length === 0) {
      return NextResponse.json({
        error: "You can only call users you've matched with",
        code: "NOT_MATCHED"
      }, { status: 403 })
    }

    try {
      // Initiate call via Exotel
      const exotelResult = await initiateExotelCall(
        caller.phone,
        receiver.phone,
        decoded.userId,
        targetUserId
      )
      const [sessionResult] = await connection.execute(`
        INSERT INTO call_sessions (
          caller_id, receiver_id, exotel_call_sid, status,
          caller_virtual_number, receiver_virtual_number,
          caller_real_number, receiver_real_number, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        decoded.userId,
        targetUserId,
        exotelResult.callSid,
        'initiated',
        EXOTEL_VIRTUAL_NUMBER,
        EXOTEL_VIRTUAL_NUMBER,
        caller.phone,
        receiver.phone
      ])

      const callSessionId = (sessionResult as any).insertId

      return NextResponse.json({
        success: true,
        callSessionId,
        message: "Call initiated successfully",
        status: "initiated",
        callerName: caller.name,
        receiverName: receiver.name,
        instructions: "Exotel will call both users automatically. Please answer your phone.",
        exotelCallSid: exotelResult.callSid
      })

    } catch (exotelError) {
      console.error('Exotel call failed:', exotelError)
      return NextResponse.json({
        error: "Failed to initiate call: " + (exotelError as Error).message,
        code: "EXOTEL_ERROR"
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Call initiation error:", error)
    return NextResponse.json({
      error: "Internal server error",
      code: "INTERNAL_ERROR"
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}