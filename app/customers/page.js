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
    setCustomers([newC, ...customers]);
    setForm({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Customers</h1>
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

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Address</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-3 font-medium">{c.name}</td>
                <td className="py-3 px-3">{c.email || '—'}</td>
                <td className="py-3 px-3">{c.phone || '—'}</td>
                <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{c.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No customers yet.</p>}
      </div>
    </div>
  );
}
