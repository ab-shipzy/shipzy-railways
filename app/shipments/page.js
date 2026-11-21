'use client';

import { useState, useEffect } from 'react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetch('/api/shipments').then(r => r.json()).then(setShipments);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Shipments</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Master AWB</th>
            <th className="p-2">Boxes</th>
            <th className="p-2">Invoice</th>
            <th className="p-2">Created</th>
            <th className="p-2">Labels</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.masterAWB}</td>
              <td className="p-2">{s.boxAWBs.length}</td>
              <td className="p-2">{s.invoiceNumber}</td>
              <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="p-2">
                <a href={`/api/labels/${s.id}`} className="text-blue-600 underline" download>
                  Download Labels
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
