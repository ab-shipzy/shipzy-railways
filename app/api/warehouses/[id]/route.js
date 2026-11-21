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
    'UPDATE warehouses SET name=$1, address=$2, city=$3, state=$4, pin=$5, contact=$6 WHERE id=$7',
    [body.name, body.address, body.city, body.state, body.pin, body.contact, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await pool.query('DELETE FROM warehouses WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
