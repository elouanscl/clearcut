import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request) {
  try {
    const { videoUrl, jobId, userId } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Update job status to processing
    await supabase.from('jobs').update({ status: 'processing' }).eq('id', jobId)

    const output = await replicate.run(
      "hjunior29/video-text-remover:247c8385f3c6c322110a6787bd2d257acc3a3d60b9ed7da1726a628f72a42c4d",
      {
        input: {
          video: videoUrl,
          method: "hybrid",
          margin: 10,
          iou_threshold: 0.2,
          conf_threshold: 0.25,
          resolution: "720p",
          detection_interval: 0,
        }
      }
    )

    const outputUrl = output.url()

    // Update job as done
    await supabase.from('jobs').update({
      status: 'done',
      output_url: outputUrl,
    }).eq('id', jobId)

    // Deduct credits
    await supabase.rpc('decrement_credits', { uid: userId, amount: 2 })

    return NextResponse.json({ outputUrl })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}