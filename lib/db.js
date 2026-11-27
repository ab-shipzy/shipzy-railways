import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let initPromise = null;

async function ensureTables() {
  if (initPromise) // One-time reset to new starting AWB
      pool.query("UPDATE settings SET value = '322552617' WHERE key = 'awb_counter' AND CAST(value AS BIGINT) < 322552617").catch(() => {});
  return initPromise;
  initPromise = (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          address TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS warehouses (
          id TEXT PRIMARY KEY,
          name TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          pin TEXT,
          contact TEXT,
          poc_name TEXT,
          phone TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS poc_name TEXT;
        ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS consignee_name TEXT;
        ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS company_name TEXT;
        ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS show_phone_on_label BOOLEAN DEFAULT FALSE;

        CREATE TABLE IF NOT EXISTS stations (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT,
          city TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY,
          name TEXT,
          gst TEXT,
          address TEXT,
          phone TEXT,
          station TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS shipments (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
          origin_station_id TEXT,
          destination_station_id TEXT,
          pickup_warehouse_id TEXT,
          delivery_warehouse_id TEXT,
          master_awb TEXT,
          box_awbs JSONB,
          invoice_number TEXT,
          invoice_amount TEXT,
          insurance BOOLEAN,
          product_description TEXT,
          remarks TEXT,
          boxes JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_station_id TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_station_id TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS train_number TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS train_date TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS train_status TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS train_name TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_departure TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS dest_eta TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS last_station TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delay_minutes INTEGER;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_code TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS dest_code TEXT;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS costs JSONB;
        ALTER TABLE shipments ADD COLUMN IF NOT EXISTS revenues JSONB;

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        INSERT INTO settings (key, value) VALUES ('awb_counter', '322552617')
        ON CONFLICT (key) DO NOTHING;
      `);
    } catch (err) {
      if (err.code !== '23505' && !String(err.message).includes('already exists')) {
        initPromise = null;
        throw err;
      }
    }
  })();
  // One-time reset to new starting AWB
      pool.query("UPDATE settings SET value = '322552617' WHERE key = 'awb_counter' AND CAST(value AS BIGINT) < 322552617").catch(() => {});
  return initPromise;
}

export async function getShipments() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
  return r.rows.map(row => ({
    id: row.id,
    customerId: row.customer_id,
    originStationId: row.origin_station_id,
    destinationStationId: row.destination_station_id,
    pickupWarehouseId: row.pickup_warehouse_id,
    deliveryWarehouseId: row.delivery_warehouse_id,
    masterAWB: row.master_awb,
    boxAWBs: row.box_awbs || [],
    invoiceNumber: row.invoice_number,
    invoiceAmount: row.invoice_amount,
    insurance: row.insurance,
    productDescription: row.product_description,
    remarks: row.remarks,
    boxes: row.boxes || [],
    trainNumber: row.train_number,
    trainDate: row.train_date,
    trainStatus: row.train_status,
    trainName: row.train_name,
    originCode: row.origin_code,
    destCode: row.dest_code,
    originDeparture: row.origin_departure,
    destEta: row.dest_eta,
    lastStation: row.last_station,
    delayMinutes: row.delay_minutes,
    costs: row.costs || {},
    revenues: row.revenues || {},
    createdAt: row.created_at,
  }));
}

export async function getWarehouses() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM warehouses ORDER BY created_at DESC');
  return r.rows.map(row => ({
    id: row.id, name: row.name, address: row.address, city: row.city, state: row.state,
    pin: row.pin, contact: row.contact, pocName: row.poc_name, phone: row.phone,
    consigneeName: row.consignee_name, companyName: row.company_name, showPhoneOnLabel: row.show_phone_on_label,
  }));
}

export async function getStations() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM stations ORDER BY code');
  return r.rows.map(row => ({ id: row.id, code: row.code, name: row.name, city: row.city }));
}

export async function getCustomers() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
  return r.rows.map(row => ({ id: row.id, name: row.name, email: row.email, phone: row.phone, address: row.address }));
}

export async function getVendors() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC');
  return r.rows.map(row => ({
    id: row.id, name: row.name, gst: row.gst, address: row.address, phone: row.phone, station: row.station,
  }));
}

export async function addVendor(data) {
  await ensureTables();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await pool.query(
    'INSERT INTO vendors (id, name, gst, address, phone, station) VALUES ($1,$2,$3,$4,$5,$6)',
    [id, data.name, data.gst, data.address, data.phone, data.station]
  );
  return { id, ...data };
}


export async function addCustomer(data) {
  await ensureTables();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await pool.query(
    'INSERT INTO customers (id, name, email, phone, address) VALUES ($1,$2,$3,$4,$5)',
    [id, data.name, data.email, data.phone, data.address]
  );
  return { id, ...data };
}

export async function updateCustomer(id, data) {
  await ensureTables();
  await pool.query(
    'UPDATE customers SET name=$1, email=$2, phone=$3, address=$4 WHERE id=$5',
    [data.name, data.email, data.phone, data.address, id]
  );
  return { id, ...data };
}

export async function deleteCustomer(id) {
  await ensureTables();
  await pool.query('DELETE FROM customers WHERE id=$1', [id]);
  return { ok: true };
}

export async function addWarehouse(data) {
  await ensureTables();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await pool.query(
    'INSERT INTO warehouses (id, name, address, city, state, pin, poc_name, phone, consignee_name, company_name, show_phone_on_label) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
    [id, data.name, data.address, data.city, data.state, data.pin, data.pocName, data.phone, data.consigneeName, data.companyName, data.showPhoneOnLabel || false]
  );
  return { id, ...data };
}

export async function updateWarehouse(id, data) {
  await ensureTables();
  await pool.query(
    'UPDATE warehouses SET name=$1, address=$2, city=$3, state=$4, pin=$5, poc_name=$6, phone=$7, consignee_name=$8, company_name=$9, show_phone_on_label=$10 WHERE id=$11',
    [data.name, data.address, data.city, data.state, data.pin, data.pocName, data.phone, data.consigneeName, data.companyName, data.showPhoneOnLabel || false, id]
  );
  return { id, ...data };
}

export async function deleteWarehouse(id) {
  await ensureTables();
  await pool.query('DELETE FROM warehouses WHERE id=$1', [id]);
  return { ok: true };
}

export async function updateVendor(id, data) {
  await ensureTables();
  await pool.query(
    'UPDATE vendors SET name=$1, gst=$2, address=$3, phone=$4, station=$5 WHERE id=$6',
    [data.name, data.gst, data.address, data.phone, data.station, id]
  );
  return { id, ...data };
}

export async function deleteVendor(id) {
  await ensureTables();
  await pool.query('DELETE FROM vendors WHERE id=$1', [id]);
  return { ok: true };
}


function hasZero(n) {
  return String(n).includes('0');
}

function nextNoZero(n) {
  let x = n;
  while (hasZero(x)) x++;
  return x;
}

export async function resetAWBCounter() {
  await ensureTables();
  await pool.query("UPDATE settings SET value = '322552617' WHERE key = 'awb_counter'");
}

export async function nextAWB() {
  await ensureTables();
  const r = await pool.query("SELECT value FROM settings WHERE key = 'awb_counter'");
  let current = parseInt(r.rows[0]?.value || '322552617', 10);
  current = nextNoZero(current);
  let next = current + 1;
  next = nextNoZero(next);
  await pool.query("UPDATE settings SET value = $1 WHERE key = 'awb_counter'", [String(next)]);
  return String(current);
}

export async function nextChildAWB(master) {
  let base = parseInt(master, 10);
  const children = [];
  let next = base + 1;
  return nextNoZero(next);
}


export async function addShipment(data) {
  await ensureTables();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await pool.query(
    `INSERT INTO shipments (id, customer_id, origin_station_id, destination_station_id,
      pickup_warehouse_id, delivery_warehouse_id, master_awb, box_awbs,
      invoice_number, invoice_amount, insurance, product_description, remarks, boxes,
      train_number, train_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
    [id, data.customerId, data.originStationId, data.destinationStationId,
     data.pickupWarehouseId, data.deliveryWarehouseId, data.masterAWB, JSON.stringify(data.boxAWBs || []),
     data.invoiceNumber, data.invoiceAmount, data.insurance, data.productDescription, data.remarks, JSON.stringify(data.boxes || []),
     data.trainNumber || '', data.trainDate || '']
  );
  return { id, ...data };
}

export { pool };
