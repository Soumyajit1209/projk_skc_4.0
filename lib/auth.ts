import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function createUser(email: string, phone: string, password: string) {
  const hashedPassword = await hashPassword(password)
  const query = "INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)"
  const result = await executeQuery(query, [email, phone, hashedPassword])
  return result
}

export async function authenticateUser(email: string, password: string) {
  const query = "SELECT user_id, email, phone, password_hash FROM users WHERE email = ?"
  const users = (await executeQuery(query, [email])) as any[]

  if (users.length === 0) {
    return null
  }

  const user = users[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    return null
  }

  return {
    user_id: user.user_id,
    email: user.email,
    phone: user.phone,
  }
}

export async function authenticateAdmin(username: string, password: string) {
  const query = "SELECT admin_id, username, email, password_hash FROM admins WHERE username = ?"
  const admins = (await executeQuery(query, [username])) as any[]

  if (admins.length === 0) {
    return null
  }

  const admin = admins[0]
  const isValid = await verifyPassword(password, admin.password_hash)

  if (!isValid) {
    return null
  }

  return {
    admin_id: admin.admin_id,
    username: admin.username,
    email: admin.email,
  }
}
