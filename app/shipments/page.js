'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  }, []);

  const openDrawer = (s) => setSelected(s);
  const closeDrawer = () => setSelected(null);

  const customerName = (id) => customers.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Shipments</h1>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-3">Master AWB</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Route</th>
              <th className="py-3 px-3">Boxes</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => openDrawer(s)}>
                <td className="py-3 px-3 font-mono font-medium">{s.masterAWB}</td>
                <td className="py-3 px-3">{customerName(s.customerId)}</td>
                <td className="py-3 px-3 text-xs">{warehouseName(s.pickupWarehouseId)} → {warehouseName(s.deliveryWarehouseId)}</td>
                <td className="py-3 px-3">{s.boxAWBs?.length || 0}</td>
                <td className="py-3 px-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">BOOKED</span></td>
                <td className="py-3 px-3 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">No shipments yet.</p>}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeDrawer} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg font-mono">{selected.masterAWB}</h2>
              <button onClick={closeDrawer} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-6 text-sm">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Booking Information</h3>
                <p>Customer: {customerName(selected.customerId)}</p>
                <p>Invoice: {selected.invoiceNumber || '—'} · ₹{selected.invoiceAmount || 0}</p>
                <p>Insurance: {selected.insurance ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Route — From / To</h3>
                <p>From: {warehouseName(selected.pickupWarehouseId)}</p>
                <p>To: {warehouseName(selected.deliveryWarehouseId)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Boxes</h3>
                <p>Total: {selected.boxAWBs?.length || 0}</p>
                <p className="text-xs text-slate-500 mt-1">AWBs: {selected.boxAWBs?.join(', ')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Product</h3>
                <p>{selected.productDescription || '—'}</p>
                {selected.remarks && <p className="mt-1 text-slate-500">Remarks: {selected.remarks}</p>}
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Documents</h3>
                <a href={`/api/labels/${selected.id}`} className="btn-success inline-block" download>
                  Download Shipping Labels
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
