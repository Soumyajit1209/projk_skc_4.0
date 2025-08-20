"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { User, LogOut } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/plans', label: 'Plans' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/matchb-logo.png" alt="MatchB" width={120} height={40} className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`text-gray-600 hover:text-rose-600 transition-colors font-medium relative ${
                  isActive(link.href) ? 'text-rose-600' : ''
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-rose-600"></span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              // Authenticated user buttons
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost" className="text-gray-600 hover:text-rose-600 hover:bg-rose-50">
                    <User className="w-4 h-4 mr-2" />
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                  </Button>
                </Link>
                <Button 
                  onClick={logout}
                  variant="ghost" 
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              // Unauthenticated user buttons
              <>
                <Link href="/login/user">
                  <Button variant="ghost" className="text-gray-600 hover:text-rose-600 hover:bg-rose-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive(link.href)
                  ? 'text-rose-600 bg-rose-50 border-l-4 border-rose-600'
                  : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}