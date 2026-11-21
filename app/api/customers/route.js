import { NextResponse } from 'next/server';
import { loadData, saveData } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const data = loadData();
  return NextResponse.json(data.customers);
}

export async function POST(request) {
  const body = await request.json();
  const data = loadData();
  const customer = {
    id: uuidv4(),
    name: body.name || '',
    email: body.email || '',
    phone: body.phone || '',
    address: body.address || '',
    createdAt: new Date().toISOString(),
  };
  data.customers.push(customer);
  saveData(data);
  return NextResponse.json(customer);
}
