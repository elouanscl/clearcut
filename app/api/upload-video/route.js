import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video')
    const userId = formData.get('userId')

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    const { data: job } = await supabase.from('jobs').insert({
      user_id: userId,
      filename: file.name,
      status: 'queued',
      input_url: publicUrl,
      credits_used: 2,
    }).select().single()

    return NextResponse.json({ jobId: job.id, videoUrl: publicUrl })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}