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
    const userId = await getUser()
    const { id } = await params

    const [circle, memberCount] = await Promise.all([
        prisma.circle.findUnique({
            where: { id }
        }),
        prisma.member.count({
            where: {
                circleId: id,
                role: { in: ['MEMBER', 'ADMIN'] }
            }
        })
    ])

    if (!circle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let membership = null
    if (userId) {
        membership = await prisma.member.findUnique({
            where: {
                userId_circleId: {
                    userId,
                    circleId: id
                }
            }
        })
    }

    // Attach count manually since we filtered it
    const circleWithCount = {
        ...circle,
        _count: { members: memberCount }
    }

    return NextResponse.json({ circle: circleWithCount, membership })
}
