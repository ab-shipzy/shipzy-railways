'use client';

import { useState, useEffect } from 'react';

export default function BookingPage() {
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    customerId: '',
    pickupWarehouseId: '',
    deliveryWarehouseId: '',
    boxes: [{ count: 1, weight: '', length: '', width: '', height: '' }],
    invoiceNumber: '',
    invoiceAmount: '',
    insurance: false,
    productDescription: '',
    remarks: '',
  });
  const [searchPickup, setSearchPickup] = useState('');
  const [searchDelivery, setSearchDelivery] = useState('');
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  }, []);

  const filteredPickup = warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(searchPickup.toLowerCase()) ||
    (w.city || '').toLowerCase().includes(searchPickup.toLowerCase())
  );
  const filteredDelivery = warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(searchDelivery.toLowerCase()) ||
    (w.city || '').toLowerCase().includes(searchDelivery.toLowerCase())
  );

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
        <p className="text-sm text-slate-500 mt-1">Create a railway shipment and generate labels</p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">1</span>
          Shipper & Receiver
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Customer (Billing)</label>
            <select className="input" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} required>
              <option value="">Select customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Pickup Warehouse (Consignor)</label>
            <input className="input" placeholder="Search warehouse..." value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
            {searchPickup && filteredPickup.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredPickup.map(w => (
                  <div key={w.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, pickupWarehouseId: w.id}); setSearchPickup(w.name); }}>
                    {w.name} — {w.city}
                  </div>
                ))}
              </div>
            )}
            {form.pickupWarehouseId && <p className="text-xs text-emerald-600 mt-1">Selected: {warehouses.find(w => w.id === form.pickupWarehouseId)?.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Delivery Warehouse</label>
            <input className="input" placeholder="Search warehouse..." value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
            {searchDelivery && filteredDelivery.length > 0 && (
              <div className="mt-1 border rounded-md bg-white max-h-40 overflow-auto text-sm">
                {filteredDelivery.map(w => (
                  <div key={w.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer" onClick={() => { setForm({...form, deliveryWarehouseId: w.id}); setSearchDelivery(w.name); }}>
                    {w.name} — {w.city}
                  </div>
                ))}
              </div>
            )}
            {form.deliveryWarehouseId && <p className="text-xs text-emerald-600 mt-1">Selected: {warehouses.find(w => w.id === form.deliveryWarehouseId)?.name}</p>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">2</span>
          Shipment Details
        </h2>
        {form.boxes.map((box, i) => (
          <div key={i} className="border border-[#e5e7eb] rounded-lg p-4 mb-3 bg-slate-50 space-y-3">
            <p className="text-sm font-medium">Box Type {i + 1}</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" className="input" placeholder="Count" value={box.count} onChange={e => updateBox(i, 'count', e.target.value)} />
              <input className="input" placeholder="Weight (kg)" value={box.weight} onChange={e => updateBox(i, 'weight', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input className="input" placeholder="L (cm)" value={box.length} onChange={e => updateBox(i, 'length', e.target.value)} />
              <input className="input" placeholder="W (cm)" value={box.width} onChange={e => updateBox(i, 'width', e.target.value)} />
              <input className="input" placeholder="H (cm)" value={box.height} onChange={e => updateBox(i, 'height', e.target.value)} />
            </div>
          </div>
        ))}
        <button type="button" onClick={addBoxType} className="text-[#0074ff] text-sm font-medium">+ Add another box type</button>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-500 mb-1 block">Product Description</label>
          <textarea className="input h-16" value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} placeholder="What is being shipped" />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#e6f1ff] text-[#0074ff] text-xs font-bold flex items-center justify-center">3</span>
          Invoice & E-way
        </h2>
        <div className="space-y-3">
          <input className="input" placeholder="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
          <input className="input" placeholder="Invoice Amount (₹)" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
            Insurance required
          </label>
          <textarea className="input h-16" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Remarks / special instructions" />
        </div>
      </div>

      <button onClick={handleSubmit} className="btn-primary w-full py-3 text-base">Confirm Booking & Generate Labels</button>
    </div>
  );
}
