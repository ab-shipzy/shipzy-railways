'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('parties');
  const [edit, setEdit] = useState({});
  const [live, setLive] = useState(null);
  const [tracking, setTracking] = useState(false);

  const load = () => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  };
  useEffect(load, []);

  const openDrawer = (s) => { setSelected(s); setEdit({ ...s }); setTab('parties'); setLive(null); };
  const closeDrawer = () => setSelected(null);
  const customerName = (id) => customers.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';

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
    setLive(data);
    setTracking(false);
  };

  const input = 'w-full border border-slate-200 rounded-md px-3 py-2 text-sm';

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Shipments</h1>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500">
              <th className="py-3 px-4">Master AWB</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Train</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} onClick={() => openDrawer(s)} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                <td className="py-3 px-4 font-mono font-medium">{s.masterAWB}</td>
                <td className="py-3 px-4">{customerName(s.customerId)}</td>
                <td className="py-3 px-4 text-xs">{warehouseName(s.pickupWarehouseId)} → {warehouseName(s.deliveryWarehouseId)}</td>
                <td className="py-3 px-4 font-mono text-xs">{s.trainNumber || '—'}</td>
                <td className="py-3 px-4"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">BOOKED</span></td>
                <td className="py-3 px-4 text-slate-500 text-xs">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && <p className="text-slate-500 text-sm py-8 text-center">No shipments yet.</p>}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeDrawer} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg font-mono">{selected.masterAWB}</h2>
                <p className="text-xs text-slate-500">{customerName(selected.customerId)}</p>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>

            <div className="flex border-b text-sm">
              {[{id:'parties',l:'Parties'},{id:'details',l:'Details'},{id:'train',l:'Train'},{id:'invoice',l:'Invoice'}].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 font-medium ${tab===t.id ? 'border-b-2 border-brand text-brand' : 'text-slate-500'}`}>{t.l}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-sm space-y-4">
              {tab === 'parties' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Pickup Hub</label>
                    <select className={input} value={edit.pickupWarehouseId || ''} onChange={e => setEdit({...edit, pickupWarehouseId: e.target.value})}>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Drop Hub</label>
                    <select className={input} value={edit.deliveryWarehouseId || ''} onChange={e => setEdit({...edit, deliveryWarehouseId: e.target.value})}>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              {tab === 'details' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Product Description</label>
                    <textarea className={input} rows={3} value={edit.productDescription || ''} onChange={e => setEdit({...edit, productDescription: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Remarks</label>
                    <textarea className={input} rows={2} value={edit.remarks || ''} onChange={e => setEdit({...edit, remarks: e.target.value})} />
                  </div>
                </>
              )}
              {tab === 'train' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Train Number</label>
                    <input className={input} placeholder="e.g. 12301" value={edit.trainNumber || ''} onChange={e => setEdit({...edit, trainNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Train Date</label>
                    <input type="date" className={input} value={edit.trainDate || ''} onChange={e => setEdit({...edit, trainDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Status</label>
                    <select className={input} value={edit.trainStatus || ''} onChange={e => setEdit({...edit, trainStatus: e.target.value})}>
                      <option value="">—</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="on-time">On Time</option>
                      <option value="delayed">Delayed</option>
                      <option value="reached">Reached</option>
                    </select>
                  </div>
                  <button onClick={track} disabled={tracking} className="w-full bg-slate-800 text-white py-2.5 rounded-md text-sm font-medium">
                    {tracking ? 'Tracking...' : 'Track Train'}
                  </button>
                  {live && !live.error && (
                    <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1">
                      <p className="font-semibold text-slate-700">{live.name || live.number || 'Train'}</p>
                      <p>Status: {live.current_position?.status || live.status || '—'}</p>
                      <p>Delay: {live.current_position?.delay || '—'}</p>
                      <p>Position: {live.current_position?.name || '—'}</p>
                    </div>
                  )}
                  {live && live.error && <p className="text-xs text-red-500">Could not fetch status. Check train number.</p>}
                  <p className="text-xs text-slate-400">Live status via TrainTrack API.</p>
                </>
              )}
              {tab === 'invoice' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Invoice Number</label>
                    <input className={input} value={edit.invoiceNumber || ''} onChange={e => setEdit({...edit, invoiceNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Amount (₹)</label>
                    <input className={input} value={edit.invoiceAmount || ''} onChange={e => setEdit({...edit, invoiceAmount: e.target.value})} />
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!edit.insurance} onChange={e => setEdit({...edit, insurance: e.target.checked})} />
                    Insurance
                  </label>
                </>
              )}
            </div>

            <div className="p-4 border-t flex gap-2">
              <button onClick={save} className="flex-1 bg-brand text-white py-2.5 rounded-lg font-semibold text-sm">Save Changes</button>
              <a href={`/api/labels/${selected.id}`} download className="flex-1 text-center bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm">Labels</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
