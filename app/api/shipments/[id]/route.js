import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function PUT(req, { params }) {
  const body = await req.json();
  const { id } = params;
  await pool.query(
    `UPDATE shipments SET
      pickup_warehouse_id=$1, delivery_warehouse_id=$2,
      invoice_number=$3, invoice_amount=$4, insurance=$5,
      product_description=$6, remarks=$7,
      train_number=$8, train_date=$9, train_status=$10
     WHERE id=$11`,
    [
      body.pickupWarehouseId, body.deliveryWarehouseId,
      body.invoiceNumber, body.invoiceAmount, body.insurance,
      body.productDescription, body.remarks,
      body.trainNumber, body.trainDate, body.trainStatus,
      id,
    ]
  );
  return NextResponse.json({ ok: true });
}
