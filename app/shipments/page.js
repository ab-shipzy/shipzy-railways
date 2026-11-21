'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('parties');

  useEffect(() => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/warehouses').then(r => r.json()).then(setWarehouses);
  }, []);

  const openDrawer = (s) => { setSelected(s); setTab('parties'); };
  const closeDrawer = () => setSelected(null);

  const customerName = (id) => customers.find(c => c.id === id)?.name || '—';
  const warehouseName = (id) => warehouses.find(w => w.id === id)?.name || '—';
  const warehouse = (id) => warehouses.find(w => w.id === id) || {};

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
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-5 border-b flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-lg font-mono">{selected.masterAWB}</h2>
                <p className="text-xs text-slate-500">{customerName(selected.customerId)}</p>
              </div>
              <button onClick={closeDrawer} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex border-b text-sm shrink-0">
              {[
                { id: 'parties', label: 'Shipper & Receiver' },
                { id: 'details', label: 'Shipment Details' },
                { id: 'invoice', label: 'Invoice & E-way' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-3 font-medium ${tab === t.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 text-sm">
              {tab === 'parties' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Shipper (Consignor)</h3>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-medium">{warehouse(selected.pickupWarehouseId).name || '—'}</p>
                      <p className="text-slate-600 mt-1">{warehouse(selected.pickupWarehouseId).address}</p>
                      <p className="text-slate-600">{warehouse(selected.pickupWarehouseId).city} {warehouse(selected.pickupWarehouseId).state} - {warehouse(selected.pickupWarehouseId).pin}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Receiver (Consignee)</h3>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-medium">{customerName(selected.customerId)}</p>
                      <p className="text-slate-600 mt-1">{warehouse(selected.deliveryWarehouseId).address}</p>
                      <p className="text-slate-600">{warehouse(selected.deliveryWarehouseId).city} {warehouse(selected.deliveryWarehouseId).state} - {warehouse(selected.deliveryWarehouseId).pin}</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Boxes</h3>
                    <p>Total boxes: {selected.boxAWBs?.length || 0}</p>
                    <div className="mt-2 space-y-1 text-xs font-mono">
                      {(selected.boxAWBs || []).map((awb, i) => (
                        <div key={i} className="bg-slate-50 px-2 py-1 rounded">Box {i + 1}: {awb}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Product</h3>
                    <p>{selected.productDescription || '—'}</p>
                    {selected.remarks && <p className="mt-1 text-slate-500">Remarks: {selected.remarks}</p>}
                  </div>
                </div>
              )}

              {tab === 'invoice' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded">
                    <p><span className="text-slate-500">Invoice No:</span> {selected.invoiceNumber || '—'}</p>
                    <p className="mt-1"><span className="text-slate-500">Amount:</span> ₹{selected.invoiceAmount || 0}</p>
                    <p className="mt-1"><span className="text-slate-500">Insurance:</span> {selected.insurance ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-2">E-way Bill</h3>
                    <p className="text-slate-500 text-xs">Not uploaded yet</p>
                  </div>
                  <div className="pt-2">
                    <a href={`/api/labels/${selected.id}`} className="btn-success inline-block" download>
                      Download Shipping Labels
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
