"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Shield } from "lucide-react"
import Image from "next/image"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const success = await login(email, password, "admin")

    if (success) {
      router.push("/admin")
    } else {
      setError("Invalid admin credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Login Options
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
          </div>
          <p className="text-gray-600">Admin access only</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">Admin Sign In</CardTitle>
            <CardDescription>Enter admin credentials to access dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 bg-gray-600 hover:bg-gray-700" disabled={loading}>
                {loading ? "Signing In..." : "Admin Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">Admin accounts are created by system administrators only</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
