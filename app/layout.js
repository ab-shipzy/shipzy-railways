'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', background: '#f7f8fa' }}>
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
        )}

        <aside style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: 240, background: '#00304a', color: '#e2e8f0', zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.2s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#0074ff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>S</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>SHIPZY</div>
                <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1 }}>RAILWAYS</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>×</button>
          </div>
          <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
            {[
              { href: '/', label: 'Dashboard' },
              { href: '/booking', label: 'New Booking' },
              { href: '/shipments', label: 'Shipments' },
              { href: '/customers', label: 'Customers' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                style={{ display: 'block', padding: '12px 12px', borderRadius: 6, color: '#e2e8f0', textDecoration: 'none', marginBottom: 2 }}>
                {item.label}
              </Link>
            ))}
            <div style={{ padding: '16px 12px 6px', fontSize: 10, letterSpacing: 1, color: '#64748b' }}>SETTINGS</div>
            <Link href="/warehouses" onClick={() => setSidebarOpen(false)}
              style={{ display: 'block', padding: '12px 12px', borderRadius: 6, color: '#e2e8f0', textDecoration: 'none' }}>
              Warehouses / Hubs
            </Link>
            <Link href="/stations" onClick={() => setSidebarOpen(false)}
              style={{ display: 'block', padding: '12px 12px', borderRadius: 6, color: '#e2e8f0', textDecoration: 'none' }}>
              Stations
            </Link>
            <Link href="/vendors" onClick={() => setSidebarOpen(false)}
              style={{ display: 'block', padding: '12px 12px', borderRadius: 6, color: '#e2e8f0', textDecoration: 'none' }}>
              Vendors
            </Link>
          </nav>
          <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: '#64748b' }}>
            Shipzy Railways • v1.0
          </div>
        </aside>

        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 30 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#334155' }}>☰</button>
            <input type="search" placeholder="Search..." style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 14 }} />
          </header>
          <main style={{ flex: 1, padding: 16 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
