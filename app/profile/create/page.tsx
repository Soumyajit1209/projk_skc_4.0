"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

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
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

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
        router.push("/dashboard")
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create Your Profile</h1>
          </div>
          <p className="text-gray-600">Tell us about yourself to find your perfect match</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Fill in your details to create a complete profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              {/* Profile Photo */}
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <FileUpload
                  onUpload={(url) => handleInputChange("profile_photo", url)}
                  currentImage={formData.profile_photo}
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="80"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marital_status">Marital Status *</Label>
                  <Select
                    value={formData.marital_status}
                    onValueChange={(value) => handleInputChange("marital_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Never Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Physical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (in feet)</Label>
                  <Input
                    id="height"
                    placeholder="e.g., 5.6"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (in kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 65"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                  />
                </div>
              </div>

              {/* Religious Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="religion">Religion *</Label>
                  <Select value={formData.religion} onValueChange={(value) => handleInputChange("religion", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
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

                <div className="space-y-2">
                  <Label htmlFor="caste">Caste *</Label>
                  <Input
                    id="caste"
                    placeholder="Enter your caste"
                    value={formData.caste}
                    onChange={(e) => handleInputChange("caste", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother_tongue">Mother Tongue</Label>
                  <Input
                    id="mother_tongue"
                    placeholder="e.g., Hindi, English"
                    value={formData.mother_tongue}
                    onChange={(e) => handleInputChange("mother_tongue", e.target.value)}
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="education">Education *</Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                      <SelectItem value="Master's">Master's Degree</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Professional">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    placeholder="e.g., Software Engineer"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income (in Lakhs)</Label>
                  <Input
                    id="income"
                    placeholder="e.g., 5-10"
                    value={formData.income}
                    onChange={(e) => handleInputChange("income", e.target.value)}
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="e.g., Maharashtra"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Mumbai"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Family Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="family_type">Family Type</Label>
                  <Select
                    value={formData.family_type}
                    onValueChange={(value) => handleInputChange("family_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuclear">Nuclear Family</SelectItem>
                      <SelectItem value="Joint">Joint Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_status">Family Status</Label>
                  <Select
                    value={formData.family_status}
                    onValueChange={(value) => handleInputChange("family_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich">Rich</SelectItem>
                      <SelectItem value="Affluent">Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* About Me */}
              <div className="space-y-2">
                <Label htmlFor="about_me">About Me</Label>
                <Textarea
                  id="about_me"
                  placeholder="Tell us about yourself, your interests, hobbies, and what makes you unique..."
                  value={formData.about_me}
                  onChange={(e) => handleInputChange("about_me", e.target.value)}
                  rows={4}
                />
              </div>

              {/* Partner Preferences */}
              <div className="space-y-2">
                <Label htmlFor="partner_preferences">Partner Preferences</Label>
                <Textarea
                  id="partner_preferences"
                  placeholder="Describe your ideal partner - age range, education, profession, values, etc..."
                  value={formData.partner_preferences}
                  onChange={(e) => handleInputChange("partner_preferences", e.target.value)}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-rose-600 hover:bg-rose-700" disabled={submitting}>
                {submitting ? "Creating Profile..." : "Create Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
