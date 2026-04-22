import { NextResponse } from 'next/server'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const { resetMockDb } = await import('@/mocks/db')
  resetMockDb()

  return NextResponse.json({ ok: true, message: 'Mock DB resetado para o estado inicial.' })
}
