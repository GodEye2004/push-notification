import { NextResponse } from 'next/server';
import { getStore } from '@/lib/mockStore';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.apps);
}
