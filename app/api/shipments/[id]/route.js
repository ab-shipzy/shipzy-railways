import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const API_KEY = process.env.RAIL_API_KEY || '';

function toISO(dateStr) {
  if (!dateStr) return '';
  const m = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return dateStr;
}

async function fetchTrainDetails(trainNumber, date) {
  if (!trainNumber || !API_KEY) return null;
  const iso = toISO(date);
  try {
    const res = await fetch(`https://ir.railcore.tech/v1/trains/${trainNumber}/live${iso ? `?date=${iso}` : ''}`, {
      headers: { 'X-RailCore-Key': API_KEY },
      signal: AbortSignal.timeout(10000),
    });
    const json = await res.json();
    if (!json.success) return null;
    const d = json.data;
    const first = d.stations?.[0];
    return {
      trainName: d.train_name || '',
      originDeparture: first?.scheduled_departure || first?.etd || '',
      destEta: d.eta_destination_at || '',
      lastStation: d.current_station_name || '',
      delayMinutes: d.delay_minutes || 0,
      status: d.delay_minutes > 10 ? 'delayed' : 'on-time',
    };
  } catch {
    return null;
  }
}

export async function PUT(req, { params }) {
  const body = await req.json();
  const { id } = params;

  let trainDetails = null;
  if (body.trainNumber) {
    trainDetails = await fetchTrainDetails(body.trainNumber, body.trainDate);
  }

  await pool.query(
    `UPDATE shipments SET
      pickup_warehouse_id=$1, delivery_warehouse_id=$2,
      invoice_number=$3, invoice_amount=$4, insurance=$5,
      product_description=$6, remarks=$7,
      train_number=$8, train_date=$9, train_status=$10,
      train_name=$11, origin_departure=$12, dest_eta=$13,
      last_station=$14, delay_minutes=$15
     WHERE id=$16`,
    [
      body.pickupWarehouseId, body.deliveryWarehouseId,
      body.invoiceNumber, body.invoiceAmount, body.insurance,
      body.productDescription, body.remarks,
      body.trainNumber, body.trainDate,
      trainDetails?.status || body.trainStatus || '',
      trainDetails?.trainName || '',
      trainDetails?.originDeparture || '',
      trainDetails?.destEta || '',
      trainDetails?.lastStation || '',
      trainDetails?.delayMinutes || 0,
      id,
    ]
  );
  return NextResponse.json({ ok: true, trainDetails });
}
