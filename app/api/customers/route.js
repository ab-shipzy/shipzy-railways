import { getCustomers, addCustomer } from '../../../lib/db';

export async function GET() {
  const customers = await getCustomers();
  return Response.json(customers);
}

export async function POST(req) {
  const body = await req.json();
  const customer = await addCustomer(body);
  return Response.json(customer);
}
