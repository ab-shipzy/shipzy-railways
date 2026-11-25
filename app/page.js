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
        if (d === today) t++;
        else if (d === tom) tm++;
        else if (d > tom) l++;
      });
      setTrains({ today: t, tomorrow: tm, later: l });
    });
  }, []);

  const cards = [
    { label: 'Shipments', value: counts.shipments, href: '/shipments', icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Customers', value: counts.customers, href: '/customers', icon: '👥', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Warehouses', value: counts.warehouses, href: '/warehouses', icon: '🏭', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6">Railway logistics overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${c.color}`}>{c.icon}</div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{c.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{c.value}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Train Arrivals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-lg">🟢</span><span className="text-sm font-medium text-slate-600">Today</span></div>
          <p className="text-3xl font-bold text-emerald-600">{trains.today}</p>
          <p className="text-xs text-slate-400 mt-1">trains reaching today</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-lg">🟡</span><span className="text-sm font-medium text-slate-600">Tomorrow</span></div>
          <p className="text-3xl font-bold text-amber-600">{trains.tomorrow}</p>
          <p className="text-xs text-slate-400 mt-1">trains reaching tomorrow</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><span className="text-lg">🔵</span><span className="text-sm font-medium text-slate-600">Later</span></div>
          <p className="text-3xl font-bold text-blue-600">{trains.later}</p>
          <p className="text-xs text-slate-400 mt-1">upcoming trains</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <Link href="/booking" className="bg-brand text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-deep">+ New Booking</Link>
        <Link href="/shipments" className="bg-white border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">View Shipments</Link>
        <Link href="/customers" className="bg-white border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50">Add Customer</Link>
      </div>
    </div>
  );
}
