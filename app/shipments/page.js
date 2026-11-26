'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('parties');
  const [edit, setEdit] = useState({});
  const [live, setLive] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
    fetch('/api/stations').then(r => r.json()).then(setStations);
  };
  useEffect(load, []);

  const openDrawer = (s) => { setSelected(s); setEdit({ ...s }); setTab('parties'); setLive(null); };
  const closeDrawer = () => setSelected(null);
  const customerName = (id) => customers.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';
  const stationCode = (id) => stations.find(s => s.id === id)?.code || '—';

  const save = async () => {
    await fetch(`/api/shipments/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    });
    load();
    alert('Saved');
  };

  const track = async () => {
    if (!edit.trainNumber) return alert('Enter train number first');
    setTracking(true);
    const res = await fetch(`/api/trains/${edit.trainNumber}?date=${edit.trainDate || ''}`);
    const data = await res.json();
    setLive(data.data || data);
    setTracking(false);
  };

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    return !q || s.masterAWB?.toLowerCase().includes(q) || customerName(s.customerId).toLowerCase().includes(q) || s.trainNumber?.includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a1b3d', margin: 0 }}>Shipments</h1>
        <input
          type="search"
          placeholder="Search AWB, customer, train..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280, border: '1px solid #e5eaf3', borderRadius: 20, padding: '8px 14px', fontSize: 13 }}
        />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5eaf3' }}>
              <th style={th}>AWB</th>
              <th style={th}>Bill To</th>
              <th style={th}>Route</th>
              <th style={th}>Train</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} onClick={() => openDrawer(s)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                <td style={td}><span style={{ fontWeight: 600, color: '#0a1b3d' }}>{s.masterAWB}</span></td>
                <td style={td}>{customerName(s.customerId)}</td>
                <td style={td}>{stationCode(s.originStationId)} → {stationCode(s.destinationStationId)}</td>
                <td style={td}>{s.trainNumber ? `${s.trainNumber} ${s.trainName || ''}` : '—'}</td>
                <td style={td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                    background: s.trainStatus === 'delayed' ? '#fef3c7' : s.trainStatus === 'on-time' ? '#d1fae5' : '#f1f5f9',
                    color: s.trainStatus === 'delayed' ? '#92400e' : s.trainStatus === 'on-time' ? '#065f46' : '#64748b',
                  }}>{s.trainStatus || 'booked'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: 20, color: '#5b6b82', textAlign: 'center' }}>No shipments found.</p>}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50 }} onClick={closeDrawer}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 400, background: '#fff', padding: 20, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selected.masterAWB}</div>
                <div style={{ fontSize: 13, color: '#5b6b82' }}>{customerName(selected.customerId)}</div>
              </div>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5eaf3' }}>
              {['parties', 'details', 'train', 'invoice'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
                  fontWeight: tab === t ? 600 : 500, color: tab === t ? '#146bff' : '#5b6b82',
                  borderBottom: tab === t ? '2px solid #146bff' : '2px solid transparent',
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            {tab === 'train' && (
              <div>
                <label style={labelStyle}>Train Number</label>
                <input value={edit.trainNumber || ''} onChange={e => setEdit({...edit, trainNumber: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Train Date</label>
                <input type="date" value={edit.trainDate || ''} onChange={e => setEdit({...edit, trainDate: e.target.value})} style={inputStyle} />
                <button onClick={track} disabled={tracking} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, marginTop: 8, cursor: 'pointer' }}>
                  {tracking ? 'Tracking...' : 'Track Train'}
                </button>
                {live && !live.error && (
                  <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12 }}>
                    <div style={{ fontWeight: 600 }}>{live.train_name || live.trainName}</div>
                    <div>Status: {live.status_text || live.status || '—'}</div>
                    <div>Delay: {live.delay_minutes != null ? live.delay_minutes + ' min' : '—'}</div>
                    <div>Position: {live.current_station_name || '—'}</div>
                  </div>
                )}
                {live?.error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{live.message}</p>}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={save} style={{ flex: 1, background: '#146bff', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save</button>
              <a href={`/api/labels/${selected.id}`} style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 600 }}>Labels</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#5b6b82', textTransform: 'uppercase' };
const td = { padding: '12px', color: '#0a1b3d' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#5b6b82', marginBottom: 4, marginTop: 12 };
const inputStyle = { width: '100%', border: '1px solid #e5eaf3', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' };
