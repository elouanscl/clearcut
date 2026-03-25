import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('video')
    const userId = formData.get('userId')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Upload video to Supabase Storage
    const fileName = `${userId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, file, { contentType: file.type })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    // Create job in database
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