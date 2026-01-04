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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        const circle = await prisma.circle.findUnique({ where: { id } })
        if (!circle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const role = circle.isPrivate ? 'PENDING' : 'MEMBER'

        const member = await prisma.member.upsert({
            where: { userId_circleId: { userId, circleId: id } },
            update: {}, // If already exists, do nothing
            create: {
                userId,
                circleId: id,
                role
            }
        })

        return NextResponse.json({ member })
    } catch (error) {
        console.error('Error in circle join API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
