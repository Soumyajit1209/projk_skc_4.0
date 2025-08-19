"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  // Handle redirects when user state changes
  useEffect(() => {
    if (!loading && user) {
      // Only redirect after authentication if we're on auth pages
      const currentPath = window.location.pathname
      const isAuthPage = ['/login', '/register', '/login/user'].some(path => 
        currentPath.startsWith(path)
      )

      if (isAuthPage) {
        if (user.role === "admin") {
          router.push("/admin")
        } else if (user.role === "user") {
          if (!user.profileComplete) {
            router.push("/profile/create")
          } else {
            router.push("/dashboard")
          }
        }
      }
    }
  }, [user, loading, router])

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

        let userData: User
        
        if (type === "admin" && data.admin) {
          userData = {
            id: data.admin.id,
            email: data.admin.email,
            name: data.admin.name,
            role: "admin",
            profileComplete: true,
          }
        } else if (type === "user" && data.user) {
          userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone,
            role: "user",
            profileComplete: data.user.profileComplete ?? false,
          }
        } else {
          return false
        }

        setUser(userData)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const register = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          phone: data.user.phone,
          role: data.user.role,
          profileComplete: data.user.profileComplete,
        }
        setUser(userData)
        
        // Redirect to profile creation after registration
        router.push("/profile/create")
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
    router.push("/")
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