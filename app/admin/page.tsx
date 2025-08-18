"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Filter, Eye, Ban, CheckCircle, XCircle, Calendar, MapPin, User } from "lucide-react"
import Image from "next/image"

interface UserProfile {
  id: number
  name: string
  email: string
  age: number
  gender: string
  caste: string
  religion: string
  state: string
  city: string
  occupation: string
  education: string
  marital_status: string
  profile_photo: string
  status: "active" | "inactive" | "banned"
  created_at: string
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
  })

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    caste: "",
    ageMin: "",
    ageMax: "",
    state: "",
    gender: "",
    status: "",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
      return
    }

    if (user?.role === "admin") {
      fetchProfiles()
      fetchStats()
    }
  }, [user, loading, router])

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles)
        setFilteredProfiles(data.profiles)
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
    } finally {
      setLoadingProfiles(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const updateUserStatus = async (userId: number, status: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, status }),
      })

      if (response.ok) {
        fetchProfiles()
        fetchStats()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = profiles

    if (filters.search) {
      filtered = filtered.filter(
        (profile) =>
          profile.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          profile.email.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.caste) {
      filtered = filtered.filter((profile) => profile.caste === filters.caste)
    }

    if (filters.ageMin) {
      filtered = filtered.filter((profile) => profile.age >= Number.parseInt(filters.ageMin))
    }

    if (filters.ageMax) {
      filtered = filtered.filter((profile) => profile.age <= Number.parseInt(filters.ageMax))
    }

    if (filters.state) {
      filtered = filtered.filter((profile) => profile.state === filters.state)
    }

    if (filters.gender) {
      filtered = filtered.filter((profile) => profile.gender === filters.gender)
    }

    if (filters.status) {
      filtered = filtered.filter((profile) => profile.status === filters.status)
    }

    setFilteredProfiles(filtered)
  }, [filters, profiles])

  const getUniqueValues = (key: keyof UserProfile) => {
    return [...new Set(profiles.map((profile) => profile[key]))].filter(Boolean)
  }

  if (loading || loadingProfiles) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Manage matrimonial profiles</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Site
              </Button>
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
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Male Users</CardTitle>
              <User className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maleUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Female Users</CardTitle>
              <User className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.femaleUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Profiles
            </CardTitle>
            <CardDescription>Filter profiles by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>

              <Select
                value={filters.caste}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, caste: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Caste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Castes</SelectItem>
                  {getUniqueValues("caste").map((caste) => (
                    <SelectItem key={caste} value={caste as string}>
                      {caste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Age"
                  value={filters.ageMin}
                  onChange={(e) => setFilters((prev) => ({ ...prev, ageMin: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Max Age"
                  value={filters.ageMax}
                  onChange={(e) => setFilters((prev) => ({ ...prev, ageMax: e.target.value }))}
                />
              </div>

              <Select
                value={filters.state}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {getUniqueValues("state").map((state) => (
                    <SelectItem key={state} value={state as string}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.gender}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    caste: "all",
                    ageMin: "",
                    ageMax: "",
                    state: "all",
                    gender: "all",
                    status: "all",
                  })
                }
              >
                Clear Filters
              </Button>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredProfiles.length} of {profiles.length} profiles
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Profiles</CardTitle>
            <CardDescription>Manage and moderate user profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profile_photo || "/placeholder.svg"} />
                      <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{profile.name}</h3>
                        <Badge
                          variant={
                            profile.status === "active"
                              ? "default"
                              : profile.status === "banned"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {profile.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {profile.age} years
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profile.city}, {profile.state}
                        </span>
                        <span>{profile.caste}</span>
                        <span>{profile.occupation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {profile.status === "active" ? (
                      <Button variant="outline" size="sm" onClick={() => updateUserStatus(profile.id, "inactive")}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => updateUserStatus(profile.id, "active")}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateUserStatus(profile.id, "banned")}
                      disabled={profile.status === "banned"}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Ban
                    </Button>
                  </div>
                </div>
              ))}

              {filteredProfiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">No profiles found matching your criteria</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
