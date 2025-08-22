// components/admin/AdminPlansManagement.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, Plus, Edit2, Trash2, Loader2, DollarSign, 
  Calendar, CheckCircle, XCircle, Save, X 
} from "lucide-react"

interface Plan {
  id: number
  name: string
  price: number
  duration_months: number
  features: string
  description: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

interface FormData {
  name: string
  price: string
  duration_months: string
  features: string
  description: string
  is_active: boolean
}

export default function AdminPlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [dialog, setDialog] = useState<{
    open: boolean
    type: 'create' | 'edit' | 'delete' | null
    plan?: Plan
  }>({ open: false, type: null })

  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "",
    duration_months: "",
    features: "",
    description: "",
    is_active: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/plans", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to load plans' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while fetching plans' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      duration_months: "",
      features: "",
      description: "",
      is_active: true
    })
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (message) setMessage(null)
  }

  const openDialog = (type: 'create' | 'edit' | 'delete', plan?: Plan) => {
    if (type === 'edit' && plan) {
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        duration_months: plan.duration_months.toString(),
        features: plan.features || "",
        description: plan.description || "",
        is_active: plan.is_active
      })
    } else {
      resetForm()
    }
    setDialog({ open: true, type, plan })
  }

  const closeDialog = () => {
    setDialog({ open: false, type: null })
    resetForm()
    setMessage(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Plan name is required' })
      return false
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      setMessage({ type: 'error', text: 'Valid price is required' })
      return false
    }

    const duration = parseInt(formData.duration_months)
    if (isNaN(duration) || duration <= 0) {
      setMessage({ type: 'error', text: 'Valid duration in months is required' })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const token = localStorage.getItem("token")
      const url = dialog.type === 'edit' 
        ? `/api/admin/plans/${dialog.plan?.id}` 
        : '/api/admin/plans'
      
      const method = dialog.type === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          price: parseFloat(formData.price),
          duration_months: parseInt(formData.duration_months),
          features: formData.features.trim() || null,
          description: formData.description.trim() || null,
          is_active: formData.is_active
        }),
      })

      if (response.ok) {
        await fetchPlans()
        closeDialog()
        setMessage({ 
          type: 'success', 
          text: `Plan ${dialog.type === 'edit' ? 'updated' : 'created'} successfully` 
        })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Operation failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!dialog.plan) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/plans/${dialog.plan.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        await fetchPlans()
        closeDialog()
        setMessage({ type: 'success', text: 'Plan deleted successfully' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to delete plan' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePlanStatus = async (planId: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        await fetchPlans()
        setMessage({ 
          type: 'success', 
          text: `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully` 
        })
      } else {
        setMessage({ type: 'error', text: 'Failed to update plan status' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plans Management
              </CardTitle>
              <CardDescription>Create, edit, and manage subscription plans</CardDescription>
            </div>
            <Button onClick={() => openDialog('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {plans.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No plans found. Create your first plan to get started.</p>
              </div>
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">₹{plan.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {plan.description && (
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    )}

                    {plan.features && (
                      <div className="text-sm text-gray-500">
                        <strong>Features:</strong> {plan.features}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
                      {plan.updated_at && (
                        <span className="ml-4">
                          Updated: {new Date(plan.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                      />
                      <span className="text-sm text-gray-500">
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('edit', plan)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('delete', plan)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open && (dialog.type === 'create' || dialog.type === 'edit')} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialog.type === 'create' ? 'Create New Plan' : 'Edit Plan'}
            </DialogTitle>
            <DialogDescription>
              {dialog.type === 'create' 
                ? 'Create a new subscription plan for users'
                : 'Update the selected plan details'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name *</Label>
                <Input
                  id="plan-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Premium Plan"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-price">Price (₹) *</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="e.g., 999"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-duration">Duration (Months) *</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  min="1"
                  value={formData.duration_months}
                  onChange={(e) => handleInputChange("duration_months", e.target.value)}
                  placeholder="e.g., 6"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-status">Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="plan-status"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-features">Features</Label>
              <Textarea
                id="plan-features"
                value={formData.features}
                onChange={(e) => handleInputChange("features", e.target.value)}
                placeholder="List of features included in this plan..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Brief description of the plan..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {dialog.type === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {dialog.type === 'create' ? 'Create Plan' : 'Update Plan'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialog.open && dialog.type === 'delete'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {dialog.plan && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-900">{dialog.plan.name}</h3>
              <p className="text-sm text-red-700">
                ₹{dialog.plan.price} for {dialog.plan.duration_months} month{dialog.plan.duration_months > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}