import { NextResponse } from 'next/server';
import { getStore } from '@/lib/mockStore';

export async function GET() {
  const store = getStore();
  return NextResponse.json({
    status: 'online',
    online_devices: store.onlineDevices,
    online_count: store.onlineDevices.length,
    history: store.history.slice().reverse(), // newest first
  });
}
