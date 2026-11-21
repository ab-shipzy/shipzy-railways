'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Shipments</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-slate-500">
              <th className="py-3 px-2">Master AWB</th>
              <th className="py-3 px-2">Boxes</th>
              <th className="py-3 px-2">Invoice</th>
              <th className="py-3 px-2">Created</th>
              <th className="py-3 px-2">Labels</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 px-2 font-mono font-medium">{s.masterAWB}</td>
                <td className="py-3 px-2">{s.boxAWBs?.length || 0}</td>
                <td className="py-3 px-2">{s.invoiceNumber || '—'}</td>
                <td className="py-3 px-2 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-2">
                  <a href={`/api/labels/${s.id}`} className="text-blue-600 hover:underline" download>Download</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shipments.length === 0 && <p className="text-slate-500 text-sm py-4">No shipments yet.</p>}
      </div>
    </div>
  );
}
