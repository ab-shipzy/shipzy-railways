'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [counts, setCounts] = useState({ shipments: 0, customers: 0, warehouses: 0 });
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/shipments').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
    ]).then(([shipments, customers, warehouses]) => {
      setCounts({ shipments: shipments.length, customers: customers.length, warehouses: warehouses.length });

      // Group by train + arrival time
      const trainMap = {};
      shipments.forEach(s => {
        if (!s.trainNumber || !s.destEta) return;
        const key = `${s.trainNumber}|${s.destEta}`;
        if (!trainMap[key]) {
          trainMap[key] = {
            trainNumber: s.trainNumber,
            trainName: s.trainName || '',
            destCode: s.destCode || '',
            destEta: s.destEta,
            boxes: 0,
            awbs: [],
          };
        }
        trainMap[key].boxes += (s.boxAWBs || []).length || 1;
        trainMap[key].awbs.push(s.masterAWB);
      });

      // Sort by arrival time (nearest first)
      const sorted = Object.values(trainMap).sort((a, b) => new Date(a.destEta) - new Date(b.destEta));
      setArrivals(sorted);
    });
  }, []);

  const card = { background: '#fff', border: '1px solid #e5eaf3', borderRadius: 16, padding: 20 };

  const formatTime = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return '—'; }
  };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {/* Left: Stats */}
      <div style={{ flex: 1, minWidth: 400 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#0a1b3d' }}>Dashboard</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#5b6b82' }}>Railway logistics overview</p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div style={{ ...card, flex: 1, minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Shipments</p>
            <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#146bff' }}>{counts.shipments}</p>
          </div>
          <div style={{ ...card, flex: 1, minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Customers</p>
            <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#0a1b3d' }}>{counts.customers}</p>
          </div>
          <div style={{ ...card, flex: 1, minWidth: 140 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#5b6b82', fontWeight: 500 }}>Warehouses</p>
            <p style={{ margin: '8px 0 0', fontSize: 32, fontWeight: 700, color: '#0a1b3d' }}>{counts.warehouses}</p>
          </div>
        </div>

        <Link href="/booking" style={{ display: 'inline-block', background: '#146bff', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          + New Booking
        </Link>
      </div>

      {/* Right: Train Arrivals */}
      <div style={{ width: 360, minWidth: 300 }}>
        <div style={{ ...card, padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5eaf3' }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0a1b3d' }}>Upcoming Arrivals</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5b6b82' }}>Trains reaching soon — contact vendor</p>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {arrivals.length === 0 && (
              <p style={{ padding: 20, color: '#5b6b82', fontSize: 13, textAlign: 'center' }}>No upcoming arrivals</p>
            )}
            {arrivals.map((a, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0a1b3d', fontSize: 14 }}>{a.trainNumber}</div>
                    <div style={{ fontSize: 12, color: '#5b6b82' }}>{a.trainName}</div>
                  </div>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>
                    {a.boxes} boxes
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#0a1b3d' }}>
                  <span style={{ fontWeight: 500 }}>{a.destCode}</span>
                  <span style={{ color: '#5b6b82' }}> · {formatTime(a.destEta)}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
                  {a.awbs.length} shipment{a.awbs.length > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
