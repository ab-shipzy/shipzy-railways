import { getWarehouses, addWarehouse } from '../../../lib/db';

export async function GET() {
  const warehouses = await getWarehouses();
  return Response.json(warehouses);
}

export async function POST(req) {
  const body = await req.json();
  const warehouse = await addWarehouse(body);
  return Response.json(warehouse);
}
