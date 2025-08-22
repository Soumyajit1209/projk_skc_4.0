// app/api/admin/plans/[id]/route.ts
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

// Update a plan (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const planId = parseInt(params.id)
    
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, price, duration_months, features, description, is_active } = body

    const connection = await mysql.createConnection(dbConfig)

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if plan exists
    const [existingPlan] = await connection.execute("SELECT id, name FROM plans WHERE id = ?", [planId])
    if ((existingPlan as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // If updating specific fields only (like status toggle)
    if (Object.keys(body).length === 1 && 'is_active' in body) {
      await connection.execute(
        "UPDATE plans SET is_active = ?, updated_at = NOW() WHERE id = ?",
        [is_active, planId]
      )
    } else {
      // Full update
      if (!name || price === undefined || duration_months === undefined) {
        await connection.end()
        return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
      }

      if (price <= 0) {
        await connection.end()
        return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 })
      }

      if (duration_months <= 0) {
        await connection.end()
        return NextResponse.json({ error: "Duration must be greater than 0" }, { status: 400 })
      }

      // Check if plan name already exists (excluding current plan)
      const [duplicatePlan] = await connection.execute(
        "SELECT id FROM plans WHERE name = ? AND id != ?", 
        [name, planId]
      )
      if ((duplicatePlan as any[]).length > 0) {
        await connection.end()
        return NextResponse.json({ error: "Plan with this name already exists" }, { status: 409 })
      }

      await connection.execute(
        `UPDATE plans SET 
         name = ?, price = ?, duration_months = ?, features = ?, 
         description = ?, is_active = ?, updated_at = NOW() 
         WHERE id = ?`,
        [
          name.trim(), 
          price, 
          duration_months, 
          features?.trim() || null, 
          description?.trim() || null, 
          is_active !== undefined ? is_active : true, 
          planId
        ]
      )
    }

    await connection.end()

    return NextResponse.json({ 
      success: true, 
      message: "Plan updated successfully" 
    })
  } catch (error) {
    console.error("Plan update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a plan (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    const planId = parseInt(params.id)
    
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    const connection = await mysql.createConnection(dbConfig)

    // Verify admin role
    const [adminRows] = await connection.execute("SELECT role FROM users WHERE id = ?", [decoded.userId])
    const admin = (adminRows as any[])[0]
    if (!admin || admin.role !== "admin") {
      await connection.end()
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if plan exists
    const [existingPlan] = await connection.execute("SELECT id FROM plans WHERE id = ?", [planId])
    if ((existingPlan as any[]).length === 0) {
      await connection.end()
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if plan is being used in any active payments
    const [activePayments] = await connection.execute(
      "SELECT COUNT(*) as count FROM payments WHERE plan_id = ? AND status = 'verified'", 
      [planId]
    )
    
    if ((activePayments as any[])[0].count > 0) {
      await connection.end()
      return NextResponse.json({ 
        error: "Cannot delete plan with active payments. Consider deactivating instead." 
      }, { status: 400 })
    }

    // Delete the plan
    await connection.execute("DELETE FROM plans WHERE id = ?", [planId])

    await connection.end()

    return NextResponse.json({ 
      success: true, 
      message: "Plan deleted successfully" 
    })
  } catch (error) {
    console.error("Plan deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}