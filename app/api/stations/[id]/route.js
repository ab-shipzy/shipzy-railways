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
    'UPDATE stations SET code=$1, name=$2, city=$3 WHERE id=$4',
    [body.code, body.name, body.city, id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const { id } = params;
  await pool.query('DELETE FROM stations WHERE id=$1', [id]);
  return NextResponse.json({ ok: true });
}
