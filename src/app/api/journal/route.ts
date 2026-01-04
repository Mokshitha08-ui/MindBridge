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
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const journals = await prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    })

    return NextResponse.json({ journals })
}

export async function POST(req: Request) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, content, isPrivate } = await req.json()

    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    const journal = await prisma.journalEntry.create({
        data: {
            userId,
            title,
            content,
            isPrivate: isPrivate ?? true,
            date: new Date()
        }
    })

    return NextResponse.json({ journal })
}
