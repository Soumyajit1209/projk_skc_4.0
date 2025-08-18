import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Basic",
    price: "₹999",
    description: "Perfect for getting started",
    features: ["View up to 50 profiles", "Send 10 interests per month", "Basic search filters", "Email support"],
  },
  {
    name: "Premium",
    price: "₹1,999",
    description: "Most popular choice",
    features: [
      "View unlimited profiles",
      "Send unlimited interests",
      "Advanced search filters",
      "Priority customer support",
      "Profile highlighting",
    ],
    popular: true,
  },
  {
    name: "Gold",
    price: "₹2,999",
    description: "For serious seekers",
    features: [
      "Everything in Premium",
      "Dedicated relationship manager",
      "Profile verification badge",
      "Featured profile listing",
      "Monthly match recommendations",
    ],
  },
  {
    name: "Platinum",
    price: "₹4,999",
    description: "Ultimate matrimonial experience",
    features: [
      "Everything in Gold",
      "Personal matchmaker",
      "Exclusive events access",
      "Background verification",
      "24/7 priority support",
    ],
  },
]

export function Plans() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan that suits your matrimonial journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
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
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="text-4xl font-bold text-rose-600 mb-2">{plan.price}</div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className={`w-full mt-6 ${
                      plan.popular ? "bg-rose-600 hover:bg-rose-700" : "bg-gray-900 hover:bg-gray-800"
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
