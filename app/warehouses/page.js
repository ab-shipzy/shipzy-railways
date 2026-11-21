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
    setWarehouses([...warehouses, newW]);
    setForm({ name: '', address: '', city: '', state: '', pin: '', contact: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Warehouses</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
        <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <textarea className="border p-2 w-full" placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <input className="border p-2 w-full" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
        <input className="border p-2 w-full" placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
        <input className="border p-2 w-full" placeholder="PIN" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} />
        <input className="border p-2 w-full" placeholder="Contact" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Warehouse</button>
      </form>
      <ul className="space-y-2">
        {warehouses.map(w => (
          <li key={w.id} className="border p-2">{w.name} - {w.city} {w.pin}</li>
        ))}
      </ul>
    </div>
  );
}
