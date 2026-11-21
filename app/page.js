'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, []);

  const todayCount = shipments.filter(s => {
    const d = new Date(s.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm">Live overview of railway logistics operations</p>
        </div>
        <Link href="/booking" className="btn-primary">+ New Booking</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Today's Activity</div>
          <div className="text-3xl font-bold mt-2">{todayCount}</div>
          <div className="text-xs text-emerald-600 mt-1">LIVE</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Total Shipments</div>
          <div className="text-3xl font-bold mt-2">{shipments.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-slate-500 uppercase tracking-wide">Customers</div>
          <div className="text-3xl font-bold mt-2">{customers.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Active Shipments</h2>
          <Link href="/shipments" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {shipments.slice(0, 5).map(s => (
            <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
              <div>
                <span className="font-mono font-medium">{s.masterAWB}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">BOOKED</span>
              </div>
              <div className="text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
          {shipments.length === 0 && <p className="text-slate-500 text-sm">No shipments yet. Create your first booking.</p>}
        </div>
      </div>
    </div>
  );
}
