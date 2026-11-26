'use client';

import { useState, useEffect } from 'react';

const tabs = [
  { id: 'vendors', label: 'Vendors' },
  { id: 'customers', label: 'Customers' },
  { id: 'warehouses', label: 'Warehouses' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('vendors');

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0a1b3d', marginBottom: 16 }}>Settings</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5eaf3' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: tab === t.id ? 600 : 500,
            color: tab === t.id ? '#146bff' : '#5b6b82',
            borderBottom: tab === t.id ? '2px solid #146bff' : '2px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'vendors' && <VendorsTab />}
      {tab === 'customers' && <CustomersTab />}
      {tab === 'warehouses' && <WarehousesTab />}
    </div>
  );
}

function VendorsTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', gst: '', address: '', phone: '', station: '' });
  const [show, setShow] = useState(false);

  const load = () => fetch('/api/vendors').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await fetch('/api/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', gst: '', address: '', phone: '', station: '' });
    setShow(false);
    load();
  };

  return (
    <div>
      <button onClick={() => setShow(true)} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>+ Add Vendor</button>
      {show && (
        <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          <input placeholder="GST" value={form.gst} onChange={e => setForm({...form, gst: e.target.value})} style={inputStyle} />
          <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={inputStyle} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
          <input placeholder="Station" value={form.station} onChange={e => setForm({...form, station: e.target.value})} style={inputStyle} />
          <button onClick={save} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, marginTop: 8, cursor: 'pointer' }}>Save</button>
          <button onClick={() => setShow(false)} style={{ background: '#fff', border: '1px solid #e5eaf3', padding: '8px 16px', borderRadius: 8, marginLeft: 8, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12 }}>
        {items.map(v => (
          <div key={v.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 600 }}>{v.name}</div>
            <div style={{ fontSize: 12, color: '#5b6b82' }}>{v.gst} • {v.phone} • {v.station}</div>
          </div>
        ))}
        {items.length === 0 && <p style={{ padding: 16, color: '#5b6b82', fontSize: 13 }}>No vendors yet.</p>}
      </div>
    </div>
  );
}

function CustomersTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [show, setShow] = useState(false);

  const load = () => fetch('/api/customers').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', email: '', phone: '', address: '' });
    setShow(false);
    load();
  };

  return (
    <div>
      <button onClick={() => setShow(true)} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>+ Add Customer</button>
      {show && (
        <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
          <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={inputStyle} />
          <button onClick={save} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, marginTop: 8, cursor: 'pointer' }}>Save</button>
          <button onClick={() => setShow(false)} style={{ background: '#fff', border: '1px solid #e5eaf3', padding: '8px 16px', borderRadius: 8, marginLeft: 8, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12 }}>
        {items.map(c => (
          <div key={c.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: '#5b6b82' }}>{c.email} • {c.phone}</div>
          </div>
        ))}
        {items.length === 0 && <p style={{ padding: 16, color: '#5b6b82', fontSize: 13 }}>No customers yet.</p>}
      </div>
    </div>
  );
}

function WarehousesTab() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', city: '', state: '', pin: '', pocName: '', phone: '' });
  const [show, setShow] = useState(false);

  const load = () => fetch('/api/warehouses').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await fetch('/api/warehouses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', address: '', city: '', state: '', pin: '', pocName: '', phone: '' });
    setShow(false);
    load();
  };

  return (
    <div>
      <button onClick={() => setShow(true)} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>+ Add Warehouse</button>
      {show && (
        <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <input placeholder="Hub Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={inputStyle} />
          <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inputStyle} />
          <input placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={inputStyle} />
          <input placeholder="PIN" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} style={inputStyle} />
          <input placeholder="Contact Name" value={form.pocName} onChange={e => setForm({...form, pocName: e.target.value})} style={inputStyle} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inputStyle} />
          <button onClick={save} style={{ background: '#146bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, marginTop: 8, cursor: 'pointer' }}>Save</button>
          <button onClick={() => setShow(false)} style={{ background: '#fff', border: '1px solid #e5eaf3', padding: '8px 16px', borderRadius: 8, marginLeft: 8, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12 }}>
        {items.map(w => (
          <div key={w.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontWeight: 600 }}>{w.name}</div>
            <div style={{ fontSize: 12, color: '#5b6b82' }}>{w.city}, {w.state} • {w.phone}</div>
          </div>
        ))}
        {items.length === 0 && <p style={{ padding: 16, color: '#5b6b82', fontSize: 13 }}>No warehouses yet.</p>}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', border: '1px solid #e5eaf3', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' };
