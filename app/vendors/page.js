'use client';

import { useState, useEffect } from 'react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', gst: '', address: '', phone: '', station: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch('/api/vendors').then(r => r.json()).then(setVendors);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', gst: '', address: '', phone: '', station: '' });
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ name: v.name || '', gst: v.gst || '', address: v.address || '', phone: v.phone || '', station: v.station || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/vendors/${editing.id}` : '/api/vendors';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return;
    await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-500">Settings • Railway booking agents</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add Vendor</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="input" placeholder="Vendor / agent name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="input" placeholder="GST number" value={form.gst} onChange={e => setForm({...form, gst: e.target.value.toUpperCase()})} />
            <textarea className="input" placeholder="Address" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Phone number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <input className="input" placeholder="Station / location" value={form.station} onChange={e => setForm({...form, station: e.target.value})} />
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
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">GST</th>
              <th className="py-3 px-3">Station</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-3 font-medium">{v.name}</td>
                <td className="py-3 px-3 font-mono text-xs">{v.gst || '—'}</td>
                <td className="py-3 px-3">{v.station || '—'}</td>
                <td className="py-3 px-3">{v.phone || '—'}</td>
                <td className="py-3 px-3">
                  <button onClick={() => openEdit(v)} className="text-[#0074ff] text-xs mr-3 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No vendors yet.</p>}
      </div>
    </div>
  );
}
