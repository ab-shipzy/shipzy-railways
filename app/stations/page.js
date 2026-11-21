'use client';

import { useState, useEffect } from 'react';

export default function StationsPage() {
  const [stations, setStations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', city: '' });
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch('/api/stations').then(r => r.json()).then(setStations);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', name: '', city: '' });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ code: s.code || '', name: s.name || '', city: s.city || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/stations/${editing.id}` : '/api/stations';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this station?')) return;
    await fetch(`/api/stations/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stations</h1>
          <p className="text-sm text-slate-500">Settings • Railway station repository</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add Station</button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit Station' : 'Add Station'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="input" placeholder="Station code (e.g. NDLS)" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required />
            <input className="input" placeholder="Station name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="input" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
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
              <th className="py-3 px-3">Code</th>
              <th className="py-3 px-3">Station Name</th>
              <th className="py-3 px-3">City</th>
              <th className="py-3 px-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-3 font-mono font-medium">{s.code}</td>
                <td className="py-3 px-3">{s.name}</td>
                <td className="py-3 px-3">{s.city || '—'}</td>
                <td className="py-3 px-3">
                  <button onClick={() => openEdit(s)} className="text-[#0074ff] text-xs mr-3 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stations.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No stations yet. Add origin and destination stations here.</p>}
      </div>
    </div>
  );
}
