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

export async function PUT(req: Request) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { displayName, bio, tags, avatarUrl } = await req.json()

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            displayName,
            bio,
            tags,
            avatarUrl
        }
    })

    return NextResponse.json({ user })
}
