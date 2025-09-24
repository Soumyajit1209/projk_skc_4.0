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
import { Heart, AlertCircle } from "lucide-react"

interface ValidationErrors {
  [key: string]: string
}

export default function CreateProfilePage() {
  const { user, loading, updateProfileStatus } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
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
  }, [user, loading, router])

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'age':
        const ageNum = parseInt(value)
        if (!value) return "Age is required"
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 80) return "Age must be between 18 and 80"
        return ""
      
      case 'income':
        if (value && !/^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(value.trim())) {
          return "Income should only contain numbers (e.g., 5, 5.5, 5-10)"
        }
        return ""
      
      case 'weight':
        if (value && !/^\d+(\.\d+)?$/.test(value.trim())) {
          return "Weight should only contain numbers (e.g., 65, 65.5)"
        }
        return ""
      
      case 'height':
        if (value && !/^\d+(\.\d+)?$/.test(value.trim())) {
          return "Height should only contain numbers (e.g., 5.6, 6.0)"
        }
        return ""
      
      case 'gender':
        if (!value) return "Gender is required"
        return ""
      
      case 'marital_status':
        if (!value) return "Marital status is required"
        return ""
      
      case 'religion':
        if (!value) return "Religion is required"
        return ""
      
      case 'caste':
        if (!value.trim()) return "Caste is required"
        return ""
      
      case 'education':
        if (!value) return "Education is required"
        return ""
      
      case 'occupation':
        if (!value.trim()) return "Occupation is required"
        return ""
      
      case 'state':
        if (!value.trim()) return "State is required"
        return ""
      
      case 'city':
        if (!value.trim()) return "City is required"
        return ""
      
      default:
        return ""
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    
    // For income, weight, height - validate on change
    if (['income', 'weight', 'height'].includes(field)) {
      const error = validateField(field, value)
      if (error) {
        setValidationErrors(prev => ({ ...prev, [field]: error }))
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    // Validate all required fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        errors[field] = error
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)
    
    // Validate form before submission
    if (!validateForm()) {
      setSubmitting(false)
      setError("Please fix the validation errors below")
      return
    }

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
        updateProfileStatus(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setError(data.error || "Failed to create profile")
      }
    } catch (error) {
      setError("An error occurred while creating your profile")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard")
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
    return null
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile Photo */}
                <div className="col-span-1">
                  <Label>Profile Photo</Label>
                  <FileUpload
                    onUpload={(url) => handleInputChange("profile_photo", url)}
                    currentImage={formData.profile_photo}
                  />
                </div>

                {/* Age */}
                <div>
                  <Label>Age * (Years)</Label>
                  <Input 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => handleInputChange("age", e.target.value)} 
                    min="18"
                    max="80"
                    className={validationErrors.age ? "border-red-500" : ""}
                  />
                  {validationErrors.age && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.age}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Label>Gender *</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                    <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.gender}
                    </p>
                  )}
                </div>

                {/* Marital Status */}
                <div>
                  <Label>Marital Status *</Label>
                  <Select value={formData.marital_status} onValueChange={(v) => handleInputChange("marital_status", v)}>
                    <SelectTrigger className={validationErrors.marital_status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Never Married">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.marital_status && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.marital_status}
                    </p>
                  )}
                </div>

                {/* Height */}
                <div>
                  <Label>Height (feet)</Label>
                  <Input 
                    value={formData.height} 
                    onChange={(e) => handleInputChange("height", e.target.value)} 
                    placeholder="e.g., 5.6" 
                    className={validationErrors.height ? "border-red-500" : ""}
                  />
                  {validationErrors.height && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.height}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <Label>Weight (kg)</Label>
                  <Input 
                    value={formData.weight} 
                    onChange={(e) => handleInputChange("weight", e.target.value)} 
                    placeholder="e.g., 65" 
                    className={validationErrors.weight ? "border-red-500" : ""}
                  />
                  {validationErrors.weight && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.weight}
                    </p>
                  )}
                </div>

                {/* Religion */}
                <div>
                  <Label>Religion *</Label>
                  <Select value={formData.religion} onValueChange={(v) => handleInputChange("religion", v)}>
                    <SelectTrigger className={validationErrors.religion ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Religion" />
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
                  {validationErrors.religion && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.religion}
                    </p>
                  )}
                </div>

                {/* Caste */}
                <div>
                  <Label>Caste *</Label>
                  <Input 
                    value={formData.caste} 
                    onChange={(e) => handleInputChange("caste", e.target.value)} 
                    placeholder="Enter caste" 
                    className={validationErrors.caste ? "border-red-500" : ""}
                  />
                  {validationErrors.caste && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.caste}
                    </p>
                  )}
                </div>

                {/* Mother Tongue */}
                <div>
                  <Label>Mother Tongue</Label>
                  <Input 
                    value={formData.mother_tongue} 
                    onChange={(e) => handleInputChange("mother_tongue", e.target.value)} 
                    placeholder="e.g., Hindi, Bengali" 
                  />
                </div>

                {/* Education */}
                <div>
                  <Label>Education *</Label>
                  <Select value={formData.education} onValueChange={(v) => handleInputChange("education", v)}>
                    <SelectTrigger className={validationErrors.education ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Secondary(10th)">Secondary(10th)</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                      <SelectItem value="Master's">Master's</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="Professional">Professional Degree</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.education && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.education}
                    </p>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <Label>Occupation *</Label>
                  <Input 
                    value={formData.occupation} 
                    onChange={(e) => handleInputChange("occupation", e.target.value)} 
                    placeholder="e.g., Software Engineer" 
                    className={validationErrors.occupation ? "border-red-500" : ""}
                  />
                  {validationErrors.occupation && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.occupation}
                    </p>
                  )}
                </div>

                {/* Income */}
                <div>
                  <Label>Income (Lakhs per year)</Label>
                  <Input 
                    value={formData.income} 
                    onChange={(e) => handleInputChange("income", e.target.value)} 
                    placeholder="e.g., 5 or 5-10" 
                    className={validationErrors.income ? "border-red-500" : ""}
                  />
                  {validationErrors.income && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.income}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <Label>State *</Label>
                  <Input 
                    value={formData.state} 
                    onChange={(e) => handleInputChange("state", e.target.value)} 
                    placeholder="e.g., West Bengal" 
                    className={validationErrors.state ? "border-red-500" : ""}
                  />
                  {validationErrors.state && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.state}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label>City *</Label>
                  <Input 
                    value={formData.city} 
                    onChange={(e) => handleInputChange("city", e.target.value)} 
                    placeholder="e.g., Kolkata" 
                    className={validationErrors.city ? "border-red-500" : ""}
                  />
                  {validationErrors.city && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                {/* Family Type */}
                <div>
                  <Label>Family Type</Label>
                  <Select value={formData.family_type} onValueChange={(v) => handleInputChange("family_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuclear">Nuclear</SelectItem>
                      <SelectItem value="Joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Family Status */}
                <div>
                  <Label>Family Status</Label>
                  <Select value={formData.family_status} onValueChange={(v) => handleInputChange("family_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Middle Class">Middle Class</SelectItem>
                      <SelectItem value="Upper Middle Class">Upper Middle Class</SelectItem>
                      <SelectItem value="Rich">Rich</SelectItem>
                      <SelectItem value="Affluent">Affluent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Textareas */}
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
                {submitting ? "Creating Profile..." : success ? "Profile Created! Redirecting..." : "Create Profile"}
              </Button>
              
              {success && (
                <Button 
                  type="button" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 mt-2" 
                  onClick={handleGoToDashboard}
                >
                  Go to Dashboard Now
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}