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
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS shipments (
          id TEXT PRIMARY KEY,
          customer_id TEXT,
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
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        INSERT INTO settings (key, value) VALUES ('awb_counter', '30000001')
        ON CONFLICT (key) DO NOTHING;
      `);
    } catch (err) {
      // Ignore concurrent creation race (duplicate type)
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
  return rows.map(r => ({ id: r.id, name: r.name, address: r.address, city: r.city, state: r.state, pin: r.pin, contact: r.contact }));
}

export async function addWarehouse(w) {
  await ensureTables();
  const id = Date.now().toString();
  await pool.query(
    'INSERT INTO warehouses (id, name, address, city, state, pin, contact) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [id, w.name, w.address, w.city, w.state, w.pin, w.contact]
  );
  return { id, ...w };
}

export async function getShipments() {
  await ensureTables();
  const { rows } = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
  return rows.map(r => ({
    id: r.id,
    customerId: r.customer_id,
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
    `INSERT INTO shipments (id, customer_id, pickup_warehouse_id, delivery_warehouse_id, master_awb, box_awbs, invoice_number, invoice_amount, insurance, product_description, remarks, boxes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [id, s.customerId, s.pickupWarehouseId, s.deliveryWarehouseId, s.masterAWB, JSON.stringify(s.boxAWBs), s.invoiceNumber, s.invoiceAmount, s.insurance, s.productDescription, s.remarks, JSON.stringify(s.boxes || [])]
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
