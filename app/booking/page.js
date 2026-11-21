'use client';

import { useState, useEffect } from 'react';

const steps = ['Customer', 'Pickup', 'Delivery', 'Details'];

export default function BookingPage() {
  const [step, setStep] = useState(1);
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">New Booking</h2>

      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm hidden sm:block ${step === i + 1 ? 'font-medium text-blue-600' : 'text-slate-500'}`}>{label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Customer</h3>
            <select className="input" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
              <option value="">-- Choose customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => setStep(2)} disabled={!form.customerId} className="btn-primary">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pickup Warehouse</h3>
            <input className="input" placeholder="Search by name or city..." value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {filteredPickup.length === 0 && <div className="p-3 text-slate-500 text-sm">No matching warehouses</div>}
              {filteredPickup.map(w => (
                <div key={w.id} className={`p-3 cursor-pointer hover:bg-slate-50 ${form.pickupWarehouseId === w.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`} onClick={() => setForm({...form, pickupWarehouseId: w.id})}>
                  <div className="font-medium">{w.name}</div>
                  <div className="text-sm text-slate-500">{w.city} {w.pin}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-lg">Back</button>
              <button onClick={() => setStep(3)} disabled={!form.pickupWarehouseId} className="btn-primary">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Delivery Warehouse</h3>
            <input className="input" placeholder="Search by name or city..." value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {filteredDelivery.length === 0 && <div className="p-3 text-slate-500 text-sm">No matching warehouses</div>}
              {filteredDelivery.map(w => (
                <div key={w.id} className={`p-3 cursor-pointer hover:bg-slate-50 ${form.deliveryWarehouseId === w.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`} onClick={() => setForm({...form, deliveryWarehouseId: w.id})}>
                  <div className="font-medium">{w.name}</div>
                  <div className="text-sm text-slate-500">{w.city} {w.pin}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2 border rounded-lg">Back</button>
              <button onClick={() => setStep(4)} disabled={!form.deliveryWarehouseId} className="btn-primary">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Shipment Details</h3>
            {form.boxes.map((box, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 bg-slate-50">
                <p className="font-medium text-sm">Box Type {i + 1}</p>
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

            <div className="space-y-3">
              <h4 className="font-medium">Invoice</h4>
              <input className="input" placeholder="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
              <input className="input" placeholder="Invoice Amount" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
                Insurance required
              </label>
            </div>

            <div>
              <h4 className="font-medium mb-2">Product Description</h4>
              <textarea className="input h-20" value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} placeholder="Describe the goods" />
            </div>

            <div className="bg-slate-100 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Customer:</strong> {customers.find(c => c.id === form.customerId)?.name || '—'}</p>
              <p><strong>Pickup:</strong> {warehouses.find(w => w.id === form.pickupWarehouseId)?.name || '—'}</p>
              <p><strong>Delivery:</strong> {warehouses.find(w => w.id === form.deliveryWarehouseId)?.name || '—'}</p>
              <p><strong>Total boxes:</strong> {form.boxes.reduce((s, b) => s + Number(b.count || 0), 0)}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-4 py-2 border rounded-lg">Back</button>
              <button onClick={handleSubmit} className="btn-success flex-1">Submit & Generate MAWB</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
