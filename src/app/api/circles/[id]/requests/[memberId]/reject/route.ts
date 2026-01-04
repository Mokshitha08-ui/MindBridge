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

export async function POST(req: Request, { params }: { params: Promise<{ id: string; memberId: string }> }) {
    try {
        const userId = await getUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id, memberId } = await params

        // Check if current user is admin of the circle
        const adminMembership = await prisma.member.findUnique({
            where: { userId_circleId: { userId, circleId: id } }
        })

        if (!adminMembership || adminMembership.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete member record
        await prisma.member.delete({
            where: { id: memberId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error rejecting request:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
