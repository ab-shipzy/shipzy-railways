import { NextResponse } from 'next/server';
import { updateVendor, deleteVendor } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  const body = await req.json();
  const result = await updateVendor(params.id, body);
  return NextResponse.json(result);
}

export async function DELETE(req, { params }) {
  await deleteVendor(params.id);
  return NextResponse.json({ ok: true });
}
