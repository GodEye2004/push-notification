import { NextResponse } from 'next/server';
import { deleteHistoryItem } from '@/lib/mockStore';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const ok = deleteHistoryItem(id);
  if (ok) return NextResponse.json({ status: 'deleted' });
  return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
}
