import { NextResponse } from 'next/server';

export async function POST() {
  // no-op for mock
  return NextResponse.json({ status: 'ok' });
}
