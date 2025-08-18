import Image from "next/image"

export default function PrivacyPage() {
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
              <a href="/plans" className="text-gray-700 hover:text-rose-600 transition-colors">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect information you provide directly to us, such as when you create an account, fill out your
                profile, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Personal information (name, email, phone number, date of birth)</li>
                <li>Profile information (photos, preferences, family details)</li>
                <li>Communication data (messages, interests sent/received)</li>
                <li>Payment information (billing details, transaction history)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To provide and maintain our matrimonial services</li>
                <li>To match you with compatible profiles</li>
                <li>To process payments and manage subscriptions</li>
                <li>To communicate with you about our services</li>
                <li>To improve our platform and user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information
                only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With other users as part of our matching service</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In case of business transfer or merger</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet is
                100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Email: privacy@matchb.com</p>
                <p>Phone: +91 98765 43210</p>
                <p>Address: 123 Business Center, MG Road, Bangalore, Karnataka 560001</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
