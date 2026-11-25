'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Dashboard' },
  { href: '/booking', label: 'Booking' },
  { href: '/shipments', label: 'Shipments' },
  { href: '/customers', label: 'Customers' },
  { href: '/warehouses', label: 'Warehouses' },
  { href: '/stations', label: 'Stations' },
  { href: '/vendors', label: 'Vendors' },
];

export default function Sidebar({ children }) {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5eaf3',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#146bff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>S</div>
            <span style={{ fontWeight: 600, color: '#0a1b3d', fontSize: 15 }}>Shipzy Railways</span>
          </Link>

          <nav style={{ display: 'flex', gap: 4, marginLeft: 24, flex: 1 }}>
            {tabs.map(t => (
              <Link key={t.href} href={t.href} style={{
                padding: '8px 14px', borderRadius: 20, textDecoration: 'none', fontSize: 13,
                fontWeight: path === t.href ? 600 : 500,
                color: path === t.href ? '#146bff' : '#5b6b82',
                background: path === t.href ? 'rgba(20,107,255,0.08)' : 'transparent',
                transition: 'all 0.15s ease',
              }}>
                {t.label}
              </Link>
            ))}
          </nav>

          <input type="search" placeholder="Search..." style={{
            width: 180, border: '1px solid #e5eaf3', borderRadius: 20,
            padding: '8px 14px', fontSize: 13, background: '#fff', outline: 'none',
          }} />
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
        {children}
      </main>

      <footer style={{
        background: '#fff', borderTop: '1px solid #e5eaf3', padding: '16px 20px',
        textAlign: 'center', fontSize: 12, color: '#5b6b82',
      }}>
        Shipzy Railways • Railway logistics booking
      </footer>
    </div>
  );
}
