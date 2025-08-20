"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/file-upload"
import { Heart, Settings, LogOut, CreditCard, Check, Crown, Star, Zap, QrCode, Copy, Edit, Save, X, User, MapPin, Briefcase, GraduationCap, Bell, Search, Filter } from "lucide-react"
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

interface Plan {
  id: number
  name: string
  price: number
  duration_months: number
  features: string
  description: string
}

interface ActivePlan {
  plan_name: string
  price: number
  duration_months: number
  expires_at: string
  daysLeft: number
  isActive: boolean
}

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<UserProfile[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState(false)
  const [editFormData, setEditFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    caste: "",
    religion: "",
    mother_tongue: "",
    marital_status: "",
    education: "",
    occupation: "",
    income: "",
    state: "",
    city: "",
    family_type: "",
    family_status: "",
    about_me: "",
    partner_preferences: "",
    profile_photo: "",
  })

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
      fetchActivePlan()
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
        setEditFormData({
          age: data.profile.age?.toString() || "",
          gender: data.profile.gender || "",
          height: data.profile.height || "",
          weight: data.profile.weight || "",
          caste: data.profile.caste || "",
          religion: data.profile.religion || "",
          mother_tongue: data.profile.mother_tongue || "",
          marital_status: data.profile.marital_status || "",
          education: data.profile.education || "",
          occupation: data.profile.occupation || "",
          income: data.profile.income || "",
          state: data.profile.state || "",
          city: data.profile.city || "",
          family_type: data.profile.family_type || "",
          family_status: data.profile.family_status || "",
          about_me: data.profile.about_me || "",
          partner_preferences: data.profile.partner_preferences || "",
          profile_photo: data.profile.profile_photo || "",
        })
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
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  const fetchActivePlan = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/user/active-plan", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setActivePlan(data.activePlan)
      }
    } catch (error) {
      console.error("Error fetching active plan:", error)
    }
  }

  const fetchPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await fetch("/api/plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleBrowsePlans = () => {
    setShowPlansModal(true)
    fetchPlans()
  }

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowPlansModal(false)
    setShowPaymentModal(true)
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
    setEditError("")
    setEditSuccess(false)
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditingProfile(true)
    setEditError("")
    setEditSuccess(false)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      })

      const data = await response.json()

      if (response.ok) {
        setEditSuccess(true)
        await fetchUserProfile()
        setTimeout(() => {
          setShowEditProfile(false)
          setEditSuccess(false)
        }, 2000)
      } else {
        setEditError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setEditError("An error occurred while updating your profile")
    } finally {
      setEditingProfile(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
            </div>
            
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900 hidden sm:block">{user?.name}</span>
              </div>

              {user?.role === "admin" && (
                <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                  Admin
                </Button>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {user?.name}!</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={userProfile?.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">{userProfile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-900">{userProfile?.name}</h3>
                  <p className="text-sm text-gray-500">{userProfile?.age} years old</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {userProfile?.city}, {userProfile?.state}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    {userProfile?.occupation}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                    {userProfile?.education}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {activePlan ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{activePlan.plan_name}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {activePlan.daysLeft > 0 
                        ? `${activePlan.daysLeft} days remaining` 
                        : 'Expires today'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 mb-3">No active subscription</p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleBrowsePlans}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Matches Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recommended Matches</CardTitle>
                  <CardDescription>Profiles that match your preferences</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {matches.slice(0, 6).map((match) => (
                      <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start space-x-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={match.profile_photo || "/placeholder.svg"} />
                            <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{match.name}</h4>
                            <p className="text-sm text-gray-500">{match.age} years • {match.city}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-4 text-sm text-gray-600">
                          <p className="truncate">{match.occupation}</p>
                          <p className="truncate">{match.education}</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs">
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            Like
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                    <p className="text-gray-500 mb-4">We're working to find the best matches for you.</p>
                    <Button variant="outline">Update Preferences</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">Choose Your Plan</DialogTitle>
          </DialogHeader>
          
          {loadingPlans ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-200">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{plan.price}
                      <span className="text-sm font-normal text-gray-500">/{plan.duration_months} month(s)</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-6">
                      {plan.features.split(', ').map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Complete Payment</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold">{selectedPlan.name}</h3>
                <p className="text-2xl font-bold text-blue-600">₹{selectedPlan.price}</p>
                <p className="text-sm text-gray-600">Valid for {selectedPlan.duration_months} month(s)</p>
              </div>

              <div className="text-center">
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
                  <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Scan to pay with UPI</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">UPI ID</p>
                    <p className="text-sm text-gray-600">matchb@paytm</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard('matchb@paytm')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Amount</p>
                    <p className="text-sm text-gray-600">₹{selectedPlan.price}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedPlan.price.toString())}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowPaymentModal(false)
                  router.push('/payments/submit')
                }}
              >
                Payment Completed
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {editError && (
              <Alert variant="destructive">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}

            {editSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-700">
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-full">
                <Label>Profile Photo</Label>
                <FileUpload
                  onUpload={(url) => handleEditInputChange("profile_photo", url)}
                  currentImage={editFormData.profile_photo}
                />
              </div>

              <div>
                <Label>Age *</Label>
                <Input 
                  type="number" 
                  value={editFormData.age} 
                  onChange={(e) => handleEditInputChange("age", e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select value={editFormData.gender} onValueChange={(v) => handleEditInputChange("gender", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Religion *</Label>
                <Select value={editFormData.religion} onValueChange={(v) => handleEditInputChange("religion", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <div>
                <Label>Caste *</Label>
                <Input value={editFormData.caste} onChange={(e) => handleEditInputChange("caste", e.target.value)} required />
              </div>
              <div>
                <Label>Education *</Label>
                <Select value={editFormData.education} onValueChange={(v) => handleEditInputChange("education", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Occupation *</Label>
                <Input value={editFormData.occupation} onChange={(e) => handleEditInputChange("occupation", e.target.value)} required />
              </div>
              <div>
                <Label>State *</Label>
                <Input value={editFormData.state} onChange={(e) => handleEditInputChange("state", e.target.value)} required />
              </div>
              <div>
                <Label>City *</Label>
                <Input value={editFormData.city} onChange={(e) => handleEditInputChange("city", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>About Me</Label>
                <Textarea 
                  rows={4} 
                  value={editFormData.about_me} 
                  onChange={(e) => handleEditInputChange("about_me", e.target.value)} 
                />
              </div>
              <div>
                <Label>Partner Preferences</Label>
                <Textarea 
                  rows={4} 
                  value={editFormData.partner_preferences} 
                  onChange={(e) => handleEditInputChange("partner_preferences", e.target.value)} 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700" 
                disabled={editingProfile}
              >
                {editingProfile ? "Updating..." : "Update Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}