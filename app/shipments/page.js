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

  const th = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e5e7eb' };
  const td = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9' };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Shipments</h1>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={th}>Master AWB</th>
              <th style={th}>Customer</th>
              <th style={th}>Route</th>
              <th style={th}>Boxes</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} onClick={() => openDrawer(s)} style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...td, fontFamily: 'monospace', fontWeight: 600 }}>{s.masterAWB}</td>
                <td style={td}>{customerName(s.customerId)}</td>
                <td style={td}>{warehouseName(s.pickupWarehouseId)} → {warehouseName(s.deliveryWarehouseId)}</td>
                <td style={td}>{s.boxAWBs?.length || 0}</td>
                <td style={td}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>BOOKED</span>
                </td>
                <td style={{ ...td, color: '#64748b' }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && <p style={{ color: '#64748b', fontSize: 13, padding: 24, textAlign: 'center' }}>No shipments yet.</p>}
      </div>

      {selected && (
        <>
          <div onClick={closeDrawer} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: 480,
            background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', zIndex: 50,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontFamily: 'monospace', fontWeight: 700 }}>{selected.masterAWB}</h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{customerName(selected.customerId)}</p>
              </div>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', fontSize: 24, color: '#94a3b8', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', fontSize: 13 }}>
              {[
                { id: 'parties', label: 'Shipper & Receiver' },
                { id: 'details', label: 'Shipment Details' },
                { id: 'invoice', label: 'Invoice & E-way' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: 600, color: tab === t.id ? '#0074ff' : '#64748b',
                    borderBottom: tab === t.id ? '2px solid #0074ff' : '2px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, fontSize: 13 }}>
              {tab === 'parties' && (
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Shipper (Consignor)</h3>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 16 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{warehouse(selected.pickupWarehouseId).name || '—'}</p>
                    <p style={{ margin: '4px 0 0', color: '#475569' }}>{warehouse(selected.pickupWarehouseId).address}</p>
                    <p style={{ margin: '2px 0 0', color: '#475569' }}>
                      {[warehouse(selected.pickupWarehouseId).city, warehouse(selected.pickupWarehouseId).state, warehouse(selected.pickupWarehouseId).pin].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Receiver (Consignee)</h3>
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{warehouse(selected.deliveryWarehouseId).name || '—'}</p>
                    <p style={{ margin: '4px 0 0', color: '#475569' }}>{warehouse(selected.deliveryWarehouseId).address}</p>
                    <p style={{ margin: '2px 0 0', color: '#475569' }}>
                      {[warehouse(selected.deliveryWarehouseId).city, warehouse(selected.deliveryWarehouseId).state, warehouse(selected.deliveryWarehouseId).pin].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {tab === 'details' && (
                <div>
                  <p style={{ margin: '0 0 8px' }}><strong>Boxes:</strong> {selected.boxAWBs?.length || 0}</p>
                  <p style={{ margin: '0 0 8px' }}><strong>Product:</strong> {selected.productDescription || '—'}</p>
                  <p style={{ margin: '0 0 8px' }}><strong>Remarks:</strong> {selected.remarks || '—'}</p>
                  {selected.boxes && Array.isArray(selected.boxes) && selected.boxes.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Box types</strong>
                      {selected.boxes.map((b, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: 8, borderRadius: 4, marginTop: 6, fontSize: 12 }}>
                          Count: {b.count} • Weight: {b.weight || '—'} kg • {b.length || '—'}×{b.width || '—'}×{b.height || '—'} cm
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {tab === 'invoice' && (
                <div>
                  <p style={{ margin: '0 0 8px' }}><strong>Invoice No:</strong> {selected.invoiceNumber || '—'}</p>
                  <p style={{ margin: '0 0 8px' }}><strong>Amount:</strong> ₹{selected.invoiceAmount || 0}</p>
                  <p style={{ margin: '0 0 16px' }}><strong>Insurance:</strong> {selected.insurance ? 'Yes' : 'No'}</p>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>E-way Bill</h3>
                  <p style={{ color: '#64748b' }}>Not uploaded yet</p>
                </div>
              )}
            </div>

            <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
              <a href={`/api/labels/${selected.id}`} download style={{
                display: 'block', textAlign: 'center', background: '#059669', color: '#fff',
                padding: '10px 16px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14,
              }}>
                Download Shipping Labels
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
