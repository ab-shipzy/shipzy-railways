'use client';

import { useState, useEffect } from 'react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newC = await res.json();
    setCustomers([...customers, newC]);
    setForm({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Customers</h2>
      <div className="card mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <textarea className="input" placeholder="Address" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <button type="submit" className="btn-primary">Add Customer</button>
        </form>
      </div>
      <div className="space-y-2">
        {customers.map(c => (
          <div key={c.id} className="card py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-slate-500">{c.email} · {c.phone}</div>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-slate-500 text-sm">No customers yet.</p>}
      </div>
    </div>
  );
}
