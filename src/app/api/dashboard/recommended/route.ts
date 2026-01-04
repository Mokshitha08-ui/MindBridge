import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null
    const payload = await verifyToken(token) as { userId: string } | null
    return payload?.userId
}

export async function GET() {
    try {
        const userId = await getUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get circles user is NOT a member of
        const memberships = await prisma.member.findMany({
            where: { userId },
            select: { circleId: true }
        })

        const joinedCircleIds = memberships.map(m => m.circleId)

        const circles = await prisma.circle.findMany({
            where: {
                id: { notIn: joinedCircleIds },
                isPrivate: false // Recommend public ones first
            },
            take: 3
        })

        return NextResponse.json({ circles })
    } catch (error) {
        console.error('Dashboard recommended error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
