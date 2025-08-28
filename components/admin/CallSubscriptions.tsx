"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle, XCircle, Eye, Edit, Plus, Minus,
  AlertTriangle, TrendingUp, Clock, Zap, Activity, RefreshCw, Settings, PhoneCall , CreditCard, Users
} from "lucide-react"

interface CallSubscription {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_phone: string
  user_photo: string
  plan_name: string
  plan_id: number
  credits_purchased: number
  credits_remaining: number
  credits_used: number
  amount_paid: number
  payment_status: 'pending' | 'verified' | 'rejected'
  payment_screenshot: string
  transaction_id: string
  admin_notes: string
  expires_at: string
  created_at: string
  verified_at: string
  verified_by: string
  is_active: boolean
  total_call_duration: number
  total_calls_made: number
}

interface ExotelCredit {
  total_credits: number
  used_credits: number
  remaining_credits: number
  cost_per_minute: number
  monthly_limit: number
  current_month_usage: number
  last_updated: string
}

interface CreditDistribution {
  user_id: number
  user_name: string
  allocated_credits: number
  used_credits: number
  remaining_credits: number
  last_call: string
  status: 'active' | 'expired' | 'suspended'
}

export default function CallSubscriptions() {
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [callSubscriptions, setCallSubscriptions] = useState<CallSubscription[]>([])
  const [exotelCredit, setExotelCredit] = useState<ExotelCredit | null>(null)
  const [creditDistributions, setCreditDistributions] = useState<CreditDistribution[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true)
  const [loadingExotelCredit, setLoadingExotelCredit] = useState(true)
  const [loadingDistributions, setLoadingDistributions] = useState(true)
  
  const [verifyDialog, setVerifyDialog] = useState<{
    open: boolean
    subscription: CallSubscription | null
    action: 'verify' | 'reject' | null
    adminNotes: string
  }>({
    open: false,
    subscription: null,
    action: null,
    adminNotes: ""
  })

  const [creditDialog, setCreditDialog] = useState<{
    open: boolean
    userId: number
    userName: string
    currentCredits: number
    newCredits: string
    action: 'add' | 'remove' | 'set'
    reason: string
  }>({
    open: false,
    userId: 0,
    userName: "",
    currentCredits: 0,
    newCredits: "",
    action: 'add',
    reason: ""
  })

  const [exotelDialog, setExotelDialog] = useState<{
    open: boolean
    newLimit: string
    costPerMinute: string
    monthlyLimit: string
  }>({
    open: false,
    newLimit: "",
    costPerMinute: "",
    monthlyLimit: ""
  })

  const [filters, setFilters] = useState({
    search: "",
    paymentStatus: "all",
    subscriptionStatus: "all"
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    await Promise.all([
      fetchCallSubscriptions(),
      fetchExotelCredit(),
      fetchCreditDistributions()
    ])
  }

  const fetchCallSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/call-subscriptions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCallSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error("Error fetching call subscriptions:", error)
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const fetchExotelCredit = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/exotel-credits", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setExotelCredit(data.credits)
      }
    } catch (error) {
      console.error("Error fetching Exotel credits:", error)
    } finally {
      setLoadingExotelCredit(false)
    }
  }

  const fetchCreditDistributions = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/credit-distributions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCreditDistributions(data.distributions || [])
      }
    } catch (error) {
      console.error("Error fetching credit distributions:", error)
    } finally {
      setLoadingDistributions(false)
    }
  }

  const handlePaymentVerification = async () => {
    if (!verifyDialog.subscription || !verifyDialog.action) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/verify-call-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: verifyDialog.subscription.id,
          action: verifyDialog.action,
          adminNotes: verifyDialog.adminNotes,
        }),
      })

      if (response.ok) {
        await fetchCallSubscriptions()
        await fetchExotelCredit()
        setVerifyDialog({ open: false, subscription: null, action: null, adminNotes: "" })
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
    }
  }

  const handleCreditAdjustment = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/adjust-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: creditDialog.userId,
          action: creditDialog.action,
          credits: parseInt(creditDialog.newCredits),
          reason: creditDialog.reason,
        }),
      })

      if (response.ok) {
        await fetchCreditDistributions()
        await fetchExotelCredit()
        setCreditDialog({
          open: false,
          userId: 0,
          userName: "",
          currentCredits: 0,
          newCredits: "",
          action: 'add',
          reason: ""
        })
      }
    } catch (error) {
      console.error("Error adjusting credits:", error)
    }
  }

  const handleExotelSettingsUpdate = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/exotel-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalCredits: parseInt(exotelDialog.newLimit),
          costPerMinute: parseFloat(exotelDialog.costPerMinute),
          monthlyLimit: parseInt(exotelDialog.monthlyLimit),
        }),
      })

      if (response.ok) {
        await fetchExotelCredit()
        setExotelDialog({
          open: false,
          newLimit: "",
          costPerMinute: "",
          monthlyLimit: ""
        })
      }
    } catch (error) {
      console.error("Error updating Exotel settings:", error)
    }
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const filteredSubscriptions = callSubscriptions.filter(sub => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!sub.user_name.toLowerCase().includes(searchLower) &&
          !sub.user_email.toLowerCase().includes(searchLower) &&
          !sub.transaction_id.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      if (sub.payment_status !== filters.paymentStatus) {
        return false
      }
    }
    if (filters.subscriptionStatus && filters.subscriptionStatus !== "all") {
      const isActive = sub.is_active && new Date(sub.expires_at) > new Date()
      if (filters.subscriptionStatus === 'active' && !isActive) return false
      if (filters.subscriptionStatus === 'expired' && isActive) return false
    }
    return true
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card - Responsive */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold">
                Call Subscription Management
              </CardTitle>
              <CardDescription className="text-blue-100 text-sm sm:text-base">
                Manage call payments, verify subscriptions, and monitor Exotel credits
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              onClick={() => {
                if (exotelCredit) {
                  setExotelDialog({
                    open: true,
                    newLimit: exotelCredit.total_credits.toString(),
                    costPerMinute: exotelCredit.cost_per_minute.toString(),
                    monthlyLimit: exotelCredit.monthly_limit.toString()
                  })
                }
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exotel Settings</span>
              <span className="sm:hidden">Settings</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          {loadingExotelCredit ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading Exotel credits...</span>
            </div>
          ) : exotelCredit ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm opacity-90">Total Credits</span>
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 opacity-80" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">{exotelCredit.total_credits}</div>
                <div className="text-xs opacity-70">Available credits</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm opacity-90">Used Credits</span>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 opacity-80" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">{exotelCredit.used_credits}</div>
                <Progress 
                  value={(exotelCredit.used_credits / exotelCredit.total_credits) * 100} 
                  className="mt-2 bg-white/20"
                />
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm opacity-90">Remaining</span>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 opacity-80" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">{exotelCredit.remaining_credits}</div>
                <div className="text-xs opacity-70">Credits left</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm opacity-90">Monthly Usage</span>
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 opacity-80" />
                </div>
                <div className="text-lg sm:text-2xl font-bold">{exotelCredit.current_month_usage}</div>
                <div className="text-xs opacity-70">
                  of {exotelCredit.monthly_limit} limit
                </div>
                <Progress 
                  value={(exotelCredit.current_month_usage / exotelCredit.monthly_limit) * 100} 
                  className="mt-2 bg-white/20"
                />
              </div>
            </div>
          ) : (
            <Alert className="bg-red-500/20 border-red-300 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Failed to load Exotel credit information</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs - Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile Tab List - Scrollable */}
        <div className="block sm:hidden mb-4">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            <Button
              variant={activeTab === "subscriptions" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("subscriptions")}
              className="whitespace-nowrap"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Subscriptions ({callSubscriptions.filter(s => s.payment_status === 'pending').length})
            </Button>
            <Button
              variant={activeTab === "distributions" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("distributions")}
              className="whitespace-nowrap"
            >
              <Users className="h-4 w-4 mr-1" />
              Credits
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("analytics")}
              className="whitespace-nowrap"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Desktop Tab List */}
        <TabsList className="hidden sm:grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm mb-6">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden lg:inline">Call Subscriptions</span>
            <span className="lg:hidden">Subscriptions</span>
            ({callSubscriptions.filter(s => s.payment_status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="distributions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Credit Distribution</span>
            <span className="lg:hidden">Credits</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Payment Verification</CardTitle>
              <CardDescription className="text-sm">Review and verify call subscription payments</CardDescription>
              
              {/* Filters - Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full sm:max-w-sm"
                />
                <div className="flex gap-2">
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}
                  >
                    <SelectTrigger className="w-full sm:max-w-[140px]">
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.subscriptionStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, subscriptionStatus: value }))}
                  >
                    <SelectTrigger className="w-full sm:max-w-[140px]">
                      <SelectValue placeholder="Subscription Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subscriptions</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              {loadingSubscriptions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading subscriptions...
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="border rounded-lg hover:shadow-md transition-shadow bg-white/50"
                    >
                      {/* Mobile Layout */}
                      <div className="block sm:hidden p-3">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={subscription.user_photo || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{subscription.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-sm truncate">{subscription.user_name}</h3>
                              <div className="flex flex-col gap-1 ml-2">
                                <Badge
                                  variant={
                                    subscription.payment_status === "verified"
                                      ? "default"
                                      : subscription.payment_status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {subscription.payment_status}
                                </Badge>
                                {subscription.is_active && new Date(subscription.expires_at) > new Date() && (
                                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 truncate">{subscription.user_email}</p>
                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mb-2">
                              <span>Plan: {subscription.plan_name}</span>
                              <span>₹{subscription.amount_paid}</span>
                              <span>Credits: {subscription.credits_remaining}/{subscription.credits_purchased}</span>
                              <span>Calls: {subscription.total_calls_made}</span>
                            </div>
                            {subscription.expires_at && (
                              <p className="text-xs text-gray-500 mb-2">
                                Expires: {formatDate(subscription.expires_at)}
                              </p>
                            )}
                            {subscription.admin_notes && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2">
                                Admin Notes: {subscription.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Actions */}
                        <div className="flex flex-wrap gap-2">
                          {subscription.payment_screenshot && (
                            <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                              <a href={subscription.payment_screenshot} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-3 w-3 mr-1" />
                                Screenshot
                              </a>
                            </Button>
                          )}
                          {subscription.payment_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setVerifyDialog({
                                    open: true,
                                    subscription,
                                    action: "verify",
                                    adminNotes: "",
                                  })
                                }
                                className="flex-1 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setVerifyDialog({
                                    open: true,
                                    subscription,
                                    action: "reject",
                                    adminNotes: "",
                                  })
                                }
                                className="flex-1 text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {subscription.payment_status === "verified" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCreditDialog({
                                  open: true,
                                  userId: subscription.user_id,
                                  userName: subscription.user_name,
                                  currentCredits: subscription.credits_remaining,
                                  newCredits: "",
                                  action: 'add',
                                  reason: ""
                                })
                              }
                              className="w-full text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Adjust Credits
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={subscription.user_photo || "/placeholder.svg"} />
                            <AvatarFallback>{subscription.user_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{subscription.user_name}</h3>
                              <Badge
                                variant={
                                  subscription.payment_status === "verified"
                                    ? "default"
                                    : subscription.payment_status === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {subscription.payment_status}
                              </Badge>
                              {subscription.is_active && new Date(subscription.expires_at) > new Date() && (
                                <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">{subscription.user_email}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Plan: {subscription.plan_name}</span>
                              <span>₹{subscription.amount_paid}</span>
                              <span>Credits: {subscription.credits_remaining}/{subscription.credits_purchased}</span>
                              <span className="hidden lg:inline">Calls: {subscription.total_calls_made}</span>
                              <span className="hidden xl:inline">Duration: {formatDuration(subscription.total_call_duration)}</span>
                            </div>
                            {subscription.expires_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {formatDate(subscription.expires_at)}
                              </p>
                            )}
                            {subscription.admin_notes && (
                              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
                                Admin Notes: {subscription.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Desktop Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {subscription.payment_screenshot && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={subscription.payment_screenshot} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="hidden lg:inline">Screenshot</span>
                              </a>
                            </Button>
                          )}
                          {subscription.payment_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setVerifyDialog({
                                    open: true,
                                    subscription,
                                    action: "verify",
                                    adminNotes: "",
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="hidden lg:inline">Verify</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setVerifyDialog({
                                    open: true,
                                    subscription,
                                    action: "reject",
                                    adminNotes: "",
                                  })
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                <span className="hidden lg:inline">Reject</span>
                              </Button>
                            </>
                          )}
                          {subscription.payment_status === "verified" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCreditDialog({
                                  open: true,
                                  userId: subscription.user_id,
                                  userName: subscription.user_name,
                                  currentCredits: subscription.credits_remaining,
                                  newCredits: "",
                                  action: 'add',
                                  reason: ""
                                })
                              }
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              <span className="hidden lg:inline">Adjust Credits</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PhoneCall className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No subscriptions found</h3>
                      <p className="text-sm">No call subscriptions match your current filters</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab - Responsive Grid */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold">
                  ₹{callSubscriptions.filter(s => s.payment_status === 'verified')
                    .reduce((sum, s) => sum + s.amount_paid, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">From call plans</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Active Subscribers</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold">
                  {callSubscriptions.filter(s => s.is_active && new Date(s.expires_at) > new Date()).length}
                </div>
                <p className="text-xs text-gray-500">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Calls Made</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold">
                  {callSubscriptions.reduce((sum, s) => sum + s.total_calls_made, 0)}
                </div>
                <p className="text-xs text-gray-500">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Call Duration</CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="text-lg sm:text-2xl font-bold">
                  {formatDuration(callSubscriptions.reduce((sum, s) => sum + s.total_call_duration, 0))}
                </div>
                <p className="text-xs text-gray-500">Total duration</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={verifyDialog.open} onOpenChange={(open) => setVerifyDialog({ ...verifyDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verifyDialog.action === "verify" ? "Verify Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              {verifyDialog.action === "verify"
                ? "Confirm payment verification to activate call credits"
                : "Provide reason for rejecting this payment"}
            </DialogDescription>
          </DialogHeader>
          {verifyDialog.subscription && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium">{verifyDialog.subscription.user_name}</h3>
                <p className="text-sm text-gray-600">{verifyDialog.subscription.user_email}</p>
                <p className="text-sm text-gray-500">
                  Plan: {verifyDialog.subscription.plan_name} - ₹{verifyDialog.subscription.amount_paid}
                </p>
                <p className="text-sm text-gray-500">
                  Credits: {verifyDialog.subscription.credits_purchased}
                </p>
                <p className="text-sm text-gray-500">
                  Transaction: {verifyDialog.subscription.transaction_id}
                </p>
              </div>
              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={verifyDialog.adminNotes}
                  onChange={(e) => setVerifyDialog({ ...verifyDialog, adminNotes: e.target.value })}
                  placeholder={
                    verifyDialog.action === "verify"
                      ? "Add any verification notes..."
                      : "Provide reason for rejection..."
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setVerifyDialog({ open: false, subscription: null, action: null, adminNotes: "" })}
                >
                  Cancel
                </Button>
                <Button
                  variant={verifyDialog.action === "verify" ? "default" : "destructive"}
                  onClick={handlePaymentVerification}
                >
                  {verifyDialog.action === "verify" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Activate
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={creditDialog.open} onOpenChange={(open) => setCreditDialog({ ...creditDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {creditDialog.action === 'add' ? 'Add Credits' : 
               creditDialog.action === 'remove' ? 'Remove Credits' : 'Set Credits'}
            </DialogTitle>
            <DialogDescription>
              Manually adjust call credits for {creditDialog.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Credits:</span>
                <span className="text-lg font-bold text-blue-600">{creditDialog.currentCredits}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={creditDialog.action === 'add' ? 'default' : 'outline'}
                onClick={() => setCreditDialog({ ...creditDialog, action: 'add' })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
              <Button
                variant={creditDialog.action === 'remove' ? 'default' : 'outline'}
                onClick={() => setCreditDialog({ ...creditDialog, action: 'remove' })}
                className="flex items-center gap-2"
              >
                <Minus className="h-4 w-4" />
                Remove
              </Button>
              <Button
                variant={creditDialog.action === 'set' ? 'default' : 'outline'}
                onClick={() => setCreditDialog({ ...creditDialog, action: 'set' })}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Set
              </Button>
            </div>
            <div>
              <Label>
                {creditDialog.action === 'add' ? 'Credits to Add' : 
                 creditDialog.action === 'remove' ? 'Credits to Remove' : 'New Credit Amount'}
              </Label>
              <Input
                type="number"
                value={creditDialog.newCredits}
                onChange={(e) => setCreditDialog({ ...creditDialog, newCredits: e.target.value })}
                placeholder="Enter number of credits"
                min="1"
                max={creditDialog.action === 'remove' ? creditDialog.currentCredits : undefined}
              />
            </div>
            <div>
              <Label>Reason for Adjustment</Label>
              <Textarea
                value={creditDialog.reason}
                onChange={(e) => setCreditDialog({ ...creditDialog, reason: e.target.value })}
                placeholder="Provide reason for credit adjustment..."
                rows={3}
              />
            </div>
            {creditDialog.newCredits && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Result:</span>
                  <span className="text-lg font-bold">
                    {creditDialog.action === 'add' 
                      ? creditDialog.currentCredits + parseInt(creditDialog.newCredits || '0')
                      : creditDialog.action === 'remove'
                      ? Math.max(0, creditDialog.currentCredits - parseInt(creditDialog.newCredits || '0'))
                      : parseInt(creditDialog.newCredits || '0')
                    } credits
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreditDialog({
                  open: false,
                  userId: 0,
                  userName: "",
                  currentCredits: 0,
                  newCredits: "",
                  action: 'add',
                  reason: ""
                })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreditAdjustment}
                disabled={!creditDialog.newCredits || !creditDialog.reason.trim()}
              >
                <Edit className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exotelDialog.open} onOpenChange={(open) => setExotelDialog({ ...exotelDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exotel Credit Settings</DialogTitle>
            <DialogDescription>
              Configure Exotel credit limits and pricing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Changes to Exotel settings will affect all future call allocations. Current active credits will remain unchanged.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Credit Limit</Label>
                <Input
                  type="number"
                  value={exotelDialog.newLimit}
                  onChange={(e) => setExotelDialog({ ...exotelDialog, newLimit: e.target.value })}
                  placeholder="10000"
                />
                <p className="text-xs text-gray-500 mt-1">Total Exotel credits available</p>
              </div>
              <div>
                <Label>Cost per Minute (₹)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={exotelDialog.costPerMinute}
                  onChange={(e) => setExotelDialog({ ...exotelDialog, costPerMinute: e.target.value })}
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-500 mt-1">Charging rate per minute</p>
              </div>
            </div>
            <div>
              <Label>Monthly Usage Limit</Label>
              <Input
                type="number"
                value={exotelDialog.monthlyLimit}
                onChange={(e) => setExotelDialog({ ...exotelDialog, monthlyLimit: e.target.value })}
                placeholder="5000"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum credits that can be used per month</p>
            </div>
            {exotelCredit && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Current Settings:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="ml-2 font-medium">{exotelCredit.total_credits}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost/Min:</span>
                    <span className="ml-2 font-medium">₹{exotelCredit.cost_per_minute}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Limit:</span>
                    <span className="ml-2 font-medium">{exotelCredit.monthly_limit}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 font-medium">{formatDate(exotelCredit.last_updated)}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setExotelDialog({
                  open: false,
                  newLimit: "",
                  costPerMinute: "",
                  monthlyLimit: ""
                })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExotelSettingsUpdate}
                disabled={!exotelDialog.newLimit || !exotelDialog.costPerMinute || !exotelDialog.monthlyLimit}
              >
                <Settings className="h-4 w-4 mr-2" />
                Update Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}