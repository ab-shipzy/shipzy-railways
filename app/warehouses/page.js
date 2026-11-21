'use client';

import { useState, useEffect } from 'react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pin: '', pocName: '', phone: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', address: '', city: '', state: '', pin: '', pocName: '', phone: '' });
    setShowForm(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({
      name: w.name || '', address: w.address || '', city: w.city || '',
      state: w.state || '', pin: w.pin || '', pocName: w.pocName || '', phone: w.phone || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/warehouses/${editing.id}` : '/api/warehouses';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this warehouse?')) return;
    await fetch(`/api/warehouses/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Warehouses / Hubs</h1>
          <p className="text-sm text-slate-500">Settings • Manage pickup and delivery hubs</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add Hub</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Hub' : 'Add Hub'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="input" placeholder="Hub name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <textarea className="input" placeholder="Hub address" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className="input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              <input className="input" placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
              <input className="input" placeholder="PIN code" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Point of contact name" value={form.pocName} onChange={e => setForm({...form, pocName: e.target.value})} />
              <input className="input" placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500 bg-slate-50">
              <th className="py-3 px-3">Hub Name</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3">PIN</th>
              <th className="py-3 px-3">POC</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(w => (
              <tr key={w.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-3 font-medium">{w.name}</td>
                <td className="py-3 px-3">{w.city || '—'}</td>
                <td className="py-3 px-3">{w.state || '—'}</td>
                <td className="py-3 px-3">{w.pin || '—'}</td>
                <td className="py-3 px-3">{w.pocName || '—'}</td>
                <td className="py-3 px-3">{w.phone || '—'}</td>
                <td className="py-3 px-3">
                  <button onClick={() => openEdit(w)} className="text-[#0074ff] text-xs mr-3 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(w.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {warehouses.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No hubs yet.</p>}
      </div>
    </div>
  );
}
