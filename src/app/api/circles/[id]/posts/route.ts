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

    const circle = await prisma.circle.findUnique({
        where: { id },
        select: { isPrivate: true }
    })

    if (!circle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (circle.isPrivate) {
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const membership = await prisma.member.findUnique({
            where: { userId_circleId: { userId, circleId: id } }
        })

        if (!membership || (membership.role !== 'MEMBER' && membership.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Not a member' }, { status: 403 })
        }
    }

    const posts = await prisma.post.findMany({
        where: { circleId: id },
        include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ posts })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { title, content } = await req.json()

    // Check membership
    const membership = await prisma.member.findUnique({
        where: { userId_circleId: { userId, circleId: id } }
    })

    // If not member or pending, cannot post
    if (!membership || membership.role === 'PENDING') {
        return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    const post = await prisma.post.create({
        data: {
            title,
            content,
            circleId: id,
            authorId: userId
        }
    })

    return NextResponse.json({ post })
}
