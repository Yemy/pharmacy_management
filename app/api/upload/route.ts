import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const filename = req.headers.get('x-filename') || `upload-${Date.now()}`
    const buffer = await req.arrayBuffer()
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, safeName)
    await fs.writeFile(filePath, Buffer.from(buffer))
    const publicPath = `/uploads/${safeName}`
    return NextResponse.json({ path: publicPath })
  } catch (err) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
