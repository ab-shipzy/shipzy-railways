import { NextResponse } from 'next/server';
import { getStations, addStation } from '@/lib/db';

export async function GET() {
  const stations = await getStations();
  return NextResponse.json(stations);
}

export async function POST(req) {
  const body = await req.json();
  const station = await addStation(body);
  return NextResponse.json(station);
}
