import { NextRequest, NextResponse } from 'next/server';
import { deleteHistoryItem } from '@/lib/mockStore';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // <— note Promise
) {
  const { id } = await context.params; // await it
  const ok = deleteHistoryItem(id);

  if (ok) {
    return NextResponse.json({ status: 'deleted' });
  }

  return NextResponse.json({ error: 'not found' }, { status: 404 });
}