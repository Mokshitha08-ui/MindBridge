import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ user: null })
    }

    const payload = await verifyToken(token) as { userId: string } | null

    if (!payload) {
        return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, username: true, displayName: true, avatarUrl: true, bio: true, tags: true }
    })

    return NextResponse.json({ user })
}
