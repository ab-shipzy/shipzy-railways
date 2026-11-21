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
      <div className="max-w-xl mx-auto card text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed</h2>
        <p className="text-slate-600 mb-4">Master AWB</p>
        <p className="text-3xl font-mono font-bold text-blue-600 mb-6">{submitted.masterAWB}</p>
        <p className="text-sm text-slate-500 mb-6">Box AWBs: {submitted.boxAWBs.join(', ')}</p>
        <a href={`/api/labels/${submitted.id}`} className="btn-success inline-block" download>
          Download Shipping Labels
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Create New Booking</h1>
      <p className="text-slate-500 text-sm mb-8">Fill the sections below to generate MAWB and labels</p>

      <div className="space-y-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Billing Client</h2>
          <select className="input" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
            <option value="">-- Select customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Route</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Warehouse *</label>
              <input className="input mb-2" placeholder="Type name or city…" value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y text-sm">
                {filteredPickup.map(w => (
                  <div key={w.id} className={`p-2.5 cursor-pointer hover:bg-slate-50 ${form.pickupWarehouseId === w.id ? 'bg-blue-50' : ''}`} onClick={() => setForm({...form, pickupWarehouseId: w.id})}>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-slate-500 text-xs">{w.city} {w.pin}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Warehouse *</label>
              <input className="input mb-2" placeholder="Type name or city…" value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y text-sm">
                {filteredDelivery.map(w => (
                  <div key={w.id} className={`p-2.5 cursor-pointer hover:bg-slate-50 ${form.deliveryWarehouseId === w.id ? 'bg-blue-50' : ''}`} onClick={() => setForm({...form, deliveryWarehouseId: w.id})}>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-slate-500 text-xs">{w.city} {w.pin}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Cargo & Boxes</h2>
          {form.boxes.map((box, i) => (
            <div key={i} className="border rounded-lg p-4 mb-3 bg-slate-50 space-y-3">
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
          <button type="button" onClick={addBoxType} className="text-blue-600 text-sm font-medium">+ Add another box type</button>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Invoice & Insurance</h2>
          <div className="space-y-3">
            <input className="input" placeholder="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
            <input className="input" placeholder="Invoice Amount" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
              Insurance required
            </label>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Product Description & Remarks</h2>
          <textarea className="input h-20 mb-3" value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} placeholder="Product description" />
          <textarea className="input h-16" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} placeholder="Special instructions / remarks" />
        </div>

        <div className="card bg-slate-50">
          <h3 className="font-medium mb-2 text-sm">Summary</h3>
          <div className="text-sm space-y-1 text-slate-600">
            <p>Customer: {customers.find(c => c.id === form.customerId)?.name || '—'}</p>
            <p>Pickup: {warehouses.find(w => w.id === form.pickupWarehouseId)?.name || '—'}</p>
            <p>Delivery: {warehouses.find(w => w.id === form.deliveryWarehouseId)?.name || '—'}</p>
            <p>Total boxes: {form.boxes.reduce((s, b) => s + Number(b.count || 0), 0)}</p>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!form.customerId || !form.pickupWarehouseId || !form.deliveryWarehouseId} className="btn-success w-full py-3 text-lg">
          Submit & Generate MAWB
        </button>
      </div>
    </div>
  );
}
