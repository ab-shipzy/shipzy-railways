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

export async function getCustomers() {
  await ensureTables();
  const { rows } = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
  return rows.map(r => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, address: r.address }));
}

export async function addCustomer(c) {
  await ensureTables();
  const id = Date.now().toString();
  await pool.query(
    'INSERT INTO customers (id, name, email, phone, address) VALUES ($1,$2,$3,$4,$5)',
    [id, c.name, c.email, c.phone, c.address]
  );
  return { id, ...c };
}

export async function getWarehouses() {
  await ensureTables();
  const { rows } = await pool.query('SELECT * FROM warehouses ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id, name: r.name, address: r.address, city: r.city, state: r.state, pin: r.pin,
    contact: r.contact, pocName: r.poc_name, phone: r.phone,
  }));
}

export async function addWarehouse(w) {
  await ensureTables();
  const id = Date.now().toString();
  await pool.query(
    'INSERT INTO warehouses (id, name, address, city, state, pin, contact, poc_name, phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, w.name, w.address, w.city, w.state, w.pin, w.contact, w.pocName, w.phone]
  );
  return { id, ...w };
}

export async function getStations() {
  await ensureTables();
  const { rows } = await pool.query('SELECT * FROM stations ORDER BY name');
  return rows.map(r => ({ id: r.id, code: r.code, name: r.name, city: r.city }));
}

export async function addStation(s) {
  await ensureTables();
  const id = Date.now().toString();
  await pool.query(
    'INSERT INTO stations (id, code, name, city) VALUES ($1,$2,$3,$4)',
    [id, s.code, s.name, s.city]
  );
  return { id, ...s };
}

export async function getShipments() {
  await ensureTables();
  const { rows } = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id,
    customerId: r.customer_id,
    originStationId: r.origin_station_id,
    destinationStationId: r.destination_station_id,
    pickupWarehouseId: r.pickup_warehouse_id,
    deliveryWarehouseId: r.delivery_warehouse_id,
    masterAWB: r.master_awb,
    boxAWBs: r.box_awbs,
    invoiceNumber: r.invoice_number,
    invoiceAmount: r.invoice_amount,
    insurance: r.insurance,
    productDescription: r.product_description,
    remarks: r.remarks,
    boxes: r.boxes,
    createdAt: r.created_at,
  }));
}

export async function addShipment(s) {
  await ensureTables();
  const id = Date.now().toString();
  await pool.query(
    `INSERT INTO shipments (id, customer_id, origin_station_id, destination_station_id, pickup_warehouse_id, delivery_warehouse_id, master_awb, box_awbs, invoice_number, invoice_amount, insurance, product_description, remarks, boxes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [id, s.customerId, s.originStationId, s.destinationStationId, s.pickupWarehouseId, s.deliveryWarehouseId, s.masterAWB, JSON.stringify(s.boxAWBs), s.invoiceNumber, s.invoiceAmount, s.insurance, s.productDescription, s.remarks, JSON.stringify(s.boxes || [])]
  );
  return { id, ...s, createdAt: new Date().toISOString() };
}

export async function nextAWB() {
  await ensureTables();
  const { rows } = await pool.query(`
    UPDATE settings SET value = (value::int + 1)::text WHERE key = 'awb_counter' RETURNING value
  `);
  const num = parseInt(rows[0].value, 10) - 1;
  return String(num).padStart(8, '0');
}
