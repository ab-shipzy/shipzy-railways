'use client';

import { useState, useEffect } from 'react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pin: '', contact: '' });

  useEffect(() => {
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newW = await res.json();
    setWarehouses([newW, ...warehouses]);
    setForm({ name: '', address: '', city: '', state: '', pin: '', contact: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Warehouses</h1>
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Warehouse name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <textarea className="input" placeholder="Full address" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <div className="grid grid-cols-3 gap-3">
            <input className="input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
            <input className="input" placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            <input className="input" placeholder="PIN" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} />
          </div>
          <input className="input" placeholder="Contact" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
          <button type="submit" className="btn-primary">Add Warehouse</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">PIN</th>
              <th className="py-3 px-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(w => (
              <tr key={w.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-3 font-medium">{w.name}</td>
                <td className="py-3 px-3">{w.city || '—'}</td>
                <td className="py-3 px-3">{w.state || '—'}</td>
                <td className="py-3 px-3">{w.pin || '—'}</td>
                <td className="py-3 px-3">{w.contact || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {warehouses.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No warehouses yet.</p>}
      </div>
    </div>
  );
}
