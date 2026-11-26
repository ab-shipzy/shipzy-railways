import { NextResponse } from 'next/server';
import { updateWarehouse, deleteWarehouse } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  const body = await req.json();
  const result = await updateWarehouse(params.id, body);
  return NextResponse.json(result);
}

export async function DELETE(req, { params }) {
  await deleteWarehouse(params.id);
  return NextResponse.json({ ok: true });
}
