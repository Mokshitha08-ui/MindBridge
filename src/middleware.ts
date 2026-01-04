import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value

    const protectedPaths = ['/dashboard', '/circles', '/mood', '/journal', '/profile']
    const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path))

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
    }

    if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
        if (token) {
            const payload = await verifyToken(token)
            if (payload) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
