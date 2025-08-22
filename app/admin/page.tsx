"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, Filter, Eye, Ban, CheckCircle, XCircle, Calendar, MapPin, User, 
  CreditCard, Heart, FileText, DollarSign, Clock, Loader2, Mail, Phone, Settings
} from "lucide-react"
import Image from "next/image"
import AdminSettings from "@/components/admin/AdminSettings"
import ReactCountryFlag from "react-country-flag"

const countryCodes = [
  { code: "+1", countryCode: "US", country: "US" },
  { code: "+44", countryCode: "GB", country: "UK" },
  { code: "+91", countryCode: "IN", country: "IN" },
]
interface AuthContext {
  login: (identifier: string, password: string, role: string) => Promise<boolean>
}

// Admin Login Component
function AdminLogin() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth() as AuthContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate inputs
    if (!identifier.trim()) {
      setError("Please enter a username, email, or phone number")
      setIsLoading(false)
      return
    }
    if (isPhone && !countryCode) {
      setError("Please select a country code for phone number")
      setIsLoading(false)
      return
    }

    // Combine country code with phone number if applicable
    const finalIdentifier = isPhone ? `${countryCode}${identifier}` : identifier

    try {
      const success = await login(finalIdentifier, password, "admin")
      
      if (success) {
        router.push("/admin")
      } else {
        setError("Invalid credentials or insufficient permissions")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Login error:", error) // Log error for debugging
    } finally {
      setIsLoading(false)
    }
  }

  // Determine input type for icon and placeholder
  const isEmail = identifier.includes("@")
  const isPhone = /^\d+$/.test(identifier.trim())
  const isUsername = !isEmail && !isPhone && identifier.trim().length > 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-gray-800">Admin Access</CardTitle>
          <CardDescription>Enter your admin credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier">Username, Email, or Phone</Label>
              <div className="relative flex items-center">
                {isPhone && (
                  <Select 
                    value={countryCode} 
                    onValueChange={setCountryCode}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px] mr-2">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map(({ code, countryCode, country }) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center">
                            <ReactCountryFlag
                              countryCode={countryCode}
                              svg
                              className="mr-2"
                              style={{ width: "1.5em", height: "1.5em" }}
                            />
                            {code} ({country})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative flex-1">
                  <Input
                    id="identifier"
                    type="text"
                    placeholder={isPhone ? "Enter phone number" : "Enter username, email, or phone"}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className={isPhone ? "pl-4" : "pl-10"}
                    disabled={isLoading}
                  />
                  {!isPhone && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {isEmail ? (
                        <Mail className="h-4 w-4 text-gray-400" />
                      ) : isUsername ? (
                        <User className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Phone className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
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
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access Admin Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Stats Cards Component
function StatsCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
  )
}

// Interfaces
interface UserProfile {
  id: number
  user_id: number
  name: string
  email: string
  phone: string
  age: number
  gender: string
  height?: string
  weight?: string
  caste: string
  religion: string
  mother_tongue?: string
  marital_status: string
  education: string
  occupation: string
  income?: string
  state: string
  city: string
  family_type?: string
  family_status?: string
  about_me?: string
  partner_preferences?: string
  profile_photo: string
  status: "pending" | "approved" | "rejected"
  rejection_reason?: string
  created_at: string
  updated_at?: string
}

interface Payment {
  id: number
  transaction_id: string
  amount: number
  payment_method: string
  screenshot: string
  status: "pending" | "verified" | "rejected"
  admin_notes?: string
  created_at: string
  verified_at?: string
  user_id: number
  user_name: string
  user_email: string
  plan_name: string
  plan_price: number
  verified_by_name?: string
}

interface PotentialMatch {
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
  profile_photo: string
  already_matched: number
}

interface CurrentMatch {
  id: number
  name: string
  age: number
  gender: string
  caste: string
  state: string
  city: string
  matched_at: string
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profiles")
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([])
  const [currentMatches, setCurrentMatches] = useState<CurrentMatch[]>([])
  const [selectedMatches, setSelectedMatches] = useState<number[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [viewDialog, setViewDialog] = useState<{
    open: boolean
    profile: UserProfile | null
  }>({
    open: false,
    profile: null
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
  })

  const [filters, setFilters] = useState({
    search: "",
    caste: "",
    ageMin: "",
    ageMax: "",
    state: "",
    gender: "",
    status: "",
  })

  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean
    profile: UserProfile | null
    action: "approve" | "reject" | null
    rejectionReason: string
  }>({
    open: false,
    profile: null,
    action: null,
    rejectionReason: ""
  })

  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean
    payment: Payment | null
    action: "verify" | "reject" | null
    adminNotes: string
  }>({
    open: false,
    payment: null,
    action: null,
    adminNotes: ""
  })

  useEffect(() => {
    if (user?.role === "admin" && !loading) {
      fetchProfiles()
      fetchStats()
      fetchPayments()
    }
  }, [user, loading])

  // Apply filters
  useEffect(() => {
    let filtered = profiles

    if (filters.search) {
      filtered = filtered.filter(
        (profile) =>
          profile.name &&
          (profile.name.toLowerCase().includes(filters.search.toLowerCase()) ||
           profile.email.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    if (filters.caste && filters.caste !== "all") {
      filtered = filtered.filter((profile) => profile.caste === filters.caste)
    }

    if (filters.ageMin) {
      filtered = filtered.filter((profile) => profile.age >= Number.parseInt(filters.ageMin))
    }

    if (filters.ageMax) {
      filtered = filtered.filter((profile) => profile.age <= Number.parseInt(filters.ageMax))
    }

    if (filters.state && filters.state !== "all") {
      filtered = filtered.filter((profile) => profile.state === filters.state)
    }

    if (filters.gender && filters.gender !== "all") {
      filtered = filtered.filter((profile) => profile.gender === filters.gender)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((profile) => profile.status === filters.status)
    }

    setFilteredProfiles(filtered)
  }, [filters, profiles])

  // Fetch profiles
  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const profilesData = Array.isArray(data)
          ? data.filter((profile: UserProfile) => profile.name && typeof profile.name === 'string' && profile.name.length > 0)
          : []
        setProfiles(profilesData)
        setFilteredProfiles(profilesData)
        setError(null)
      } else {
        setProfiles([])
        setFilteredProfiles([])
        setError("Failed to load profiles. Please try again.")
      }
    } catch (error) {
      setProfiles([])
      setFilteredProfiles([])
      setError("Network error while fetching profiles. Please check your connection.")
    } finally {
      setLoadingProfiles(false)
    }
  }

  // Fetch stats
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

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  // Fetch matches
  const fetchMatches = async (userId: number) => {
    setLoadingMatches(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/matches?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPotentialMatches(data.potentialMatches || [])
        setCurrentMatches(data.currentMatches || [])
        setUserProfile(data.userProfile || null)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoadingMatches(false)
    }
  }

  // Handle profile approval
  const handleProfileApproval = async () => {
    if (!approvalDialog.profile || !approvalDialog.action) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/approve-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileId: approvalDialog.profile.id,
          status: approvalDialog.action === "approve" ? "approved" : "rejected",
          rejectionReason: approvalDialog.rejectionReason,
        }),
      })

      if (response.ok) {
        fetchProfiles()
        fetchStats()
        setApprovalDialog({ open: false, profile: null, action: null, rejectionReason: "" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  // Handle payment verification
  const handlePaymentVerification = async () => {
    if (!paymentDialog.payment || !paymentDialog.action) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: paymentDialog.payment.id,
          status: paymentDialog.action === "verify" ? "verified" : "rejected",
          adminNotes: paymentDialog.adminNotes,
        }),
      })

      if (response.ok) {
        fetchPayments()
        setPaymentDialog({ open: false, payment: null, action: null, adminNotes: "" })
      }
    } catch (error) {
      console.error("Error updating payment:", error)
    }
  }

  // Update user status
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

  // Create matches
  const handleCreateMatches = async () => {
    if (!selectedUserId || selectedMatches.length === 0) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          matchedUserIds: selectedMatches,
        }),
      })

      if (response.ok) {
        fetchMatches(selectedUserId)
        setSelectedMatches([])
      }
    } catch (error) {
      console.error("Error creating matches:", error)
    }
  }

  // Remove match
  const handleRemoveMatch = async (matchedUserId: number) => {
    if (!selectedUserId) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/matches", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          matchedUserId,
        }),
      })

      if (response.ok) {
        fetchMatches(selectedUserId)
      }
    } catch (error) {
      console.error("Error removing match:", error)
    }
  }

  // Get unique values for filters
  const getUniqueValues = (key: keyof UserProfile) => {
    if (!Array.isArray(profiles)) {
      return []
    }
    return [...new Set(profiles.map((profile) => profile[key]))].filter(Boolean)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show login if not admin
  if (!user || user.role !== "admin") {
    return <AdminLogin />
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
                <p className="text-sm text-gray-600">Manage matrimonial profiles and system</p>
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
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Profiles
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Matchmaking
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profiles Tab */}
          <TabsContent value="profiles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Profiles
                </CardTitle>
                <CardDescription>Filter profiles by various criteria</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProfiles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profiles...</p>
                  </div>
                ) : (
                  <>
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
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
                  </>
                )}
              </CardContent>
            </Card>

            {!loadingProfiles && (
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
                            <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{profile.name || 'Unknown User'}</h3>
                              <Badge
                                variant={
                                  profile.status === "approved"
                                    ? "default"
                                    : profile.status === "rejected"
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
                              <span>{profile.gender}</span>
                            </div>
                            {profile.status === "rejected" && profile.rejection_reason && (
                              <p className="text-sm text-red-600">Reason: {profile.rejection_reason}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setViewDialog({ open: true, profile })}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          {profile.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  setApprovalDialog({
                                    open: true,
                                    profile,
                                    action: "approve",
                                    rejectionReason: "",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setApprovalDialog({
                                    open: true,
                                    profile,
                                    action: "reject",
                                    rejectionReason: "",
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {profile.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(profile.user_id)
                                fetchMatches(profile.user_id)
                                setActiveTab("matches")
                              }}
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              Create Matches
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateUserStatus(profile.user_id, "banned")}
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
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Verification
                </CardTitle>
                <CardDescription>Review and verify user payments</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payments...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{payment.user_name || 'Unknown User'}</h3>
                            <Badge
                              variant={
                                payment.status === "verified"
                                  ? "default"
                                  : payment.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{payment.user_email}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              ₹{payment.amount} - {payment.plan_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {payment.transaction_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(payment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {payment.admin_notes && (
                            <p className="text-sm text-gray-600">Notes: {payment.admin_notes}</p>
                          )}
                          {payment.verified_by_name && payment.verified_at && (
                            <p className="text-sm text-green-600">
                              Verified by {payment.verified_by_name} on{" "}
                              {new Date(payment.verified_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {payment.screenshot && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={payment.screenshot} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                View Screenshot
                              </a>
                            </Button>
                          )}

                          {payment.status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  setPaymentDialog({
                                    open: true,
                                    payment,
                                    action: "verify",
                                    adminNotes: "",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setPaymentDialog({
                                    open: true,
                                    payment,
                                    action: "reject",
                                    adminNotes: "",
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {payments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No payments found</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchmaking Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Manual Matchmaking
                </CardTitle>
                <CardDescription>Create matches between approved profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User Selection */}
                  <div>
                    <Label className="text-sm font-medium">Select User to Create Matches For:</Label>
                    <Select
                      value={selectedUserId?.toString() || ""}
                      onValueChange={(value) => {
                        const userId = Number.parseInt(value)
                        setSelectedUserId(userId)
                        fetchMatches(userId)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles
                          .filter((p) => p.status === "approved")
                          .map((profile) => (
                            <SelectItem key={profile.user_id} value={profile.user_id.toString()}>
                              {profile.name || 'Unknown User'} ({profile.age}y, {profile.gender}, {profile.caste})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUserId && userProfile && (
                    <>
                      {/* User Info */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900">
                          Creating matches for: {(profiles.find((p) => p.user_id === selectedUserId)?.name || 'Unknown User')}
                        </h3>
                        <p className="text-sm text-blue-700">
                          {userProfile.age} years, {userProfile.gender}, {userProfile.caste}, {userProfile.state}
                        </p>
                      </div>

                      {loadingMatches ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading potential matches...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Potential Matches */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium">
                                Potential Matches ({potentialMatches.filter((m) => !m.already_matched).length})
                              </h3>
                              {selectedMatches.length > 0 && (
                                <Button onClick={handleCreateMatches} size="sm">
                                  Create {selectedMatches.length} Match(es)
                                </Button>
                              )}
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {potentialMatches
                                .filter((match) => !match.already_matched)
                                .map((match) => (
                                  <div
                                    key={match.id}
                                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                                  >
                                    <Checkbox
                                      checked={selectedMatches.includes(match.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedMatches([...selectedMatches, match.id])
                                        } else {
                                          setSelectedMatches(selectedMatches.filter((id) => id !== match.id))
                                        }
                                      }}
                                    />
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={match.profile_photo || "/placeholder.svg"} />
                                      <AvatarFallback>{match.name && match.name.length > 0 ? match.name.charAt(0) : '?'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{match.name || 'Unknown User'}</p>
                                      <p className="text-xs text-gray-500">
                                        {match.age}y, {match.caste}, {match.city}, {match.state}
                                      </p>
                                      <p className="text-xs text-gray-400">{match.occupation}</p>
                                    </div>
                                  </div>
                                ))}
                              {potentialMatches.filter((m) => !m.already_matched).length === 0 && (
                                <div className="text-center py-4 text-gray-500">No potential matches found</div>
                              )}
                            </div>
                          </div>

                          {/* Current Matches */}
                          <div>
                            <h3 className="font-medium mb-4">Current Matches ({currentMatches.length})</h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {currentMatches.map((match) => (
                                <div
                                  key={match.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{match.name && match.name.length > 0 ? match.name.charAt(0) : '?'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{match.name || 'Unknown User'}</p>
                                      <p className="text-xs text-gray-500">
                                        {match.age}y, {match.caste}, {match.city}, {match.state}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Matched: {new Date(match.matched_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveMatch(match.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                              {currentMatches.length === 0 && (
                                <div className="text-center py-4 text-gray-500">No current matches</div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <AdminSettings 
              userId={user.id} 
              onUserAdded={() => {
                fetchProfiles()
                fetchStats()
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Approval Dialog */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalDialog.action === "approve" ? "Approve Profile" : "Reject Profile"}
            </DialogTitle>
            <DialogDescription>
              {approvalDialog.action === "approve"
                ? "Are you sure you want to approve this profile?"
                : "Please provide a reason for rejecting this profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvalDialog.profile && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{approvalDialog.profile.name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600">{approvalDialog.profile.email}</p>
                <p className="text-sm text-gray-500">
                  {approvalDialog.profile.age}y, {approvalDialog.profile.gender}, {approvalDialog.profile.caste}
                </p>
              </div>
            )}
            
            {approvalDialog.action === "reject" && (
              <div>
                <Label className="text-sm font-medium">Rejection Reason</Label>
                <Textarea
                  value={approvalDialog.rejectionReason}
                  onChange={(e) =>
                    setApprovalDialog({ ...approvalDialog, rejectionReason: e.target.value })
                  }
                  placeholder="Enter reason for rejection..."
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setApprovalDialog({ open: false, profile: null, action: null, rejectionReason: "" })}
              >
                Cancel
              </Button>
              <Button
                variant={approvalDialog.action === "approve" ? "default" : "destructive"}
                onClick={handleProfileApproval}
                disabled={approvalDialog.action === "reject" && !approvalDialog.rejectionReason.trim()}
              >
                {approvalDialog.action === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentDialog.action === "verify" ? "Verify Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {paymentDialog.action === "verify"
                ? "Confirm that this payment has been verified."
                : "Please provide a reason for rejecting this payment."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {paymentDialog.payment && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium">{paymentDialog.payment.user_name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-600">{paymentDialog.payment.user_email}</p>
                <p className="text-sm text-gray-500">
                  ₹{paymentDialog.payment.amount} - {paymentDialog.payment.plan_name}
                </p>
                <p className="text-sm text-gray-500">Transaction ID: {paymentDialog.payment.transaction_id}</p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium">Admin Notes</Label>
              <Textarea
                value={paymentDialog.adminNotes}
                onChange={(e) =>
                  setPaymentDialog({ ...paymentDialog, adminNotes: e.target.value })
                }
                placeholder="Add any notes about this payment verification..."
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setPaymentDialog({ open: false, payment: null, action: null, adminNotes: "" })}
              >
                Cancel
              </Button>
              <Button
                variant={paymentDialog.action === "verify" ? "default" : "destructive"}
                onClick={handlePaymentVerification}
              >
                {paymentDialog.action === "verify" ? "Verify Payment" : "Reject Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
            <DialogDescription>Complete information for {viewDialog.profile?.name || 'Unknown User'}</DialogDescription>
          </DialogHeader>
          {viewDialog.profile && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={viewDialog.profile.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback>{viewDialog.profile.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{viewDialog.profile.name || 'Unknown User'}</h3>
                    <Badge
                      variant={
                        viewDialog.profile.status === "approved"
                          ? "default"
                          : viewDialog.profile.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {viewDialog.profile.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{viewDialog.profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{viewDialog.profile.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{viewDialog.profile.age} years</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{viewDialog.profile.gender}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Caste: </span>{viewDialog.profile.caste}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Religion: </span>{viewDialog.profile.religion}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Marital Status: </span>{viewDialog.profile.marital_status}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Location: </span>{viewDialog.profile.city}, {viewDialog.profile.state}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {viewDialog.profile.height && (
                      <div className="text-sm">
                        <span className="font-medium">Height: </span>{viewDialog.profile.height}
                      </div>
                    )}
                    {viewDialog.profile.weight && (
                      <div className="text-sm">
                        <span className="font-medium">Weight: </span>{viewDialog.profile.weight}
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium">Education: </span>{viewDialog.profile.education}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Occupation: </span>{viewDialog.profile.occupation}
                    </div>
                    {viewDialog.profile.income && (
                      <div className="text-sm">
                        <span className="font-medium">Income: </span>{viewDialog.profile.income}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {viewDialog.profile.mother_tongue && (
                      <div className="text-sm">
                        <span className="font-medium">Mother Tongue: </span>{viewDialog.profile.mother_tongue}
                      </div>
                    )}
                    {viewDialog.profile.family_type && (
                      <div className="text-sm">
                        <span className="font-medium">Family Type: </span>{viewDialog.profile.family_type}
                      </div>
                    )}
                    {viewDialog.profile.family_status && (
                      <div className="text-sm">
                        <span className="font-medium">Family Status: </span>{viewDialog.profile.family_status}
                      </div>
                    )}
                  </div>
                </div>

                {viewDialog.profile.about_me && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">About Me</h4>
                    <p className="text-sm text-gray-600">{viewDialog.profile.about_me}</p>
                  </div>
                )}

                {viewDialog.profile.partner_preferences && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Partner Preferences</h4>
                    <p className="text-sm text-gray-600">{viewDialog.profile.partner_preferences}</p>
                  </div>
                )}

                {viewDialog.profile.status === "rejected" && viewDialog.profile.rejection_reason && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-sm text-red-600">{viewDialog.profile.rejection_reason}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <span className="font-medium">Created: </span>
                  {new Date(viewDialog.profile.created_at).toLocaleDateString()}
                  {viewDialog.profile.updated_at && (
                    <>
                      <span className="mx-2">|</span>
                      <span className="font-medium">Updated: </span>
                      {new Date(viewDialog.profile.updated_at).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setViewDialog({ open: false, profile: null })}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}