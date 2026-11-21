'use client';

import { useState, useEffect } from 'react';

export default function BookingPage() {
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    originStationId: '',
    destinationStationId: '',
    pickupWarehouseId: '',
    deliveryWarehouseId: '',
    boxes: [{ count: 1, weight: '', length: '', width: '', height: '' }],
    invoiceNumber: '',
    invoiceAmount: '',
    insurance: false,
    productDescription: '',
    remarks: '',
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
  }, []);

  const filterStations = (q) => stations.filter(s =>
    (s.code || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(q.toLowerCase())
  );
  const filteredOrigin = filterStations(searchOrigin);
  const filteredDest = filterStations(searchDest);

  const filterWh = (q) => warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (w.city || '').toLowerCase().includes(q.toLowerCase())
  );
  const filteredPickup = filterWh(searchPickup);
  const filteredDelivery = filterWh(searchDelivery);

  const addBoxType = () => {
    setForm({ ...form, boxes: [...form.boxes, { count: 1, weight: '', length: '', width: '', height: '' }] });
  };

  const updateBox = (index, field, value) => {
    const newBoxes = [...form.boxes];
    newBoxes[index][field] = value;
    setForm({ ...form, boxes: newBoxes });
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const shipment = await res.json();
    setSubmitted(shipment);
  };

  const origin = stations.find(s => s.id === form.originStationId);
  const dest = stations.find(s => s.id === form.destinationStationId);

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto card p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed</h2>
        <p className="text-slate-600 mb-4">Master AWB</p>
        <p className="text-3xl font-mono font-bold text-[#0074ff] mb-6">{submitted.masterAWB}</p>
        <p className="text-sm text-slate-500 mb-6">Child AWBs: {submitted.boxAWBs?.join(', ')}</p>
        <a href={`/api/labels/${submitted.id}`} className="btn-success inline-block" download>
          Download Shipping Labels
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">New Booking</h1>
        <p className="text-sm text-slate-500 mt-1">Railway shipment booking</p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">1</span>
          Customer (Billing)
        </h2>
        <select className="input" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
          <option value="">Select customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">2</span>
          Origin & Destination Stations
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Origin Station</label>
            <input className="input" placeholder="Type code or name..." value={searchOrigin} onChange={e => setSearchOrigin(e.target.value)} />
            {searchOrigin && filteredOrigin.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredOrigin.map(s => (
                  <div key={s.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, originStationId: s.id}); setSearchOrigin(`${s.code} — ${s.name}`); }}>
                    <span className="font-mono font-medium">{s.code}</span> — {s.name} {s.city && `(${s.city})`}
                  </div>
                ))}
              </div>
            )}
            {origin && <p className="text-xs text-emerald-600 mt-1">Selected: {origin.code} — {origin.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Destination Station</label>
            <input className="input" placeholder="Type code or name..." value={searchDest} onChange={e => setSearchDest(e.target.value)} />
            {searchDest && filteredDest.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredDest.map(s => (
                  <div key={s.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, destinationStationId: s.id}); setSearchDest(`${s.code} — ${s.name}`); }}>
                    <span className="font-mono font-medium">{s.code}</span> — {s.name} {s.city && `(${s.city})`}
                  </div>
                ))}
              </div>
            )}
            {dest && <p className="text-xs text-emerald-600 mt-1">Selected: {dest.code} — {dest.name}</p>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">3</span>
          Pickup & Drop Hubs
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Pickup Hub (Consignor)</label>
            <input className="input" placeholder="Search hub..." value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
            {searchPickup && filteredPickup.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredPickup.map(w => (
                  <div key={w.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, pickupWarehouseId: w.id}); setSearchPickup(w.name); }}>
                    {w.name} — {w.city}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Drop Hub</label>
            <input className="input" placeholder="Search hub..." value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
            {searchDelivery && filteredDelivery.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredDelivery.map(w => (
                  <div key={w.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, deliveryWarehouseId: w.id}); setSearchDelivery(w.name); }}>
                    {w.name} — {w.city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">4</span>
          Shipment Details
        </h2>
        {form.boxes.map((box, i) => (
          <div key={i} className="border border-[#e5e7eb] rounded-lg p-4 mb-3 bg-slate-50 space-y-3">
            <p className="text-sm font-medium">Box Type {i + 1}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="number" className="input" placeholder="Count" value={box.count} onChange={e => updateBox(i, 'count', e.target.value)} />
              <input className="input" placeholder="Weight (kg)" value={box.weight} onChange={e => updateBox(i, 'weight', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className="input" placeholder="L (cm)" value={box.length} onChange={e => updateBox(i, 'length', e.target.value)} />
              <input className="input" placeholder="W (cm)" value={box.width} onChange={e => updateBox(i, 'width', e.target.value)} />
              <input className="input" placeholder="H (cm)" value={box.height} onChange={e => updateBox(i, 'height', e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" onClick={addBoxType} className="text-[#0074ff] text-sm font-medium">+ Add another box type</button>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-500 mb-1 block">Product Description</label>
          <textarea className="input h-16" value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">5</span>
          Invoice
        </h2>
        <div className="space-y-3">
          <input className="input" placeholder="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
          <input className="input" placeholder="Invoice Amount (₹)" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
            Insurance required
          </label>
          <textarea className="input h-16" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Remarks" />
        </div>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full py-3 text-base">Confirm Booking & Generate Labels</button>
    </div>
  );
}
