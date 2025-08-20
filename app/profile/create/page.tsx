"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
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
      router.push("/login")
      return
    }
    
    // If user already has a complete profile, redirect to dashboard
    if (!loading && user && user.profileComplete) {
      router.push("/dashboard")
      return
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError(data.error || "Failed to create profile")
      }
    } catch (error) {
      setError("An error occurred while creating your profile")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-7 w-7 text-rose-600" />
            <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
          </div>
          <p className="text-gray-500 text-sm">Complete your profile to find your perfect match</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Profile created successfully! Redirecting to dashboard...
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              {/* Grid layout compact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Photo */}
                <div className="col-span-1">
                  <Label>Profile Photo</Label>
                  <FileUpload
                    onUpload={(url) => handleInputChange("profile_photo", url)}
                    currentImage={formData.profile_photo}
                  />
                </div>

                {/* Basic */}
                <div>
                  <Label>Age *</Label>
                  <Input 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => handleInputChange("age", e.target.value)} 
                    required 
                    min="18"
                    max="80"
                  />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Marital Status *</Label>
                  <Select value={formData.marital_status} onValueChange={(v) => handleInputChange("marital_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Physical */}
                <div>
                  <Label>Height (ft)</Label>
                  <Input value={formData.height} onChange={(e) => handleInputChange("height", e.target.value)} placeholder="e.g., 5.6" />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input value={formData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} placeholder="e.g., 65" />
                </div>

                {/* Religion */}
                <div>
                  <Label>Religion *</Label>
                  <Select value={formData.religion} onValueChange={(v) => handleInputChange("religion", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
                  <Input value={formData.caste} onChange={(e) => handleInputChange("caste", e.target.value)} required placeholder="Enter caste" />
                </div>
                <div>
                  <Label>Mother Tongue</Label>
                  <Input value={formData.mother_tongue} onChange={(e) => handleInputChange("mother_tongue", e.target.value)} placeholder="e.g., Hindi, Bengali" />
                </div>

                {/* Professional */}
                <div>
                  <Label>Education *</Label>
                  <Select value={formData.education} onValueChange={(v) => handleInputChange("education", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Professional">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Occupation *</Label>
                  <Input value={formData.occupation} onChange={(e) => handleInputChange("occupation", e.target.value)} required placeholder="e.g., Software Engineer" />
                </div>
                <div>
                  <Label>Income (Lakhs per year)</Label>
                  <Input value={formData.income} onChange={(e) => handleInputChange("income", e.target.value)} placeholder="e.g., 5-10" />
                </div>

                {/* Location */}
                <div>
                  <Label>State *</Label>
                  <Input value={formData.state} onChange={(e) => handleInputChange("state", e.target.value)} required placeholder="e.g., West Bengal" />
                </div>
                <div>
                  <Label>City *</Label>
                  <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required placeholder="e.g., Kolkata" />
                </div>

                {/* Family */}
                <div>
                  <Label>Family Type</Label>
                  <Select value={formData.family_type} onValueChange={(v) => handleInputChange("family_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuclear">Nuclear</SelectItem>
                      <SelectItem value="Joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Family Status</Label>
                  <Select value={formData.family_status} onValueChange={(v) => handleInputChange("family_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich">Rich</SelectItem>
                      <SelectItem value="Affluent">Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Textareas in 2-cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>About Me</Label>
                  <Textarea 
                    rows={3} 
                    value={formData.about_me} 
                    onChange={(e) => handleInputChange("about_me", e.target.value)} 
                    placeholder="Tell us about yourself, your interests, and what makes you unique..."
                  />
                </div>
                <div>
                  <Label>Partner Preferences</Label>
                  <Textarea 
                    rows={3} 
                    value={formData.partner_preferences} 
                    onChange={(e) => handleInputChange("partner_preferences", e.target.value)} 
                    placeholder="Describe your ideal partner and what you're looking for..."
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-rose-600 hover:bg-rose-700" 
                disabled={submitting || success}
              >
                {submitting ? "Creating Profile..." : success ? "Profile Created!" : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}