import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })

  const plans = { Free: 0, Pro: 19, Creator: 49, Business: 99 }
  const totalUsers = profiles?.length || 0
  const mrr = profiles?.reduce((a, p) => a + (plans[p.plan] || 0), 0) || 0
  const planCount = profiles?.reduce((a, p) => {
    a[p.plan] = (a[p.plan] || 0) + 1
    return a
  }, {}) || {}

  return NextResponse.json({ totalUsers, mrr, planCount, profiles })
}