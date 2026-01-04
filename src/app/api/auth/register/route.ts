import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const { email, password, username, displayName } = await req.json()

        if (!email || !password || !username) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 })
        }

        const passwordHash = await hashPassword(password)

        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                displayName: displayName || username
            }
        })

        const token = await signToken({ userId: user.id })

        const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } })

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return response

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
