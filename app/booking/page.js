'use client';

import { useState, useEffect } from 'react';

const steps = [
  { id: 'customer', title: 'Customer (Billing)', num: 1 },
  { id: 'vendor', title: 'Vendor (Railway Agent)', num: 2 },
  { id: 'hubs', title: 'Pickup & Drop Hubs', num: 3 },
  { id: 'shipment', title: 'Shipment Details', num: 4 },
  { id: 'invoice', title: 'Invoice', num: 5 },
];

export default function BookingPage() {
  const [open, setOpen] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    customerId: '', vendorId: '',
    pickupWarehouseId: '', deliveryWarehouseId: '',
    boxes: [{ count: 1, weight: '', length: '', width: '', height: '' }],
    invoiceNumber: '', invoiceAmount: '', insurance: false,
    productDescription: '', remarks: '',
  });
  const [searchPickup, setSearchPickup] = useState('');
  const [searchDelivery, setSearchDelivery] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [newVendor, setNewVendor] = useState({ name: '', gst: '', phone: '', station: '' });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', consigneeName: '', companyName: '', address: '', city: '', pin: '', phone: '' });

  const load = () => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
    fetch('/api/vendors').then(r => r.json()).then(setVendors);
  };
  useEffect(() => { load(); }, []);

  const addCustomer = async () => {
    const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCustomer) });
    const c = await res.json();
    setCustomers([...customers, c]);
    setForm({...form, customerId: c.id});
    setShowAddCustomer(false);
    setNewCustomer({ name: '', email: '', phone: '' });
  };

  const addVendor = async () => {
    const res = await fetch('/api/vendors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVendor) });
    const v = await res.json();
    setVendors([...vendors, v]);
    setForm({...form, vendorId: v.id});
    setShowAddVendor(false);
    setNewVendor({ name: '', gst: '', phone: '', station: '' });
  };

  const addWarehouse = async () => {
    const res = await fetch('/api/warehouses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newWarehouse) });
    const w = await res.json();
    setWarehouses([...warehouses, w]);
    setShowAddWarehouse(false);
    setNewWarehouse({ name: '', consigneeName: '', companyName: '', address: '', city: '', pin: '', phone: '' });
  };

  const filterWh = (q) => warehouses.filter(w =>
    w.name?.toLowerCase().includes(q.toLowerCase()) || w.city?.toLowerCase().includes(q.toLowerCase())
  );

  const addBox = () => setForm({...form, boxes: [...form.boxes, { count: 1, weight: '', length: '', width: '', height: '' }]});
  const updateBox = (i, field, val) => {
    const boxes = [...form.boxes];
    boxes[i][field] = val;
    setForm({...form, boxes});
  };

  const handleSubmit = async () => {
    const res = await fetch('/api/shipments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setSubmitted(await res.json());
  };

  const input = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };
  const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 };
  const addBtn = { marginTop: 8, background: 'none', border: 'none', color: '#0074ff', fontSize: 13, cursor: 'pointer' };
  const saveBtn = { background: '#0074ff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer' };
  const addForm = { marginTop: 8, padding: 12, background: '#f8fafc', borderRadius: 8 };

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
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>New Booking</h1>
      {steps.map(s => (
        <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 12 }}>
          <div onClick={() => setOpen(open === s.id ? '' : s.id)} style={{ padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: open === s.id ? '#0074ff' : '#e5e7eb', color: open === s.id ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{s.num}</span>
            <span style={{ fontWeight: 600 }}>{s.title}</span>
          </div>
          {open === s.id && (
            <div style={{ padding: '0 16px 16px' }}>
              {s.id === 'customer' && (
                <div>
                  <select style={input} value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setShowAddCustomer(!showAddCustomer)} style={addBtn}>+ Add New Customer</button>
                  {showAddCustomer && (
                    <div style={addForm}>
                      <input placeholder="Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} style={{...input, marginBottom: 6}} />
                      <button onClick={addCustomer} style={saveBtn}>Save Customer</button>
                    </div>
                  )}
                </div>
              )}
              {s.id === 'vendor' && (
                <div>
                  <select style={input} value={form.vendorId} onChange={e => setForm({...form, vendorId: e.target.value})}>
                    <option value="">Select vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}{v.station ? ` — ${v.station}` : ''}</option>)}
                  </select>
                  <button onClick={() => setShowAddVendor(!showAddVendor)} style={addBtn}>+ Add New Vendor</button>
                  {showAddVendor && (
                    <div style={addForm}>
                      <input placeholder="Name" value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="GST" value={newVendor.gst} onChange={e => setNewVendor({...newVendor, gst: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Phone" value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Station" value={newVendor.station} onChange={e => setNewVendor({...newVendor, station: e.target.value})} style={{...input, marginBottom: 6}} />
                      <button onClick={addVendor} style={saveBtn}>Save Vendor</button>
                    </div>
                  )}
                </div>
              )}
              {s.id === 'hubs' && (
                <div>
                  <button onClick={() => setShowAddWarehouse(!showAddWarehouse)} style={{...addBtn, marginBottom: 8}}>+ Add New Hub/Warehouse</button>
                  {showAddWarehouse && (
                    <div style={{...addForm, marginBottom: 12}}>
                      <input placeholder="Hub Name" value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Consignee Name" value={newWarehouse.consigneeName} onChange={e => setNewWarehouse({...newWarehouse, consigneeName: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Company Name" value={newWarehouse.companyName} onChange={e => setNewWarehouse({...newWarehouse, companyName: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Address" value={newWarehouse.address} onChange={e => setNewWarehouse({...newWarehouse, address: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="City" value={newWarehouse.city} onChange={e => setNewWarehouse({...newWarehouse, city: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="PIN" value={newWarehouse.pin} onChange={e => setNewWarehouse({...newWarehouse, pin: e.target.value})} style={{...input, marginBottom: 6}} />
                      <input placeholder="Phone" value={newWarehouse.phone} onChange={e => setNewWarehouse({...newWarehouse, phone: e.target.value})} style={{...input, marginBottom: 6}} />
                      <button onClick={addWarehouse} style={saveBtn}>Save Hub</button>
                    </div>
                  )}
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
                </div>
              )}
              {s.id === 'shipment' && (
                <>
                  {form.boxes.map((box, i) => (
                    <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 10, background: '#f8fafc' }}>
                      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>Box Type {i + 1}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input style={input} type="number" placeholder="Count" value={box.count} onChange={e => updateBox(i, 'count', e.target.value)} />
                        <input style={input} type="number" placeholder="Weight (kg)" value={box.weight} onChange={e => updateBox(i, 'weight', e.target.value)} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <input style={input} type="number" placeholder="L (cm)" value={box.length} onChange={e => updateBox(i, 'length', e.target.value)} />
                        <input style={input} type="number" placeholder="W (cm)" value={box.width} onChange={e => updateBox(i, 'width', e.target.value)} />
                        <input style={input} type="number" placeholder="H (cm)" value={box.height} onChange={e => updateBox(i, 'height', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={addBox} style={addBtn}>+ Add box type</button>
                  <label style={{ ...label, marginTop: 12 }}>Product Description</label>
                  <input style={input} value={form.productDescription} onChange={e => setForm({...form, productDescription: e.target.value})} />
                </>
              )}
              {s.id === 'invoice' && (
                <>
                  <label style={label}>Invoice Number</label>
                  <input style={input} value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} />
                  <label style={{ ...label, marginTop: 12 }}>Invoice Amount</label>
                  <input style={input} type="number" value={form.invoiceAmount} onChange={e => setForm({...form, invoiceAmount: e.target.value})} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14 }}>
                    <input type="checkbox" checked={form.insurance} onChange={e => setForm({...form, insurance: e.target.checked})} />
                    Insurance
                  </label>
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
