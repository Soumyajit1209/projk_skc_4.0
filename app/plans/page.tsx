import Image from "next/image"
import { Check, Star } from "lucide-react"

export default function PlansPage() {
  const plans = [
    {
      name: "Basic",
      price: "₹999",
      duration: "1 Month",
      features: [
        "View up to 50 profiles",
        "Send 10 interests per day",
        "Basic search filters",
        "Email support",
        "Profile verification",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: "₹2,999",
      duration: "3 Months",
      features: [
        "View unlimited profiles",
        "Send unlimited interests",
        "Advanced search filters",
        "Priority customer support",
        "Profile highlighting",
        "Contact details access",
        "Horoscope matching",
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "₹4,999",
      duration: "6 Months",
      features: [
        "All Premium features",
        "Dedicated relationship manager",
        "Personalized match recommendations",
        "Profile promotion",
        "Video call facility",
        "Background verification",
        "Wedding planning assistance",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-8 w-auto" />
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-rose-600 transition-colors">
                Home
              </a>
              <a href="/about" className="text-gray-700 hover:text-rose-600 transition-colors">
                About
              </a>
              <a href="/plans" className="text-rose-600 font-medium">
                Plans
              </a>
              <a href="/contact" className="text-gray-700 hover:text-rose-600 transition-colors">
                Contact
              </a>
              <a href="/login" className="text-gray-700 hover:text-rose-600 transition-colors">
                Login
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-rose-600">Perfect Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the plan that best suits your needs and start your journey to find your life partner
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                  plan.popular ? "ring-2 ring-rose-600 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-rose-600 mb-1">{plan.price}</div>
                  <div className="text-gray-600">{plan.duration}</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade your plan at any time. The remaining amount will be adjusted in your new plan.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a refund policy?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee if you're not satisfied with our service.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are all profiles verified?</h3>
              <p className="text-gray-600">
                Yes, all profiles go through our verification process to ensure authenticity and safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
