"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, Settings, LogOut, CreditCard, Check, Crown, Star, Zap, QrCode, Copy, Edit, Save, X, 
  User, MapPin, Briefcase, GraduationCap, Bell, Search, Filter, Phone, MessageCircle, 
  Users, Calendar, DollarSign, Home, UserCheck, Clock, PhoneCall, Video, Mail, Info, Lock,
  Eye, EyeOff, Shield, Headphones, History, Timer, FileText, Sparkles
} from "lucide-react"
import Image from "next/image"

interface UserProfile {
  id: number
  name: string
  email: string
  phone: string
  age: number
  gender: string
  height: string
  weight: string
  caste: string
  religion: string
  mother_tongue: string
  marital_status: string
  education: string
  occupation: string
  income: string
  state: string
  city: string
  family_type: string
  family_status: string
  about_me: string
  partner_preferences: string
  profile_photo: string
  matched_at?: string
  created_by_admin?: number
  matched_by_admin_name?: string
  distance?: number
  compatibility_score?: number
}

interface Plan {
  id: number
  name: string
  price: number
  duration_months: number
  features: string[]
  description: string
  type: 'normal' | 'call'
  call_credits?: number
  can_view_details?: boolean
  can_make_calls?: boolean
}

interface ActivePlan {
  normal_plan?: {
    plan_name: string
    price: number
    duration_months: number
    expires_at: string
    daysLeft: number
    isActive: boolean
  }
  call_plan?: {
    plan_name: string
    credits_remaining: number
    expires_at: string
    daysLeft: number
    isActive: boolean
  }
}

interface CallLog {
  id: number
  caller_name: string
  receiver_name: string
  duration: number
  cost: number
  created_at: string
  call_type: 'outgoing' | 'incoming'
  masked_number: string
}

interface SearchFilters {
  location: string
  gender: string
  ageMin: string
  ageMax: string
  religion: string
  education: string
  occupation: string
}

