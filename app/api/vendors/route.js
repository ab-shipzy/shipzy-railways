import { NextResponse } from 'next/server';
import { getVendors, addVendor } from '@/lib/db';

export async function GET() {
  const vendors = await getVendors();
  return NextResponse.json(vendors);
}

export async function POST(req) {
  const body = await req.json();
  const vendor = await addVendor(body);
  return NextResponse.json(vendor);
}
