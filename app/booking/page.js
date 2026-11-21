'use client';

import { useState, useEffect } from 'react';

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
    w.name.toLowerCase().includes(searchPickup.toLowerCase()) ||
    w.city.toLowerCase().includes(searchPickup.toLowerCase())
  );
  const filteredDelivery = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchDelivery.toLowerCase()) ||
    w.city.toLowerCase().includes(searchDelivery.toLowerCase())
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
    setStep(5);
  };

  if (submitted) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
        <p>Master AWB: <strong>{submitted.masterAWB}</strong></p>
        <p>Box AWBs: {submitted.boxAWBs.join(', ')}</p>
        <a href={`/api/labels/${submitted.id}`} className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded" download>
          Generate & Download Labels
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">New Booking</h2>
      <div className="mb-4">Step {step} of 4</div>

      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-2">Select Customer</h3>
          <select className="border p-2 w-full" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => setStep(2)} disabled={!form.customerId} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-semibold mb-2">Pickup Warehouse</h3>
          <input className="border p-2 w-full mb-2" placeholder="Search warehouse..." value={searchPickup} onChange={e => setSearchPickup(e.target.value)} />
          <div className="max-h-40 overflow-y-auto border">
            {filteredPickup.map(w => (
              <div key={w.id} className={`p-2 cursor-pointer ${form.pickupWarehouseId === w.id ? 'bg-blue-100' : ''}`} onClick={() => setForm({...form, pickupWarehouseId: w.id})}>
                {w.name} - {w.city}
              </div>
            ))}
          </div>
          <button onClick={() => setStep(3)} disabled={!form.pickupWarehouseId} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-semibold mb-2">Delivery Warehouse</h3>
          <input className="border p-2 w-full mb-2" placeholder="Search warehouse..." value={searchDelivery} onChange={e => setSearchDelivery(e.target.value)} />
          <div className="max-h-40 overflow-y-auto border">
            {filteredDelivery.map(w => (
              <div key={w.id} className={`p-2 cursor-pointer ${form.deliveryWarehouseId === w.id ? 'bg-blue-100' : ''}`} onClick={() => setForm({...form, deliveryWarehouseId: w.id})}>
                {w.name} - {w.city}
              </div>
            ))}
          </div>
          <button onClick={() => setStep(4)} disabled={!form.deliveryWarehouseId} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Shipment Details</h3>
          {form.boxes.map((box, i) => (
            <div key={i} className="border p-3 space-y-2">
              <p>Box Type {i+1}</p>
              <input type="number" className="border p-1" placeholder="Count" value={box.count} onChange={e => updateBox(i, 'count', e.target.value)} />
              <input className="border p-1" placeholder="Weight (kg)" value={box.weight} onChange={e => updateBox(i, 'weight', e.target.value)} />
              <div className="flex gap-2">
                <input className="border p-1 w-20" placeholder="L cm" value={box.length} onChange={e => updateBox(i, 'length', e.target.value)} />
                <input className="border p-1 w-20" placeholder="W cm" value={box.width} onChange={e => updateBox(i, 'width', e.target.value)} />
                <input className="border p-1 w-20" placeholder="H cm" value={box.height} onChange={e => updateBox(i, 'height', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addBoxType} className="text-blue-600">+ Add another type of box</button>

          <div>
            <h3 className="font-semibold mt-4">Invoice Details</h3>
            <input className="border p-2 w-full" placeholder="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
            <input className="border p-2 w-full mt-2" placeholder="Invoice Amount" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
            <label className="flex items-center mt-2">
              <input type="checkbox" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
              <span className="ml-2">Insurance (Yes/No)</span>
            </label>
          </div>

          <div>
            <h3 className="font-semibold">Product Description</h3>
            <textarea className="border p-2 w-full" value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} />
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Confirmation</h3>
            <p>Customer: {customers.find(c => c.id === form.customerId)?.name}</p>
            <p>Pickup: {warehouses.find(w => w.id === form.pickupWarehouseId)?.name}</p>
            <p>Delivery: {warehouses.find(w => w.id === form.deliveryWarehouseId)?.name}</p>
            <p>Total boxes: {form.boxes.reduce((s, b) => s + Number(b.count || 0), 0)}</p>
          </div>

          <button onClick={handleSubmit} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Submit Booking & Generate MAWB</button>
        </div>
      )}
    </div>
  );
}
