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

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')

    const circles = await prisma.circle.findMany({
        where: query ? {
            OR: [
                { title: { contains: query } },
                { description: { contains: query } },
                { tags: { contains: query } }
            ]
        } : undefined,
        include: {
            _count: {
                select: { members: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ circles })
}

export async function POST(req: Request) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, description, tags, isPrivate } = await req.json()

    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const circle = await prisma.circle.create({
        data: {
            title,
            description,
            tags,
            isPrivate: !!isPrivate,
            members: {
                create: {
                    userId,
                    role: 'ADMIN'
                }
            }
        }
    })

    return NextResponse.json({ circle })
}
