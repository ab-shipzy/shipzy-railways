'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [counts, setCounts] = useState({ shipments: 0, customers: 0, warehouses: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/shipments').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([s, c, w]) => setCounts({ shipments: s.length, customers: c.length, warehouses: w.length }));
  }, []);

  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, flex: 1, minWidth: 180 };
  const link = { color: '#0074ff', fontSize: 13, textDecoration: 'none', fontWeight: 500 };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Dashboard</h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>Railway logistics overview</p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Total Shipments</p>
          <p style={{ margin: '8px 0', fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{counts.shipments}</p>
          <Link href="/shipments" style={link}>View all →</Link>
        </div>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Customers</p>
          <p style={{ margin: '8px 0', fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{counts.customers}</p>
          <Link href="/customers" style={link}>Manage →</Link>
        </div>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Warehouses</p>
          <p style={{ margin: '8px 0', fontSize: 32, fontWeight: 700, color: '#0f172a' }}>{counts.warehouses}</p>
          <Link href="/warehouses" style={link}>Manage →</Link>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        <Link href="/booking" style={{ background: '#0074ff', color: '#fff', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>+ New Booking</Link>
        <Link href="/customers" style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#0f172a', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Add Customer</Link>
        <Link href="/warehouses" style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#0f172a', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Add Warehouse</Link>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Recent Activity</h2>
      <p style={{ color: '#64748b', fontSize: 14 }}>Create a booking to see activity here.</p>
    </div>
  );
}
