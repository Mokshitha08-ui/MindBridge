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

export async function GET() {
    try {
        const userId = await getUser()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const entries = await prisma.journalEntry.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 3
        })

        return NextResponse.json({ entries })
    } catch (error) {
        console.error('Dashboard journal error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
