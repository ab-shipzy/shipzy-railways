'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, warehouses: 0, shipments: 0 });

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/shipments').then(r => r.json()),
    ]).then(([c, w, s]) => {
      setStats({ customers: c.length, warehouses: w.length, shipments: s.length });
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Railway logistics overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Shipments</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{stats.shipments}</div>
          <Link href="/shipments" className="text-xs text-blue-600 mt-3 inline-block">View all →</Link>
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Customers</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{stats.customers}</div>
          <Link href="/customers" className="text-xs text-blue-600 mt-3 inline-block">Manage →</Link>
        </div>
        <div className="card p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Warehouses</div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{stats.warehouses}</div>
          <Link href="/warehouses" className="text-xs text-blue-600 mt-3 inline-block">Manage →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/booking" className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">+ New Booking</Link>
            <Link href="/customers" className="block px-4 py-3 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100">Add Customer</Link>
            <Link href="/warehouses" className="block px-4 py-3 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100">Add Warehouse</Link>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <p className="text-sm text-slate-500">Create a booking to see activity here.</p>
        </div>
      </div>
    </div>
  );
}
