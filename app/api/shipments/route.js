import { NextResponse } from 'next/server';
import { loadData, saveData, getNextMasterAWB, generateBoxAWBs } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const data = loadData();
  return NextResponse.json(data.shipments);
}

export async function POST(request) {
  const body = await request.json();
  const data = loadData();

  const masterAWB = getNextMasterAWB();
  const totalBoxes = body.boxes.reduce((sum, b) => sum + (Number(b.count) || 0), 0);
  const boxAWBs = generateBoxAWBs(masterAWB, totalBoxes);

  const shipment = {
    id: uuidv4(),
    masterAWB,
    boxAWBs,
    customerId: body.customerId,
    pickupWarehouseId: body.pickupWarehouseId,
    deliveryWarehouseId: body.deliveryWarehouseId,
    boxes: body.boxes || [],
    invoiceNumber: body.invoiceNumber || '',
    invoiceAmount: body.invoiceAmount || 0,
    insurance: !!body.insurance,
    productDescription: body.productDescription || '',
    status: 'booked',
    createdAt: new Date().toISOString(),
  };

  data.shipments.push(shipment);
  saveData(data);

  return NextResponse.json(shipment);
}
