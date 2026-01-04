import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profile_pics')
        await mkdir(uploadDir, { recursive: true })

        // Create unique filename
        const ext = file.name.split('.').pop()
        const filename = `${crypto.randomUUID()}.${ext}`
        const path = join(uploadDir, filename)

        await writeFile(path, buffer)
        const url = `/uploads/profile_pics/${filename}`

        return NextResponse.json({ url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
