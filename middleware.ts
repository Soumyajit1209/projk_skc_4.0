// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/admin',
  '/api/profile',
  '/api/admin',
  '/api/matches',
  '/api/payments'
]

// Routes that require admin role
const adminRoutes = [
  '/admin',
  '/api/admin'
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login',
  '/register'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookie (server-side) or Authorization header
  const tokenFromCookie = request.cookies.get('auth-token')?.value
  const authHeader = request.headers.get('authorization')
  const tokenFromHeader = authHeader?.replace('Bearer ', '')
  
  const token = tokenFromCookie || tokenFromHeader
  
  let user: any = null
  
  // Verify token if present
  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production')
    } catch (error) {
      // Token is invalid, clear the cookie
      const response = NextResponse.next()
      response.cookies.delete('auth-token')
      user = null
    }
  }
  
  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Handle protected routes
  if (isProtectedRoute && !user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Redirect to appropriate login page
    const loginUrl = isAdminRoute ? '/login/admin' : '/login/user'
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }
  
  // Handle admin-only routes
  if (isAdminRoute && user && user.role !== 'admin') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    return NextResponse.redirect(new URL('/login/admin', request.url))
  }
  
  // Handle auth routes (login/register) - redirect if already authenticated
  if (isAuthRoute && user) {
    const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  // Handle root redirect
  if (pathname === '/') {
    if (user) {
      const redirectUrl = user.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    // Let non-authenticated users see the landing page
  }
  
  // Add security headers
  const response = NextResponse.next()
  
  // Security headers for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}