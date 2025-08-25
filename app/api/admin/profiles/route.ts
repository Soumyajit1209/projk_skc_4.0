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
    
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Enhanced query with subscription information
    const [rows] = await connection.execute(`
   SELECT 
     up.*,
     u.name, u.email, u.phone,
     
     -- Check for active normal plan
     CASE WHEN ns.id IS NOT NULL THEN 1 ELSE 0 END as has_normal_plan,
     
     -- Check for active call plan
     CASE WHEN cc.id IS NOT NULL THEN 1 ELSE 0 END as has_call_plan,
     cc.credits_remaining as call_credits_remaining,
     
     -- Count total matches
     (SELECT COUNT(*) FROM matches WHERE user_id = up.user_id OR matched_user_id = up.user_id) as total_matches
     
   FROM user_profiles up
   JOIN users u ON up.user_id = u.id
   
   -- Left join for active normal subscriptions
   LEFT JOIN user_subscriptions ns ON up.user_id = ns.user_id 
     AND ns.status = 'active' 
     AND ns.expires_at > NOW()
   LEFT JOIN plans np ON ns.plan_id = np.id AND np.type = 'normal'
   
   -- Left join for active call credits
   LEFT JOIN user_call_credits cc ON up.user_id = cc.user_id 
     AND cc.credits_remaining > 0 
     AND cc.expires_at > NOW()
   LEFT JOIN plans cp ON cc.plan_id = cp.id AND cp.type = 'call'
   
   WHERE u.role = 'user'
   ORDER BY up.created_at DESC
 `)

    await connection.end()

    const profiles = (rows as any[]).map(row => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      age: row.age,
      gender: row.gender,
      height: row.height,
      weight: row.weight,
      caste: row.caste,
      religion: row.religion,
      mother_tongue: row.mother_tongue,
      marital_status: row.marital_status,
      education: row.education,
      occupation: row.occupation,
      income: row.income,
      state: row.state,
      city: row.city,
      family_type: row.family_type,
      family_status: row.family_status,
      about_me: row.about_me,
      partner_preferences: row.partner_preferences,
      profile_photo: row.profile_photo,
      status: row.status,
      rejection_reason: row.rejection_reason,
      created_at: row.created_at,
      updated_at: row.updated_at,
      has_normal_plan: row.has_normal_plan === 1,
      has_call_plan: row.has_call_plan === 1,
      call_credits_remaining: row.call_credits_remaining || 0,
      total_matches: row.total_matches || 0
    }))

    return NextResponse.json(profiles)

  } catch (error) {
    console.error("Enhanced profiles error:", error)
    return NextResponse.json({ error: "Failed to fetch enhanced profiles" }, { status: 500 })
  }
}