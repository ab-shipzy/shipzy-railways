import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const API_KEY = process.env.RAIL_API_KEY || '';

async function fetchLiveStatus(trainNumber, date) {
  if (!trainNumber || !API_KEY) return null;
  try {
    const res = await fetch(`https://ir.railcore.tech/v1/trains/${trainNumber}/live${date ? `?date=${date}` : ''}`, {
      headers: { 'X-RailCore-Key': API_KEY },
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    if (!json.success) return null;
    const d = json.data;
    return {
      lastStation: d.current_station_name || '',
      delayMinutes: d.delay_minutes || 0,
      status: d.delay_minutes > 10 ? 'delayed' : 'on-time',
      destEta: d.eta_destination_at || '',
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const result = await pool.query(`
    SELECT id, train_number, train_date FROM shipments
    WHERE train_number IS NOT NULL AND train_number != ''
  `);

  let updated = 0;
  for (const row of result.rows) {
    const status = await fetchLiveStatus(row.train_number, row.train_date);
    if (status) {
      await pool.query(
        `UPDATE shipments SET last_station=$1, delay_minutes=$2, train_status=$3, dest_eta=$4 WHERE id=$5`,
        [status.lastStation, status.delayMinutes, status.status, status.destEta, row.id]
      );
      updated++;
    }
  }

  return NextResponse.json({ ok: true, updated, total: result.rows.length });
}
