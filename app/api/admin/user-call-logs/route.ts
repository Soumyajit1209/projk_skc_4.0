import { type NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

// Database configuration with production-safe settings
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Additional production safety settings
  multipleStatements: false,
  namedPlaceholders: false,
};

// Connection pool for better resource management
let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        ...dbConfig,
        connectionLimit: 5, // Reduced for production stability
        queueLimit: 0,
      });
    } catch (error) {
      console.error("Failed to create connection pool:", error);
      throw error;
    }
  }
  return pool;
}

// Helper function to safely execute queries
async function safeExecute(connection: mysql.PoolConnection, query: string, params: any[] = []) {
  try {
    console.log("Executing query with params:", { 
      query: query.substring(0, 100) + "...", 
      paramCount: params.length,
      params: params.map(p => typeof p === 'number' ? p : `${p}`.substring(0, 50))
    });
    
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error("Query execution failed:", {
      error: (error as Error).message,
      query: query.substring(0, 200),
      paramCount: params.length,
      paramTypes: params.map(p => typeof p)
    });
    throw error;
  }
}

export async function GET(request: NextRequest) {
  let connection: mysql.PoolConnection | null = null;
  
  try {
    console.log("=== Starting user-call-logs API request ===");
    
    // JWT Authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    } catch (error) {
      console.error("JWT verification failed:", (error as Error).message);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!decoded.role || decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Parse and validate parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const pageRaw = searchParams.get("page") || "1";
    const limitRaw = searchParams.get("limit") || "20";

    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw, 10) || 20));
    const offset = (page - 1) * limit;

    console.log("Request parameters:", { userId, page, limit, offset });

    // Get database connection
    try {
      const connectionPool = getPool();
      connection = await connectionPool.getConnection();
      console.log("Database connection established");
    } catch (error) {
      console.error("Failed to get database connection:", error);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Handle specific user call logs
    if (userId) {
      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum) || userIdNum < 1) {
        return NextResponse.json(
          { error: "Invalid userId (must be a positive number)" },
          { status: 400 }
        );
      }

      console.log("Fetching call logs for user:", userIdNum);

      try {
        // Simplified call logs query
        const callLogsQuery = `
          SELECT 
            cs.id as session_id,
            cs.caller_id,
            cs.receiver_id,
            cs.status,
            COALESCE(cs.duration, 0) as duration,
            COALESCE(cs.cost, 0) as cost,
            cs.caller_virtual_number,
            cs.receiver_virtual_number,
            COALESCE(cs.started_at, cs.created_at) as started_at,
            cs.ended_at,
            cs.created_at
          FROM call_sessions cs
          WHERE (cs.caller_id = ? OR cs.receiver_id = ?)
          ORDER BY cs.created_at DESC
          LIMIT ? OFFSET ?
        `;

        const callLogs = await safeExecute(connection, callLogsQuery, [
          userIdNum, userIdNum, limit, offset
        ]) as any[];

        // Get user names separately to avoid complex joins
        const enrichedCallLogs = await Promise.all(
          callLogs.map(async (log) => {
            try {
              const otherUserId = log.caller_id === userIdNum ? log.receiver_id : log.caller_id;
              const callType = log.caller_id === userIdNum ? 'outgoing' : 'incoming';
              
              // Get other party details
              const userQuery = `
                SELECT u.name, u.phone, up.profile_photo
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ?
              `;
              
              const otherUsers = await safeExecute(connection!, userQuery, [otherUserId]) as any[];
              const otherUser = otherUsers[0] || { name: 'Unknown', phone: 'Unknown', profile_photo: null };

              // Get caller and receiver names
              const callerQuery = `SELECT name FROM users WHERE id = ?`;
              const receiverQuery = `SELECT name FROM users WHERE id = ?`;
              
              const callerResults = await safeExecute(connection!, callerQuery, [log.caller_id]) as any[];
              const receiverResults = await safeExecute(connection!, receiverQuery, [log.receiver_id]) as any[];
              
              return {
                session_id: log.session_id,
                call_type: callType,
                other_party_name: otherUser.name || "Unknown",
                other_party_phone: otherUser.phone || "Unknown",
                other_party_photo: otherUser.profile_photo,
                status: log.status || 'unknown',
                duration: Number(log.duration) || 0,
                cost: Number(log.cost) || 0,
                virtual_number: callType === 'outgoing' ? log.caller_virtual_number : log.receiver_virtual_number,
                started_at: log.started_at,
                ended_at: log.ended_at,
                created_at: log.created_at,
                caller_name: callerResults[0]?.name || "Unknown",
                receiver_name: receiverResults[0]?.name || "Unknown",
              };
            } catch (enrichError) {
              console.error("Error enriching call log:", enrichError);
              return {
                session_id: log.session_id,
                call_type: log.caller_id === userIdNum ? 'outgoing' : 'incoming',
                other_party_name: "Unknown",
                other_party_phone: "Unknown",
                other_party_photo: null,
                status: log.status || 'unknown',
                duration: Number(log.duration) || 0,
                cost: Number(log.cost) || 0,
                virtual_number: null,
                started_at: log.started_at,
                ended_at: log.ended_at,
                created_at: log.created_at,
                caller_name: "Unknown",
                receiver_name: "Unknown",
              };
            }
          })
        );

        // Get total count
        const countQuery = `
          SELECT COUNT(*) as total
          FROM call_sessions cs
          WHERE (cs.caller_id = ? OR cs.receiver_id = ?)
        `;
        
        const countResult = await safeExecute(connection, countQuery, [userIdNum, userIdNum]) as any[];
        const totalCount = countResult[0]?.total || 0;

        console.log(`Successfully fetched ${enrichedCallLogs.length} call logs for user ${userIdNum}`);

        return NextResponse.json({
          callLogs: enrichedCallLogs,
          pagination: {
            page,
            limit,
            total: Number(totalCount),
            totalPages: Math.ceil(Number(totalCount) / limit),
          },
        });

      } catch (queryError) {
        console.error("Error fetching user call logs:", {
          error: (queryError as Error).message,
          userId: userIdNum
        });
        return NextResponse.json(
          { error: "Failed to fetch user call logs" },
          { status: 500 }
        );
      }
    }

    // Handle all users with call activity
    console.log("Fetching all users with call activity");

    try {
      // Step 1: Get users who have call activity
      const usersWithCallsQuery = `
        SELECT DISTINCT u.id, u.name, u.email, u.phone
        FROM users u
        INNER JOIN call_sessions cs ON (u.id = cs.caller_id OR u.id = cs.receiver_id)
        WHERE u.role = 'user'
        ORDER BY u.id
        LIMIT ? OFFSET ?
      `;

      const baseUsers = await safeExecute(connection, usersWithCallsQuery, [limit, offset]) as any[];

      if (baseUsers.length === 0) {
        console.log("No users with call activity found");
        return NextResponse.json({
          users: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      console.log(`Found ${baseUsers.length} users with call activity`);

      // Step 2: Enrich each user with their statistics
      const enrichedUsers = await Promise.all(
        baseUsers.map(async (user) => {
          try {
            // Get profile photo
            const profileQuery = `SELECT profile_photo FROM user_profiles WHERE user_id = ?`;
            const profileResults = await safeExecute(connection!, profileQuery, [user.id]) as any[];
            const profile = profileResults[0] || { profile_photo: null };

            // Get call statistics
            const statsQuery = `
              SELECT 
                SUM(CASE WHEN caller_id = ? THEN 1 ELSE 0 END) as outgoing_calls,
                SUM(CASE WHEN receiver_id = ? THEN 1 ELSE 0 END) as incoming_calls,
                COUNT(*) as total_calls,
                SUM(CASE WHEN status = 'completed' AND caller_id = ? THEN 1 ELSE 0 END) as completed_outgoing,
                SUM(CASE WHEN status = 'completed' AND receiver_id = ? THEN 1 ELSE 0 END) as completed_incoming,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
                SUM(CASE WHEN status = 'completed' THEN CEIL(COALESCE(duration, 0)/60) ELSE 0 END) as total_minutes,
                AVG(CASE WHEN status = 'completed' AND duration > 0 THEN duration ELSE NULL END) as avg_duration,
                SUM(COALESCE(cost, 0)) as total_cost,
                MAX(created_at) as last_call_date
              FROM call_sessions
              WHERE caller_id = ? OR receiver_id = ?
            `;

            const statsResults = await safeExecute(connection!, statsQuery, [
              user.id, user.id, user.id, user.id, user.id, user.id
            ]) as any[];
            
            const stats = statsResults[0] || {};

            // Get credit information
            const creditsQuery = `
              SELECT credits_remaining, credits_purchased, expires_at
              FROM user_call_credits
              WHERE user_id = ? AND expires_at > NOW()
              ORDER BY expires_at DESC
              LIMIT 1
            `;

            const creditsResults = await safeExecute(connection!, creditsQuery, [user.id]) as any[];
            const credits = creditsResults[0] || { 
              credits_remaining: 0, 
              credits_purchased: 0, 
              expires_at: null 
            };

            return {
              id: user.id,
              name: user.name || "Unknown",
              email: user.email || "Unknown",
              phone: user.phone || "Unknown",
              profile_photo: profile.profile_photo,
              outgoing_calls: Number(stats.outgoing_calls) || 0,
              incoming_calls: Number(stats.incoming_calls) || 0,
              total_calls: Number(stats.total_calls) || 0,
              completed_outgoing: Number(stats.completed_outgoing) || 0,
              completed_incoming: Number(stats.completed_incoming) || 0,
              completed_calls: Number(stats.completed_calls) || 0,
              total_minutes: Number(stats.total_minutes) || 0,
              avg_call_duration: Number(stats.avg_duration) || 0,
              total_cost: Number(stats.total_cost) || 0,
              last_call_date: stats.last_call_date,
              credits_remaining: Number(credits.credits_remaining) || 0,
              credits_purchased: Number(credits.credits_purchased) || 0,
              credits_expire: credits.expires_at,
              has_active_credits: credits.credits_remaining > 0 && 
                                credits.expires_at && 
                                new Date(credits.expires_at) > new Date(),
            };

          } catch (userError) {
            console.error(`Error processing user ${user.id}:`, userError);
            // Return safe fallback data
            return {
              id: user.id,
              name: user.name || "Unknown",
              email: user.email || "Unknown", 
              phone: user.phone || "Unknown",
              profile_photo: null,
              outgoing_calls: 0,
              incoming_calls: 0,
              total_calls: 0,
              completed_outgoing: 0,
              completed_incoming: 0,
              completed_calls: 0,
              total_minutes: 0,
              avg_call_duration: 0,
              total_cost: 0,
              last_call_date: null,
              credits_remaining: 0,
              credits_purchased: 0,
              credits_expire: null,
              has_active_credits: false,
            };
          }
        })
      );

      // Get total count for pagination
      const totalCountQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        INNER JOIN call_sessions cs ON (u.id = cs.caller_id OR u.id = cs.receiver_id)
        WHERE u.role = 'user'
      `;
      
      const totalResults = await safeExecute(connection, totalCountQuery, []) as any[];
      const totalUsers = totalResults[0]?.total || 0;

      console.log(`Successfully processed ${enrichedUsers.length} users`);

      return NextResponse.json({
        users: enrichedUsers,
        pagination: {
          page,
          limit,
          total: Number(totalUsers),
          totalPages: Math.ceil(Number(totalUsers) / limit),
        },
      });

    } catch (queryError) {
      console.error("Error fetching all users:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch users with call activity" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("=== API Error ===", {
      message: (error as Error).message,
      stack: (error as Error).stack?.substring(0, 500),
      userId: request.nextUrl.searchParams.get("userId"),
    });

    return NextResponse.json(
      { 
        error: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { 
          details: (error as Error).message 
        })
      },
      { status: 500 }
    );

  } finally {
    if (connection) {
      try {
        connection.release();
        console.log("Database connection released");
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
    console.log("=== API request completed ===");
  }
}