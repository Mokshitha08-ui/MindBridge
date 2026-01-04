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

    const entries = await prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30
    })

    return NextResponse.json({ entries })
}
