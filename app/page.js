'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [counts, setCounts] = useState({ shipments: 0, customers: 0, warehouses: 0 });
  const [trains, setTrains] = useState({ today: 0, tomorrow: 0, later: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/shipments').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([s, c, w]) => {
      setCounts({ shipments: s.length, customers: c.length, warehouses: w.length });
      const today = new Date().toISOString().slice(0, 10);
      const tom = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      let t = 0, tm = 0, l = 0;
      s.forEach(sh => {
        const d = sh.trainDate || '';
        if (d === today) t++; else if (d === tom) tm++; else if (d > tom) l++;
      });
      setTrains({ today: t, tomorrow: tm, later: l });
    });
  }, []);

  const card = { background: '#fff', border: '1px solid #e5eaf3', borderRadius: 16, padding: 20 };

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#0a1b3d' }}>Dashboard</h1>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: '#5b6b82' }}>Railway logistics overview</p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ ...card, flex: 1, minWidth: 160 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Shipments</p>
          <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#146bff' }}>{counts.shipments}</p>
        </div>
        <div style={{ ...card, flex: 1, minWidth: 160 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Customers</p>
          <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#0a1b3d' }}>{counts.customers}</p>
        </div>
        <div style={{ ...card, flex: 1, minWidth: 160 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Warehouses</p>
          <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#0a1b3d' }}>{counts.warehouses}</p>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px', color: '#0a1b3d' }}>Train Arrivals</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ ...card, flex: 1, minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#00b8c9' }} />
            <span style={{ fontSize: 13, color: '#5b6b82' }}>Today</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#00b8c9' }}>{trains.today}</p>
        </div>
        <div style={{ ...card, flex: 1, minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#f59e0b' }} />
            <span style={{ fontSize: 13, color: '#5b6b82' }}>Tomorrow</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{trains.tomorrow}</p>
        </div>
        <div style={{ ...card, flex: 1, minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#146bff' }} />
            <span style={{ fontSize: 13, color: '#5b6b82' }}>Later</span>
          </div>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#146bff' }}>{trains.later}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/booking" style={{ background: '#146bff', color: '#fff', padding: '10px 20px', borderRadius: 20, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>+ New Booking</Link>
        <Link href="/shipments" style={{ background: '#fff', border: '1px solid #e5eaf3', color: '#0a1b3d', padding: '10px 20px', borderRadius: 20, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>View Shipments</Link>
      </div>
    </div>
  );
}
