'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stations, setStations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [bulkTrain, setBulkTrain] = useState('');
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
    fetch('/api/vendors').then(r => r.json()).then(setVendors);
  };
  useEffect(load, []);

  useEffect(() => {
    if (edit.trainNumber && edit.trainNumber.length >= 4 && edit.trainDate && selected) {
      const timer = setTimeout(() => track(), 500);
      return () => clearTimeout(timer);
    }
  }, [edit.trainNumber, edit.trainDate]);

  const openDrawer = (s) => { setSelected(s); setEdit({ ...s }); setTab('parties'); setLive(null); };
  const closeDrawer = () => setSelected(null);
  const customerName = (id) => customers.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';
  const stationCode = (id) => stations.find(s => s.id === id)?.code || '—';
  const vendorName = (id) => vendors.find(v => v.id === id)?.name || '—';
  const boxCount = (s) => (s.boxAWBs || []).length || 1;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(s => s.id));
  };
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} shipments?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
    }
    setSelectedIds([]);
    load();
  };
  const bulkStatus = async (status) => {
    for (const id of selectedIds) {
      await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainStatus: status }),
      });
    }
    setSelectedIds([]);
    load();
  };
  const bulkAddTrain = async () => {
    if (!bulkTrain) return;
    for (const id of selectedIds) {
      await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainNumber: bulkTrain }),
      });
    }
    setBulkTrain('');
    setSelectedIds([]);
    load();
  };

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
    if (!edit.trainNumber) return;
    setTracking(true);
    const res = await fetch(`/api/trains/${edit.trainNumber}?date=${edit.trainDate || ''}`);
    const data = await res.json();
    const liveData = data.data || data;
    setLive(liveData);
    setTracking(false);
    // Auto-save
    if (liveData && !liveData.error) {
      const updated = {
        ...edit,
        trainName: liveData.train_name || liveData.trainName,
        originCode: liveData.originCode || liveData.stations?.[0]?.station_code,
        destCode: liveData.destCode || liveData.stations?.[liveData.stations?.length - 1]?.station_code,
        originDeparture: liveData.originDeparture || liveData.stations?.[0]?.scheduled_departure,
        destEta: liveData.destEta || liveData.eta_destination_at,
        trainStatus: liveData.status || (liveData.delay_minutes > 10 ? 'delayed' : 'on-time'),
      };
      setEdit(updated);
      await fetch(`/api/shipments/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      // Force refresh
      const res = await fetch('/api/shipments');
      const data = await res.json();
      setShipments(data);
    }
  };

  const filtered = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.masterAWB?.toLowerCase().includes(q) || customerName(s.customerId).toLowerCase().includes(q) || s.trainNumber?.includes(q) || vendorName(s.vendorId).toLowerCase().includes(q);
    const matchStatus = !statusFilter || (s.trainStatus || 'booked') === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0a1b3d', margin: 0 }}>Shipments</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Spotlight search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240, border: '1px solid #e5eaf3', borderRadius: 20, padding: '8px 14px', fontSize: 13 }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: '1px solid #e5eaf3', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
            <option value="">All Status</option>
            <option value="booked">Booked</option>
            <option value="on-time">On Time</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 16px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
          <select onChange={e => e.target.value && bulkStatus(e.target.value)} style={{ border: '1px solid #e5eaf3', borderRadius: 6, padding: '6px 10px', fontSize: 12 }}>
            <option value="">Set Status</option>
            <option value="booked">Booked</option>
            <option value="on-time">On Time</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
          </select>
          <input placeholder="Train number" value={bulkTrain} onChange={e => setBulkTrain(e.target.value)} style={{ width: 120, border: '1px solid #e5eaf3', borderRadius: 6, padding: '6px 10px', fontSize: 12 }} />
          <button onClick={bulkAddTrain} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Add Train</button>
          <button onClick={bulkDelete} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Delete</button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5eaf3', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5eaf3' }}>
              <th style={th}><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th style={th}>Date</th>
              <th style={th}>Master AWB</th>
              <th style={th}>Customer</th>
              <th style={th}>Vendor</th>
              <th style={th}>Route</th>
              <th style={th}>Train</th>
              <th style={th}>Boxes</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: selectedIds.includes(s.id) ? '#f0f9ff' : '#fff' }}>
                <td style={td}><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} onClick={e => e.stopPropagation()} /></td>
                <td style={td} onClick={() => openDrawer(s)}>{formatDate(s.createdAt)}</td>
                <td style={td} onClick={() => openDrawer(s)}><span style={{ fontWeight: 600, color: '#0a1b3d', cursor: 'pointer' }}>{s.masterAWB}</span></td>
                <td style={td} onClick={() => openDrawer(s)}>{customerName(s.customerId)}</td>
                <td style={td} onClick={() => openDrawer(s)}>{vendorName(s.vendorId)}</td>
                <td style={td} onClick={() => openDrawer(s)}>{s.originCode || stationCode(s.originStationId)} → {s.destCode || stationCode(s.destinationStationId)}</td>
                <td style={td} onClick={() => openDrawer(s)}>{s.trainNumber ? `${s.trainNumber} ${s.trainName || ''}` : '—'}</td>
                <td style={td} onClick={() => openDrawer(s)}>{boxCount(s)}</td>
                <td style={td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                    background: s.trainStatus === 'delayed' ? '#fef3c7' : s.trainStatus === 'on-time' ? '#d1fae5' : s.trainStatus === 'delivered' ? '#dbeafe' : '#f1f5f9',
                    color: s.trainStatus === 'delayed' ? '#92400e' : s.trainStatus === 'on-time' ? '#065f46' : s.trainStatus === 'delivered' ? '#1e40af' : '#64748b',
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
              {['parties', 'details', 'train', 'invoice', 'cost', 'revenue'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
                  fontWeight: tab === t ? 600 : 500, color: tab === t ? '#146bff' : '#5b6b82',
                  borderBottom: tab === t ? '2px solid #146bff' : '2px solid transparent',
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            {tab === 'parties' && (
              <div>
                <label style={labelStyle}>Pickup Warehouse</label>
                <select value={edit.pickupWarehouseId || ''} onChange={e => setEdit({...edit, pickupWarehouseId: e.target.value})} style={inputStyle}>
                  <option value="">Select</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <label style={labelStyle}>Delivery Warehouse</label>
                <select value={edit.deliveryWarehouseId || ''} onChange={e => setEdit({...edit, deliveryWarehouseId: e.target.value})} style={inputStyle}>
                  <option value="">Select</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            )}

            {tab === 'details' && (
              <div>
                <label style={labelStyle}>Product Description</label>
                <input value={edit.productDescription || ''} onChange={e => setEdit({...edit, productDescription: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Remarks</label>
                <input value={edit.remarks || ''} onChange={e => setEdit({...edit, remarks: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Box Count</label>
                <div style={{ fontSize: 13, color: '#5b6b82' }}>{(edit.boxes || []).reduce((s, b) => s + Number(b.count || 1), 0) || '—'}</div>
              </div>
            )}

            {tab === 'invoice' && (
              <div>
                <label style={labelStyle}>Invoice Number</label>
                <input value={edit.invoiceNumber || ''} onChange={e => setEdit({...edit, invoiceNumber: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Invoice Amount</label>
                <input value={edit.invoiceAmount || ''} onChange={e => setEdit({...edit, invoiceAmount: e.target.value})} style={inputStyle} />
                <label style={labelStyle}>Insurance</label>
                <select value={edit.insurance ? 'yes' : 'no'} onChange={e => setEdit({...edit, insurance: e.target.value === 'yes'})} style={inputStyle}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            )}

            {tab === 'cost' && (
              <div>
                <label style={labelStyle}>Freight</label>
                <input type="number" value={edit.costs?.freight || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, freight: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Origin Pickup</label>
                <input type="number" value={edit.costs?.originPickup || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, originPickup: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Origin Station Parking</label>
                <input type="number" value={edit.costs?.originParking || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, originParking: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Destination Station Parking</label>
                <input type="number" value={edit.costs?.destParking || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, destParking: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Last Mile Delivery</label>
                <input type="number" value={edit.costs?.lastMile || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, lastMile: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Delivery Labour</label>
                <input type="number" value={edit.costs?.labour || ''} onChange={e => setEdit({...edit, costs: {...edit.costs, labour: e.target.value}})} style={inputStyle} />
                {(edit.costs?.extra || []).map((ex, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    <input placeholder="Name" value={ex.name} onChange={e => { const extra = [...edit.costs.extra]; extra[i].name = e.target.value; setEdit({...edit, costs: {...edit.costs, extra}}); }} style={{...inputStyle, flex: 1}} />
                    <input type="number" placeholder="Amount" value={ex.amount} onChange={e => { const extra = [...edit.costs.extra]; extra[i].amount = e.target.value; setEdit({...edit, costs: {...edit.costs, extra}}); }} style={{...inputStyle, width: 80}} />
                  </div>
                ))}
                <button onClick={() => setEdit({...edit, costs: {...edit.costs, extra: [...(edit.costs?.extra || []), {name: '', amount: ''}]}})} style={{ marginTop: 8, background: '#fff', border: '1px solid #e5eaf3', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Cost</button>
              </div>
            )}

            {tab === 'revenue' && (
              <div>
                <label style={labelStyle}>Freight Revenue</label>
                <input type="number" value={edit.revenues?.freight || ''} onChange={e => setEdit({...edit, revenues: {...edit.revenues, freight: e.target.value}})} style={inputStyle} />
                <label style={labelStyle}>Other Revenue</label>
                <input type="number" value={edit.revenues?.other || ''} onChange={e => setEdit({...edit, revenues: {...edit.revenues, other: e.target.value}})} style={inputStyle} />
                {(edit.revenues?.extra || []).map((ex, i) => (
                  <div key={i} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    <input placeholder="Name" value={ex.name} onChange={e => { const extra = [...edit.revenues.extra]; extra[i].name = e.target.value; setEdit({...edit, revenues: {...edit.revenues, extra}}); }} style={{...inputStyle, flex: 1}} />
                    <input type="number" placeholder="Amount" value={ex.amount} onChange={e => { const extra = [...edit.revenues.extra]; extra[i].amount = e.target.value; setEdit({...edit, revenues: {...edit.revenues, extra}}); }} style={{...inputStyle, width: 80}} />
                  </div>
                ))}
                <button onClick={() => setEdit({...edit, revenues: {...edit.revenues, extra: [...(edit.revenues?.extra || []), {name: '', amount: ''}]}})} style={{ marginTop: 8, background: '#fff', border: '1px solid #e5eaf3', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>+ Add Revenue</button>
              </div>
            )}

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
