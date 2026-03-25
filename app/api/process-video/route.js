import { NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request) {
  try {
    const { videoUrl, jobId } = await request.json()

    const output = await replicate.run(
      "hjunior29/video-text-remover",
      {
        input: {
          video: videoUrl,
          method: "hybrid",
          conf_threshold: 0.25,
          iou_threshold: 0.45,
          margin: 5,
          resolution: "720p",
          detection_interval: 5,
        }
      }
    )

    return NextResponse.json({ outputUrl: output })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}