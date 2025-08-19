"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Heart } from "lucide-react"
import Image from "next/image"

interface Profile {
  profile_id: number
  user_id: number
  email: string
  phone: string
  photo: string | null
  contact: string | null
  caste: string | null
  location: string | null
  state: string | null
  gender: "male" | "female"
  age: number | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface Stats {
  totalUsers: number
  pendingProfiles: number
  approvedProfiles: number
  totalMatches: number
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, pendingProfiles: 0, approvedProfiles: 0, totalMatches: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    gender: "all",
    ageMin: "",
    ageMax: "",
    caste: "",
    location: "",
    state: "",
    status: "all",
  })

  useEffect(() => {
    fetchStats()
    fetchProfiles()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "all") queryParams.append(key, value)
      })

      const response = await fetch(`/api/admin/profiles?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfileStatus = async (profileId: number, status: "approved" | "rejected", reason?: string) => {
    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, status, reason }),
      })

      if (response.ok) {
        fetchProfiles()
        fetchStats()
      }
    } catch (error) {
      console.error("Error updating profile status:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  useEffect(() => {
    fetchProfiles()
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
              <div className="border-l border-gray-300 pl-3">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Profiles</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProfiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Profiles</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedProfiles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Age"
                type="number"
                value={filters.ageMin}
                onChange={(e) => handleFilterChange("ageMin", e.target.value)}
              />

              <Input
                placeholder="Max Age"
                type="number"
                value={filters.ageMax}
                onChange={(e) => handleFilterChange("ageMax", e.target.value)}
              />

              <Input
                placeholder="Caste"
                value={filters.caste}
                onChange={(e) => handleFilterChange("caste", e.target.value)}
              />

              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              />

              <Input
                placeholder="State"
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
              />

              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading profiles...</div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.profile_id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {profile.photo && (
                          <Image
                            src={profile.photo || "/placeholder.svg"}
                            alt="Profile"
                            width={60}
                            height={60}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{profile.email}</h3>
                          <p className="text-sm text-gray-600">{profile.phone}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                profile.status === "approved"
                                  ? "default"
                                  : profile.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {profile.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {profile.gender} • {profile.age} years
                            </span>
                          </div>
                        </div>
                      </div>

                      {profile.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateProfileStatus(profile.profile_id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateProfileStatus(profile.profile_id, "rejected", "Profile rejected by admin")
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Caste:</span> {profile.caste || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {profile.location || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">State:</span> {profile.state || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span> {profile.contact || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}

                {profiles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No profiles found matching the current filters.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
