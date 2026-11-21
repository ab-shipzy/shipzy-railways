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
    <div>
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 max-w-md">
        <input className="border p-2 w-full" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="border p-2 w-full" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input className="border p-2 w-full" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <textarea className="border p-2 w-full" placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Customer</button>
      </form>
      <ul className="space-y-2">
        {customers.map(c => (
          <li key={c.id} className="border p-2">{c.name} - {c.email} - {c.phone}</li>
        ))}
      </ul>
    </div>
  );
}
