"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: number
  email: string
  name: string
  phone?: string
  role: "user" | "admin"
  profileComplete: boolean
}

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string, type: "user" | "admin") => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetch("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
          } else {
            localStorage.removeItem("token")
          }
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (identifier: string, password: string, type: "user" | "admin"): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, type }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)

        if (type === "admin" && data.admin) {
          setUser({
            id: data.admin.id,
            email: data.admin.email,
            name: data.admin.name,
            role: "admin",
            profileComplete: true,
          })
        } else if (type === "user" && data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone,
            role: "user",
            profileComplete: data.user.profileComplete ?? false,
          })
        }

        return true
      }
      return false
    } catch {
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        setUser(data.user)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
