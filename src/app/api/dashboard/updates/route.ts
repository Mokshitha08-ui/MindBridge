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

        // Get circles user is a member of (excluding pending)
        const memberships = await prisma.member.findMany({
            where: {
                userId,
                role: { in: ['MEMBER', 'ADMIN'] }
            },
            select: { circleId: true }
        })

        const circleIds = memberships.map(m => m.circleId)

        if (circleIds.length === 0) {
            return NextResponse.json({ posts: [] })
        }

        const posts = await prisma.post.findMany({
            where: {
                circleId: { in: circleIds }
            },
            include: {
                circle: { select: { id: true, title: true } },
                author: { select: { username: true, displayName: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })

        return NextResponse.json({ posts })
    } catch (error) {
        console.error('Dashboard updates error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
