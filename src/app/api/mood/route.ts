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

export async function POST(req: Request) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { value, note, isPrivate } = await req.json()

    // Check if entry exists for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.moodEntry.findFirst({
        where: {
            userId,
            date: {
                gte: today,
                lt: tomorrow
            }
        }
    })

    if (existing) {
        // Update
        const updated = await prisma.moodEntry.update({
            where: { id: existing.id },
            data: { value, note, isPrivate }
        })
        return NextResponse.json(updated)
    } else {
        // Create
        const created = await prisma.moodEntry.create({
            data: {
                userId,
                value,
                note,
                isPrivate: isPrivate ?? true,
                date: new Date()
            }
        })
        return NextResponse.json(created)
    }
}

export async function GET(req: Request) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const dateParam = url.searchParams.get('date')

    let start = new Date()
    start.setHours(0, 0, 0, 0)
    let end = new Date(start)
    end.setDate(end.getDate() + 1)

    if (dateParam) {
        const d = new Date(dateParam)
        if (!isNaN(d.getTime())) {
            start = d
            start.setHours(0, 0, 0, 0)
            end = new Date(start)
            end.setDate(end.getDate() + 1)
        }
    }

    const mood = await prisma.moodEntry.findFirst({
        where: {
            userId,
            date: { gte: start, lt: end }
        }
    })

    return NextResponse.json({ mood })
}
