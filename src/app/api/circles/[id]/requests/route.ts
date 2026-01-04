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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        // Check if admin
        const admin = await prisma.member.findUnique({
            where: { userId_circleId: { userId, circleId: id } }
        })

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const requests = await prisma.member.findMany({
            where: {
                circleId: id,
                role: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error('Error fetching requests:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
