import { NextResponse } from 'next/server';
import { trackTrain } from '../../../../lib/train';

export async function GET(req, { params }) {
  const { trainNumber } = params;
  const date = req.nextUrl.searchParams.get('date') || '';
  const data = await trackTrain(trainNumber, date);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}
