import { NextResponse } from 'next/server';
import { updateCustomer, deleteCustomer } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  const body = await req.json();
  const result = await updateCustomer(params.id, body);
  return NextResponse.json(result);
}

export async function DELETE(req, { params }) {
  await deleteCustomer(params.id);
  return NextResponse.json({ ok: true });
}
