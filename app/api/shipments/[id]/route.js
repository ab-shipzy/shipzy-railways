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
    const stations = d.stations || [];
    const first = stations[0];
    const last = stations[stations.length - 1];
    return {
      trainName: d.train_name || '',
      originCode: first?.station_code || '',
      originName: first?.station_name || '',
      destCode: last?.station_code || '',
      destName: last?.station_name || '',
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
      customer_id=$1, vendor_id=$2,
      pickup_warehouse_id=$3, delivery_warehouse_id=$4,
      invoice_number=$5, invoice_amount=$6, insurance=$7,
      product_description=$8, remarks=$9,
      train_number=$10, train_date=$11, train_status=$12,
      train_name=$13, origin_code=$14, dest_code=$15, origin_departure=$16, dest_eta=$17,
      last_station=$18, delay_minutes=$19, costs=$20, revenues=$21
     WHERE id=$22`,
    [
      body.customerId, body.vendorId,
      body.pickupWarehouseId, body.deliveryWarehouseId,
      body.invoiceNumber, body.invoiceAmount, body.insurance,
      body.productDescription, body.remarks,
      body.trainNumber, body.trainDate,
      trainDetails?.status || body.trainStatus || '',
      trainDetails?.trainName || '',
      trainDetails?.originCode || '',
      trainDetails?.destCode || '',
      trainDetails?.originDeparture || '',
      trainDetails?.destEta || '',
      trainDetails?.lastStation || '',
      trainDetails?.delayMinutes || 0,
      JSON.stringify(body.costs || {}),
      JSON.stringify(body.revenues || {}),
      id,
    ]
  );
  return NextResponse.json({ ok: true, trainDetails });
}


export async function DELETE(req, { params }) {
  const { id } = params;
  await pool.query('DELETE FROM shipments WHERE id = $1', [id]);
  return NextResponse.json({ ok: true });
}
