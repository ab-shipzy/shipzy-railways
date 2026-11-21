'use client';

import { useState, useEffect } from 'react';

const sections = [
  { id: 'customer', title: 'Customer (Billing)', num: 1 },
  { id: 'stations', title: 'Origin & Destination Stations', num: 2 },
  { id: 'vendor', title: 'Vendor (Railway Agent)', num: 3 },
  { id: 'hubs', title: 'Pickup & Drop Hubs', num: 4 },
  { id: 'shipment', title: 'Shipment Details', num: 5 },
  { id: 'invoice', title: 'Invoice', num: 6 },
];

export default function BookingPage() {
  const [open, setOpen] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stations, setStations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    customerId: '', originStationId: '', destinationStationId: '', vendorId: '',
    pickupWarehouseId: '', deliveryWarehouseId: '',
    boxes: [{ count: 1, weight: '', length: '', width: '', height: '' }],
    invoiceNumber: '', invoiceAmount: '', insurance: false, productDescription: '', remarks: '',
  });
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [searchPickup, setSearchPickup] = useState('');
  const [searchDelivery, setSearchDelivery] = useState('');
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
    fetch('/api/stations').then(r => r.json()).then(setStations);
    fetch('/api/vendors').then(r => r.json()).then(setVendors);
  }, []);

  const filterStations = (q) => stations.filter(s =>
    (s.code || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(q.toLowerCase())
  );
  const filterWh = (q) => warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (w.city || '').toLowerCase().includes(q.toLowerCase())
  );

  const addBox = () => setForm({ ...form, boxes: [...form.boxes, { count: 1, weight: '', length: '', width: '', height: '' }] });
  const updateBox = (i, f, v) => {
    const boxes = [...form.boxes];
    boxes[i][f] = v;
    setForm({ ...form, boxes });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/shipments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setSubmitted(await res.json());
  };

  const input = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };
  const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 };

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Booking Confirmed</h2>
        <p style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 700, color: '#0074ff' }}>{submitted.masterAWB}</p>
        <a href={`/api/labels/${submitted.id}`} download style={{ display: 'inline-block', background: '#059669', color: '#fff', padding: '12px 24px', borderRadius: 6, textDecoration: 'none', fontWeight: 600 }}>Download Labels</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>New Booking</h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>Railway shipment booking</p>

      {sections.map(s => (
        <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
          <div onClick={() => setOpen(open === s.id ? null : s.id)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer', background: open === s.id ? '#f8fafc' : '#fff' }}>
            <span style={{ width: 26, height: 26, borderRadius: 13, background: '#e6f1ff', color: '#0074ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, marginRight: 10 }}>{s.num}</span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{s.title}</span>
            <span style={{ color: '#94a3b8', fontSize: 18 }}>{open === s.id ? '▾' : '▸'}</span>
          </div>
          {open === s.id && (
            <div style={{ padding: '0 16px 16px' }}>
              {s.id === 'customer' && (
                <select style={input} value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {s.id === 'stations' && (
                <>
                  <label style={label}>Origin Station</label>
                  <input style={input} placeholder="Type code or name..." value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)} />
                  {searchOrigin && filterStations(searchOrigin).map(st => (
                    <div key={st.id} style={{ padding: 8, cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}
                      onClick={() => { setForm({...form, originStationId: st.id}); setSearchOrigin(`${st.code} — ${st.name}`); }}>
                      <strong>{st.code}</strong> — {st.name}
                    </div>
                  ))}
                  <label style={{ ...label, marginTop: 12 }}>Destination Station</label>
                  <input style={input} placeholder="Type code or name..." value={searchDest} onChange={e => setSearchDest(e.target.value)} />
                  {searchDest && filterStations(searchDest).map(st => (
                    <div key={st.id} style={{ padding: 8, cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}
                      onClick={() => { setForm({...form, destinationStationId: st.id}); setSearchDest(`${st.code} — ${st.name}`); }}>
                      <strong>{st.code}</strong> — {st.name}
                    </div>
                  ))}
                </>
              )}
              {s.id === 'vendor' && (
                <select style={input} value={form.vendorId} onChange={e => setForm({...form, vendorId: e.target.value})}>
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}{v.station ? ` — ${v.station}` : ''}</option>)}
                </select>
              )}
              {s.id === 'hubs' && (
                <>
                  <label style={label}>Pickup Hub (Consignor)</label>
                  <input style={input} placeholder="Search hub..." value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
                  {searchPickup && filterWh(searchPickup).map(w => (
                    <div key={w.id} style={{ padding: 8, cursor: 'pointer', fontSize: 13 }} onClick={() => { setForm({...form, pickupWarehouseId: w.id}); setSearchPickup(w.name); }}>{w.name} — {w.city}</div>
                  ))}
                  <label style={{ ...label, marginTop: 12 }}>Drop Hub</label>
                  <input style={input} placeholder="Search hub..." value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
                  {searchDelivery && filterWh(searchDelivery).map(w => (
                    <div key={w.id} style={{ padding: 8, cursor: 'pointer', fontSize: 13 }} onClick={() => { setForm({...form, deliveryWarehouseId: w.id}); setSearchDelivery(w.name); }}>{w.name} — {w.city}</div>
                  ))}
                </>
              )}
              {s.id === 'shipment' && (
                <>
                  {form.boxes.map((box, i) => (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 10, background: '#f8fafc' }}>
                      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Box Type {i + 1}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input style={input} type="number" placeholder="Count" value={box.count} onChange={e => updateBox(i, 'count', e.target.value)} />
                        <input style={input} placeholder="Weight (kg)" value={box.weight} onChange={e => updateBox(i, 'weight', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <input style={input} placeholder="L" value={box.length} onChange={e => updateBox(i, 'length', e.target.value)} />
                        <input style={input} placeholder="W" value={box.width} onChange={e => updateBox(i, 'width', e.target.value)} />
                        <input style={input} placeholder="H" value={box.height} onChange={e => updateBox(i, 'height', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={addBox} style={{ background: 'none', border: 'none', color: '#0074ff', fontWeight: 600, cursor: 'pointer' }}>+ Add box type</button>
                  <label style={{ ...label, marginTop: 12 }}>Product Description</label>
                  <textarea style={{ ...input, height: 56 }} value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} />
                </>
              )}
              {s.id === 'invoice' && (
                <>
                  <label style={label}>Invoice Number</label>
                  <input style={input} value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
                  <label style={{ ...label, marginTop: 10 }}>Amount (₹)</label>
                  <input style={input} value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}>
                    <input type="checkbox" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} /> Insurance
                  </label>
                  <label style={{ ...label, marginTop: 10 }}>Remarks</label>
                  <textarea style={{ ...input, height: 56 }} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <button onClick={handleSubmit} style={{ width: '100%', background: '#0074ff', color: '#fff', border: 'none', padding: '14px', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
        Confirm Booking & Generate Labels
      </button>
    </div>
  );
}
