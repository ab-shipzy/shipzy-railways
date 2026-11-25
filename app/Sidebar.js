'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />}

      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: 240,
        background: '#fff', borderRight: '1px solid #e5eaf3', zIndex: 50,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e5eaf3', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#146bff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>S</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0a1b3d' }}>Shipzy</div>
            <div style={{ fontSize: 11, color: '#5b6b82' }}>Railways</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {[
            { href: '/', label: 'Dashboard' },
            { href: '/booking', label: 'New Booking' },
            { href: '/shipments', label: 'Shipments' },
            { href: '/customers', label: 'Customers' },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{ display: 'block', padding: '10px 12px', borderRadius: 8, color: '#0a1b3d', textDecoration: 'none', fontSize: 14, marginBottom: 2 }}>
              {item.label}
            </Link>
          ))}
          <div style={{ padding: '16px 12px 6px', fontSize: 11, letterSpacing: 0.5, color: '#5b6b82', fontWeight: 500 }}>SETTINGS</div>
          <Link href="/warehouses" onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, color: '#0a1b3d', textDecoration: 'none', fontSize: 14 }}>Warehouses</Link>
          <Link href="/stations" onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, color: '#0a1b3d', textDecoration: 'none', fontSize: 14 }}>Stations</Link>
          <Link href="/vendors" onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, color: '#0a1b3d', textDecoration: 'none', fontSize: 14 }}>Vendors</Link>
        </nav>
        <div style={{ padding: 16, borderTop: '1px solid #e5eaf3', fontSize: 11, color: '#5b6b82' }}>Shipzy Railways</div>
      </aside>

      <div style={{ minHeight: '100vh' }}>
        <header style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5eaf3', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#0a1b3d' }}>☰</button>
          <input type="search" placeholder="Search..." style={{ flex: 1, maxWidth: 320, border: '1px solid #e5eaf3', borderRadius: 20, padding: '8px 16px', fontSize: 14, background: '#fff', outline: 'none' }} />
        </header>
        <main style={{ padding: 20 }}>{children}</main>
      </div>
    </>
  );
}
