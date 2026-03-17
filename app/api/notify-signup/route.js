import { NextResponse } from 'next/server'

export async function POST(request) {
  const { name, email } = await request.json()
  
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ClearCut <onboarding@resend.dev>',
      to: 'elouan.lvv@gmail.com
      subject: '🎉 Nouvel inscrit sur ClearCut !',
      html: `<h2>Nouvel utilisateur inscrit</h2><p><strong>Nom :</strong> ${name}</p><p><strong>Email :</strong> ${email}</p><p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>`,
    }),
  })

  return NextResponse.json({ ok: true })
}