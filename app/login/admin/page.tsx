import { AdminLoginForm } from "@/components/auth/admin-login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-gray-800">Admin Login</CardTitle>
          <CardDescription>Sign in with username, email, or phone</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-gray-600 hover:underline">
                ← Back to login options
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
