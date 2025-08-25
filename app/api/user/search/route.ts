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

// Function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance);
}

// Function to calculate compatibility score
function calculateCompatibilityScore(user1: any, user2: any): number {
  let score = 0;
  let totalFactors = 0;

  // Religion match (25% weight)
  if (user1.religion === user2.religion) score += 25;
  totalFactors += 25;

  // Caste match (15% weight)
  if (user1.caste === user2.caste) score += 15;
  totalFactors += 15;

  // Education level match (20% weight)
  const educationLevels = ['High School', "Bachelor's", "Master's", 'PhD'];
  const user1EduIndex = educationLevels.indexOf(user1.education);
  const user2EduIndex = educationLevels.indexOf(user2.education);
  const eduDiff = Math.abs(user1EduIndex - user2EduIndex);
  if (eduDiff === 0) score += 20;
  else if (eduDiff === 1) score += 15;
  else if (eduDiff === 2) score += 10;
  totalFactors += 20;

  // Age compatibility (20% weight)
  const ageDiff = Math.abs(user1.age - user2.age);
  if (ageDiff <= 2) score += 20;
  else if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 8) score += 10;
  else if (ageDiff <= 12) score += 5;
  totalFactors += 20;

  // Location proximity (10% weight)
  if (user1.state === user2.state) {
    if (user1.city === user2.city) score += 10;
    else score += 5;
  }
  totalFactors += 10;

  // Mother tongue match (10% weight)
  if (user1.mother_tongue === user2.mother_tongue) score += 10;
  totalFactors += 10;

  return Math.round((score / totalFactors) * 100);
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

    // Get current user's details
    const [currentUserRows] = await connection.execute(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [decoded.userId]
    )
    const currentUser = (currentUserRows as any[])[0]

    if (!currentUser) {
      await connection.end()
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location') || ''
    const gender = searchParams.get('gender') || ''
    const ageMin = searchParams.get('ageMin') || ''
    const ageMax = searchParams.get('ageMax') || ''
    const religion = searchParams.get('religion') || ''
    const education = searchParams.get('education') || ''
    const occupation = searchParams.get('occupation') || ''

    // Build dynamic query
    let query = `
      SELECT 
        up.*,
        u.name, u.email, u.phone,
        COALESCE(ul.latitude, 0) as latitude,
        COALESCE(ul.longitude, 0) as longitude
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      LEFT JOIN user_locations ul ON up.user_id = ul.user_id
      WHERE up.user_id != ? 
        AND up.status = 'approved'
        AND u.status = 'active'
        AND up.gender != ?
    `
    
    const queryParams: any[] = [decoded.userId, currentUser.gender]

    // Add search filters
    if (location) {
      query += ` AND (up.city LIKE ? OR up.state LIKE ?)`
      queryParams.push(`%${location}%`, `%${location}%`)
    }

    if (gender) {
      query += ` AND up.gender = ?`
      queryParams.push(gender)
    }

    if (ageMin) {
      query += ` AND up.age >= ?`
      queryParams.push(parseInt(ageMin))
    }

    if (ageMax) {
      query += ` AND up.age <= ?`
      queryParams.push(parseInt(ageMax))
    }

    if (religion) {
      query += ` AND up.religion = ?`
      queryParams.push(religion)
    }

    if (education) {
      query += ` AND up.education = ?`
      queryParams.push(education)
    }

    if (occupation) {
      query += ` AND up.occupation LIKE ?`
      queryParams.push(`%${occupation}%`)
    }

    query += ` ORDER BY up.created_at DESC LIMIT 50`

    const [profileRows] = await connection.execute(query, queryParams)
    const profiles = profileRows as any[]

    // Get current user's location for distance calculation
    const [currentUserLocationRows] = await connection.execute(
      "SELECT latitude, longitude FROM user_locations WHERE user_id = ?",
      [decoded.userId]
    )
    const currentUserLocation = (currentUserLocationRows as any[])[0]

    // Process profiles and add distance/compatibility
    const processedProfiles = profiles.map(profile => {
      let distance = null;
      
      // Calculate distance if both users have location data
      if (currentUserLocation && profile.latitude && profile.longitude) {
        distance = calculateDistance(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          profile.latitude,
          profile.longitude
        );
      }

      // Calculate compatibility score
      const compatibilityScore = calculateCompatibilityScore(currentUser, profile);

      return {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        caste: profile.caste,
        religion: profile.religion,
        mother_tongue: profile.mother_tongue,
        marital_status: profile.marital_status,
        education: profile.education,
        occupation: profile.occupation,
        income: profile.income,
        state: profile.state,
        city: profile.city,
        family_type: profile.family_type,
        family_status: profile.family_status,
        about_me: profile.about_me,
        partner_preferences: profile.partner_preferences,
        profile_photo: profile.profile_photo,
        distance,
        compatibility_score: compatibilityScore,
        created_at: profile.created_at
      }
    })

    // Sort by compatibility score (highest first), then by distance (closest first)
    processedProfiles.sort((a, b) => {
      if (a.compatibility_score !== b.compatibility_score) {
        return b.compatibility_score - a.compatibility_score;
      }
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return 0;
    });

    await connection.end()

    return NextResponse.json({
      profiles: processedProfiles,
      total: processedProfiles.length
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}