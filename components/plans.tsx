
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

interface Plan {
  id: number
  name: string
  price: number | string
  duration_months: number
  description: string | null
  features: string[] | null
  popular?: boolean
}

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/plans")
        if (!response.ok) {
          throw new Error("Failed to fetch plans")
        }
        const data = await response.json()
        const formattedPlans = data.plans.map((plan: any) => {
          let features: string[] | null = null
          if (plan.features && typeof plan.features === "string") {
      
            features = plan.features
              .split(",")
              .map((feature: string) => feature.trim())
              .filter((feature: string) => feature !== "")
            if (features.length === 0) {
              features = null
            }
          }
          const price = parseFloat(String(plan.price))
          return {
            id: plan.id,
            name: plan.name,
            price: isNaN(price) ? 0 : price,
            duration_months: plan.duration_months,
            description: plan.description || "No description available",
            features,
            popular: plan.name.toLowerCase() === "premium plan",
          }
        })
        setPlans(formattedPlans)
        setLoading(false)
      } catch (err) {
        setError("Failed to load plans. Please try again later.")
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">Loading plans...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-red-600">{error}</div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-500 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Select the perfect plan that suits your matrimonial journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-rose-500 shadow-xl scale-105" : "border-gray-200"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-500">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-rose-600 mb-2">
                  ₹{Number(plan.price).toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm">
                  {plan.duration_months} {plan.duration_months === 1 ? "Month" : "Months"}
                </p>
                <p className="text-gray-500">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {Array.isArray(plan.features) ? (
                    plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-500">{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No features available</li>
                  )}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className={`w-full mt-6 ${
                      plan.popular ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-500 hover:bg-gray-500"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}