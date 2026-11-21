import { NextResponse } from 'next/server';
import { loadData, saveData } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const data = loadData();
  return NextResponse.json(data.warehouses);
}

export async function POST(request) {
  const body = await request.json();
  const data = loadData();
  const warehouse = {
    id: uuidv4(),
    name: body.name || '',
    address: body.address || '',
    city: body.city || '',
    state: body.state || '',
    pin: body.pin || '',
    contact: body.contact || '',
    createdAt: new Date().toISOString(),
  };
  data.warehouses.push(warehouse);
  saveData(data);
  return NextResponse.json(warehouse);
}
