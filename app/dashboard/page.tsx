"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, User, Settings, LogOut, Search, Filter } from "lucide-react"
import Image from "next/image"

interface UserProfile {
  id: number
  name: string
  age: number
  gender: string
  caste: string
  religion: string
  state: string
  city: string
  occupation: string
  education: string
  profile_photo: string
  about_me: string
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<UserProfile[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)

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
      const response = await fetch("/api/matches", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
              <div>
                <p className="text-sm text-gray-600">Find your perfect match</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              {user?.role === "admin" && (
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  Admin Panel
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">{userProfile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{userProfile?.name}</CardTitle>
                <CardDescription>
                  {userProfile?.age} years • {userProfile?.city}, {userProfile?.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Profession:</span>
                    <span className="text-sm font-medium">{userProfile?.occupation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Education:</span>
                    <span className="text-sm font-medium">{userProfile?.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Religion:</span>
                    <span className="text-sm font-medium">{userProfile?.religion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Caste:</span>
                    <span className="text-sm font-medium">{userProfile?.caste}</span>
                  </div>
                </div>

                {userProfile?.about_me && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">About Me</h4>
                    <p className="text-sm text-gray-600">{userProfile.about_me}</p>
                  </div>
                )}

                <div className="space-y-2 pt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    View Public Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your matrimonial journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-16 bg-rose-600 hover:bg-rose-700">
                    <Search className="h-5 w-5 mr-2" />
                    Search Profiles
                  </Button>
                  <Button variant="outline" className="h-16 bg-transparent">
                    <Filter className="h-5 w-5 mr-2" />
                    Advanced Search
                  </Button>
                  <Button variant="outline" className="h-16 bg-transparent">
                    <Heart className="h-5 w-5 mr-2" />
                    My Interests
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Matches */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Recommended Matches</CardTitle>
                <CardDescription>Profiles that match your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matches.slice(0, 4).map((match) => (
                      <div key={match.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={match.profile_photo || "/placeholder.svg"} />
                            <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{match.name}</h3>
                            <p className="text-sm text-gray-600">
                              {match.age} years • {match.city}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm">
                            <span className="text-gray-600">Profession:</span> {match.occupation}
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Education:</span> {match.education}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700">
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Heart className="h-4 w-4 mr-1" />
                            Interest
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No matches found yet. Try updating your preferences!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Your profile was viewed 5 times today</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">2 new profile matches available</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                    <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                    <span className="text-sm">1 interest received from premium member</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
