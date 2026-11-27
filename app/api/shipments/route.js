import { getShipments, addShipment, nextAWB } from '../../../lib/db';

export async function GET() {
  const shipments = await getShipments();
  return Response.json(shipments, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function POST(req) {
  const body = await req.json();
  const master = await nextAWB();
  const totalBoxes = (body.boxes || []).reduce((s, b) => s + Number(b.count || 1), 0) || 1;
  const boxAWBs = [];
  let current = parseInt(master, 10);
  for (let i = 0; i < totalBoxes; i++) {
    // Skip numbers with zeros
    while (String(current).includes('0')) current++;
    boxAWBs.push(String(current));
    current++;
  }
  const shipment = await addShipment({
    ...body,
    masterAWB: master,
    boxAWBs,
  });
  return Response.json(shipment);
}
