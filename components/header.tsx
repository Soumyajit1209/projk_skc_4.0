import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-gray-600 hover:text-rose-600 transition-colors">
              About
            </Link>
            <Link href="/plans" className="text-gray-600 hover:text-rose-600 transition-colors">
              Plans
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-rose-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-rose-600">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white">Join Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
