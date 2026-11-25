import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let initPromise = null;

async function ensureTables() {
  if (initPromise) return initPromise;
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

        CREATE TABLE IF NOT EXISTS stations (
          id TEXT PRIMARY KEY,
          code TEXT,
          name TEXT,
          city TEXT,
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

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        INSERT INTO settings (key, value) VALUES ('awb_counter', '30000001')
        ON CONFLICT (key) DO NOTHING;
      `);
    } catch (err) {
      if (err.code !== '23505' && !String(err.message).includes('already exists')) {
        initPromise = null;
        throw err;
      }
    }
  })();
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
    createdAt: row.created_at,
  }));
}

export async function getWarehouses() {
  await ensureTables();
  const r = await pool.query('SELECT * FROM warehouses ORDER BY created_at DESC');
  return r.rows.map(row => ({
    id: row.id, name: row.name, address: row.address, city: row.city, state: row.state,
    pin: row.pin, contact: row.contact, pocName: row.poc_name, phone: row.phone,
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

export { pool };