export default function EnhancedDashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  
  // State management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<UserProfile[]>([])
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  
  // Modal states
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showProfileDetails, setShowProfileDetails] = useState(false)
  const [showCallLogs, setShowCallLogs] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Data states
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [activePlans, setActivePlans] = useState<ActivePlan>({})
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [selectedMatch, setSelectedMatch] = useState<UserProfile | null>(null)
  
  // Search and filter states
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',
    gender: '',
    ageMin: '',
    ageMax: '',
    religion: '',
    education: '',
    occupation: ''
  })
  
  // Loading states
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [loadingCallLogs, setLoadingCallLogs] = useState(false)
  const [makingCall, setMakingCall] = useState(false)
  
  // Active tab
  const [activeTab, setActiveTab] = useState('matches')

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login/user")
      return
    }

    if (user && !user.profileComplete) {
      router.push("/profile/create")
      return
    }

    if (user) {
      fetchUserProfile()
      fetchMatches()
      fetchActivePlans()
    }
  }, [user, loading, router])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/matches", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setLoadingMatches(false)
    }
  }

  const searchProfiles = async () => {
    setLoadingSearch(true)
    try {
      const token = localStorage.getItem("token")
      const queryParams = new URLSearchParams()
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const response = await fetch(`/api/user/search?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.profiles || [])
      }
    } catch (error) {
      console.error("Error searching profiles:", error)
    } finally {
      setLoadingSearch(false)
    }
  }

  const fetchActivePlans = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/active-plans", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setActivePlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching active plans:", error)
    }
  }

 const fetchCallLogs = async () => {
  setLoadingCallLogs(true)
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("/api/user/call-logs", {  // Correct endpoint
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const data = await response.json()
      setCallLogs(data.logs || [])
    } else {
      console.error("Failed to fetch call logs")
      setCallLogs([])
    }
  } catch (error) {
    console.error("Error fetching call logs:", error)
    setCallLogs([])
  } finally {
    setLoadingCallLogs(false)
  }
}

const fetchPlansFromAPI = async () => {
  setLoadingPlans(true)
  try {
    const response = await fetch("/api/plans")
    if (response.ok) {
      const data = await response.json()
      setPlans(data.plans)
    } else {
      console.error("Failed to fetch plans")
    }
  } catch (error) {
    console.error("Error fetching plans:", error)
  } finally {
    setLoadingPlans(false)
  }
}

  const initiateCall = async (targetUserId: number, targetName: string) => {
    // Check if user has call plan
    if (!activePlans.call_plan?.isActive) {
      setShowUpgradeModal(true)
      return
    }

    if (activePlans.call_plan.credits_remaining <= 0) {
      setShowUpgradeModal(true)
      return
    }

    setMakingCall(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Exotel call interface or show call UI
        window.location.href = data.callUrl
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to initiate call")
      }
    } catch (error) {
      console.error("Error initiating call:", error)
      alert("An error occurred while making the call")
    } finally {
      setMakingCall(false)
    }
  }

  const viewProfileDetails = async (profileId: number) => {
  // Check if user has access to view details
  if (!activePlans.normal_plan?.isActive) {
    setShowUpgradeModal(true)
    return
  }

  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`/api/user/profile-details/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      const data = await response.json()
      setSelectedMatch(data.profile)
      setShowProfileDetails(true)
    } else {
      const errorData = await response.json()
      if (errorData.error.includes("Premium subscription required")) {
        setShowUpgradeModal(true)
      } else {
        alert(errorData.error || "Failed to fetch profile details")
      }
    }
  } catch (error) {
    console.error("Error fetching profile details:", error)
    alert("An error occurred while fetching profile details")
  }
}

  const handleSearchFilterChange = (key: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetSearchFilters = () => {
    setSearchFilters({
      location: '',
      gender: '',
      ageMin: '',
      ageMax: '',
      religion: '',
      education: '',
      occupation: ''
    })
    setSearchResults([])
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

 const renderProfileCard = (profile: UserProfile, isSearchResult = false) => {
  const hasNormalPlan = activePlans.normal_plan?.isActive
  const hasCallPlan = activePlans.call_plan?.isActive
  const isBlurred = isSearchResult && !hasNormalPlan

  return (
    <div key={profile.id} className={`bg-white border rounded-lg hover:shadow-md transition-all hover:border-blue-300 ${isBlurred ? 'relative' : ''}`}>
      {isBlurred && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center p-4">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Premium Feature</p>
            <p className="text-xs text-gray-600 mb-3">Upgrade to view full details</p>
            <Button size="sm" onClick={() => {
              fetchPlansFromAPI()
              setShowUpgradeModal(true)
            }} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-14 w-14 border-2 border-blue-100">
              <AvatarImage src={!isBlurred ? profile.profile_photo : "/placeholder.svg"} />
              <AvatarFallback className="text-base font-semibold text-blue-500 bg-blue-50">
                {!isBlurred ? profile.name.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {!isBlurred ? profile.name : `${profile.gender} • ${profile.age} years`}
                </h3>
                {profile.created_by_admin && (
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 px-1.5">
                    <Crown className="h-3 w-3 mr-1" />
                    Expert
                  </Badge>
                )}
                {profile.compatibility_score && (
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50 px-1.5">
                    <Star className="h-3 w-3 mr-1" />
                    {profile.compatibility_score}% Match
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 space-x-3 mt-1">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {profile.age} yrs
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {profile.city}
                </span>
                {profile.distance && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.distance}km away
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                <span>{profile.education}</span>
                <span>•</span>
                <span>{profile.religion}</span>
                {profile.height && !isBlurred && (
                  <>
                    <span>•</span>
                    <span>{profile.height}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <div className="flex space-x-2">
              <Button 
                onClick={() => viewProfileDetails(profile.id)}
                size="sm"
                variant="outline"
                className="px-3 py-1 text-xs"
                disabled={isBlurred}
              >
                {isBlurred ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Locked
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => initiateCall(profile.id, profile.name)}
                size="sm"
                className={`px-3 py-1 text-xs ${
                  hasCallPlan 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!hasCallPlan || makingCall}
              >
                {makingCall ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <>
                    <PhoneCall className="h-3 w-3 mr-1" />
                    {hasCallPlan ? 'Call' : 'Locked'}
                  </>
                )}
              </Button>
            </div>
            
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
              disabled={isBlurred}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
              <div className="ml-6 hidden sm:flex space-x-1">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Plan Status Indicators */}
              <div className="hidden sm:flex items-center space-x-2">
                {activePlans.normal_plan?.isActive ? (
                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                    <Check className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-200 text-gray-600 bg-gray-50 text-xs">
                    Free
                  </Badge>
                )}
                
                {activePlans.call_plan?.isActive && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-xs">
                    <PhoneCall className="h-3 w-3 mr-1" />
                    {activePlans.call_plan.credits_remaining} calls
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                  <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm bg-blue-100 text-blue-600">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 hidden sm:block">{user?.name}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back, {user?.name}!
          </h1>
          <p className="text-gray-600">Discover meaningful connections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-blue-100">
                    <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                      {userProfile?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile?.name}</h3>
                  <p className="text-sm text-gray-500">{userProfile?.age} years old</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    {userProfile?.city}, {userProfile?.state}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                    {userProfile?.occupation}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full hover:bg-purple-50 hover:border-purple-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Cards */}
            <div className="space-y-3">
              {/* Normal Plan */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Premium Plan</span>
                    {activePlans.normal_plan?.isActive ? (
                      <Badge className="bg-white/20 text-white text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-white text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {activePlans.normal_plan?.isActive ? (
                    <p className="text-xs opacity-90">
                      {activePlans.normal_plan.daysLeft} days remaining
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs opacity-90 mb-2">View full profiles</p>
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white text-xs w-full">
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Call Plan */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Call Plan</span>
                    {activePlans.call_plan?.isActive ? (
                      <Badge className="bg-white/20 text-white text-xs">
                        {activePlans.call_plan.credits_remaining} calls
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-white text-xs">
                        No calls
                      </Badge>
                    )}
                  </div>
                  {activePlans.call_plan?.isActive ? (
                    <p className="text-xs opacity-90">
                      {activePlans.call_plan.daysLeft} days remaining
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs opacity-90 mb-2">Talk to matches</p>
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white text-xs w-full">
                        Buy Credits
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-gray-900">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-blue-50"
                    onClick={() => {
                      fetchCallLogs()
                      setShowCallLogs(true)
                    }}
                  >
                    <History className="h-4 w-4 mr-2 text-blue-500" />
                    Call History
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-purple-50"
                    onClick={() => {
                      fetchPlansFromAPI()
                      setShowPlansModal(true)
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
                    View Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                    <TabsTrigger value="matches" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      <Users className="h-4 w-4 mr-2" />
                      My Matches ({matches.length})
                    </TabsTrigger>
                    <TabsTrigger value="search" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <Search className="h-4 w-4 mr-2" />
                      Search Profiles
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* Matches Tab */}
                  <TabsContent value="matches" className="mt-0">
                    {loadingMatches ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : matches.length > 0 ? (
                      <div className="space-y-4">
                        {matches.map((match) => renderProfileCard(match, false))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                        <p className="text-gray-500 mb-6">Our experts are working to find perfect matches for you.</p>
                        <div className="max-w-md mx-auto">
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-center mb-2">
                              <Crown className="h-5 w-5 text-blue-500 mr-2" />
                              <span className="text-sm font-medium text-blue-800">Expert Matching</span>
                            </div>
                            <p className="text-xs text-blue-700 text-center mb-3">
                              Get curated matches based on compatibility
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => {
                                fetchPlansFromAPI()
                                setShowPlansModal(true)
                              }}
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              Upgrade Plan
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Search Tab */}
                  <TabsContent value="search" className="mt-0">
                    {/* Search Filters */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-blue-500" />
                          Search Filters
                        </h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={resetSearchFilters}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Location</Label>
                          <Input
                            placeholder="City or State"
                            value={searchFilters.location}
                            onChange={(e) => handleSearchFilterChange('location', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Gender</Label>
                          <Select value={searchFilters.gender} onValueChange={(v) => handleSearchFilterChange('gender', v)}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Min Age</Label>
                            <Input
                              type="number"
                              placeholder="18"
                              value={searchFilters.ageMin}
                              onChange={(e) => handleSearchFilterChange('ageMin', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Max Age</Label>
                            <Input
                              type="number"
                              placeholder="65"
                              value={searchFilters.ageMax}
                              onChange={(e) => handleSearchFilterChange('ageMax', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Religion</Label>
                          <Select value={searchFilters.religion} onValueChange={(v) => handleSearchFilterChange('religion', v)}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hindu">Hindu</SelectItem>
                              <SelectItem value="Muslim">Muslim</SelectItem>
                              <SelectItem value="Christian">Christian</SelectItem>
                              <SelectItem value="Sikh">Sikh</SelectItem>
                              <SelectItem value="Buddhist">Buddhist</SelectItem>
                              <SelectItem value="Jain">Jain</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-4">
                        <Button 
                          onClick={searchProfiles}
                          disabled={loadingSearch}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                        >
                          {loadingSearch ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Search Profiles
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Search Results ({searchResults.length})
                          </h4>
                          {!activePlans.normal_plan?.isActive && (
                            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 p-2 text-xs">
                              <AlertDescription>
                                Upgrade to premium to view full details
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {searchResults.map((profile) => renderProfileCard(profile, true))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Search className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
                        <p className="text-gray-500">Use filters above to find compatible profiles</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              Choose Your Perfect Plan
            </DialogTitle>
            <p className="text-center text-gray-600">
              Unlock premium features and find your ideal match
            </p>
          </DialogHeader>
          
          {loadingPlans ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Type Tabs */}
              <Tabs defaultValue="normal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="normal">Premium Plans</TabsTrigger>
                  <TabsTrigger value="call">Call Plans</TabsTrigger>
                </TabsList>
                
                <TabsContent value="normal" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.filter(plan => plan.type === 'normal').map((plan) => (
                      <Card key={plan.id} className="cursor-pointer transition-all hover:shadow-xl border-2 hover:border-blue-300 relative overflow-hidden">
                        {plan.name.toLowerCase().includes('premium') && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                            Popular
                          </div>
                        )}
                        <CardHeader className="text-center pb-4">
                          <div className="flex justify-center mb-3">
                            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                              <Crown className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{plan.price}
                            <span className="text-sm font-normal text-gray-500">/{plan.duration_months}mo</span>
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => {
                              setSelectedPlan(plan)
                              setShowPlansModal(false)
                              setShowPaymentModal(true)
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Choose Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="call" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.filter(plan => plan.type === 'call').map((plan) => (
                      <Card key={plan.id} className="cursor-pointer transition-all hover:shadow-xl border-2 hover:border-green-300 relative overflow-hidden">
                        <CardHeader className="text-center pb-4">
                          <div className="flex justify-center mb-3">
                            <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                              <PhoneCall className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            ₹{plan.price}
                            <span className="text-sm font-normal text-gray-500">/{plan.call_credits} calls</span>
                          </div>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button 
                            onClick={() => {
                              setSelectedPlan(plan)
                              setShowPlansModal(false)
                              setShowPaymentModal(true)
                            }}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          >
                            Buy Credits
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Complete Payment
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{selectedPlan.name}</h3>
                  <Badge className="bg-blue-100 text-blue-700">
                    {selectedPlan.type === 'call' ? 'Call Plan' : 'Premium'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₹{selectedPlan.price}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPlan.type === 'call' 
                    ? `${selectedPlan.call_credits} call credits` 
                    : `Valid for ${selectedPlan.duration_months} month(s)`}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 mb-4">
                  <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Scan QR code to pay</p>
                  <p className="text-xs text-gray-400">or use UPI details below</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-sm text-blue-900">UPI ID</p>
                    <p className="text-sm text-blue-700 font-mono">matchb@paytm</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard('matchb@paytm')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-sm text-green-900">Amount</p>
                    <p className="text-sm text-green-700 font-mono">₹{selectedPlan.price}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(selectedPlan.price.toString())}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  setShowPaymentModal(false)
                  router.push('/payments/submit')
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Payment Completed
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Call Logs Modal */}
      <Dialog open={showCallLogs} onOpenChange={setShowCallLogs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <History className="h-5 w-5 mr-2 text-blue-500" />
              Call History
            </DialogTitle>
          </DialogHeader>
          
          {loadingCallLogs ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : callLogs.length > 0 ? (
            <div className="space-y-3">
              {callLogs.map((log) => (
                <div key={log.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        log.call_type === 'outgoing' 
                          ? 'bg-green-100' 
                          : 'bg-blue-100'
                      }`}>
                        <PhoneCall className={`h-4 w-4 ${
                          log.call_type === 'outgoing' 
                            ? 'text-green-600' 
                            : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {log.call_type === 'outgoing' ? log.receiver_name : log.caller_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.call_type === 'outgoing' ? 'Outgoing call' : 'Incoming call'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(log.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                      <Badge variant="outline" className="text-xs">
                        Cost: ₹{log.cost}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
              <p className="text-gray-500">Your call history will appear here</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center flex items-center justify-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Upgrade Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Premium Feature</h3>
              <p className="text-sm text-gray-600">
                This feature requires an active subscription. Upgrade now to access all premium features.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => {
                  setShowUpgradeModal(false)
                  fetchPlansFromAPI()
                  setShowPlansModal(true)
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                View Plans
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Details Modal */}
      <Dialog open={showProfileDetails} onOpenChange={setShowProfileDetails}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Profile Details</DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-4">
              {/* Enhanced Profile Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                      <AvatarImage src={selectedMatch.profile_photo || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl font-bold text-blue-500 bg-white">
                        {selectedMatch.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedMatch.name}</h2>
                      <div className="flex items-center space-x-3 text-blue-100 text-sm mt-1">
                        <span>{selectedMatch.age} years</span>
                        <span>•</span>
                        <span>{selectedMatch.city}, {selectedMatch.state}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                          {selectedMatch.religion}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                          {selectedMatch.marital_status}
                        </Badge>
                        {selectedMatch.compatibility_score && (
                          <Badge variant="outline" className="text-xs border-white/30 text-white bg-white/20 px-2">
                            <Star className="h-3 w-3 mr-1" />
                            {selectedMatch.compatibility_score}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Personal Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">{selectedMatch.height || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <span className="font-medium">{selectedMatch.mother_tongue || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Caste:</span>
                        <span className="font-medium">{selectedMatch.caste || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-green-50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Professional Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Education:</span>
                        <span className="font-medium">{selectedMatch.education}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupation:</span>
                        <span className="font-medium">{selectedMatch.occupation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">{selectedMatch.income || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-purple-50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      Family Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Family Type:</span>
                        <span className="font-medium">{selectedMatch.family_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Family Status:</span>
                        <span className="font-medium">{selectedMatch.family_status || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Contact Options
                    </h4>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => initiateCall(selectedMatch.id, selectedMatch.name)}
                        disabled={!activePlans.call_plan?.isActive}
                      >
                        <PhoneCall className="h-3 w-3 mr-2" />
                        {activePlans.call_plan?.isActive ? 'Call Now' : 'Call Locked'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                      >
                        <MessageCircle className="h-3 w-3 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* About & Preferences */}
              {(selectedMatch.about_me || selectedMatch.partner_preferences) && (
                <div className="space-y-4">
                  {selectedMatch.about_me && (
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          About {selectedMatch.name.split(' ')[0]}
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedMatch.about_me}</p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedMatch.partner_preferences && (
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-pink-50 to-rose-50">
                      <CardContent className="p-4">
                        <h4 className="text-sm font-semibold text-pink-700 mb-3 flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          Partner Preferences
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedMatch.partner_preferences}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <Button 
                  onClick={() => initiateCall(selectedMatch.id, selectedMatch.name)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={!activePlans.call_plan?.isActive || makingCall}
                >
                  {makingCall ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <PhoneCall className="h-4 w-4 mr-2" />
                  )}
                  {activePlans.call_plan?.isActive ? 'Call Now' : 'Upgrade to Call'}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}