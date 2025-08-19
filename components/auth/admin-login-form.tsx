"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Phone } from "lucide-react"

export function AdminLoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, type: "admin" }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isEmail = identifier.includes("@")
  const isPhone = /^\d+$/.test(identifier)
  const isUsername = !isEmail && !isPhone && identifier.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="identifier">Username, Email, or Phone</Label>
        <div className="relative">
          <Input
            id="identifier"
            type="text"
            placeholder="Enter username, email, or phone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {isEmail ? (
              <Mail className="h-4 w-4 text-gray-400" />
            ) : isPhone ? (
              <Phone className="h-4 w-4 text-gray-400" />
            ) : (
              <User className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-700" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In as Admin"
        )}
      </Button>
    </form>
  )
}
