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

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const journal = await prisma.journalEntry.findUnique({
        where: { id, userId }
    })

    if (!journal) {
        return NextResponse.json({ error: 'Journal not found' }, { status: 404 })
    }

    return NextResponse.json({ journal })
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { title, content, isPrivate } = await req.json()

    if (!title || !content) {
        return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    try {
        const journal = await prisma.journalEntry.update({
            where: { id, userId },
            data: {
                title,
                content,
                isPrivate: isPrivate ?? true
            }
        })
        return NextResponse.json({ journal })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    try {
        await prisma.journalEntry.delete({
            where: { id, userId }
        })
        return NextResponse.json({ message: 'Deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 })
    }
}
