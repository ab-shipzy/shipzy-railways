'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Dashboard' },
  { href: '/booking', label: 'Booking' },
  { href: '/shipments', label: 'Shipments' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar({ children }) {
  const path = usePathname();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5eaf3',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/mark.png" alt="Shipzy" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 600, color: '#0a1b3d', fontSize: 15 }}>Shipzy Railways</span>
          </Link>

          <nav style={{ display: 'flex', gap: 2, marginLeft: 12, flex: 1, overflowX: 'auto' }}>
            {tabs.map(t => {
              const active = path === t.href || (t.href !== '/' && path.startsWith(t.href));
              return (
                <Link key={t.href} href={t.href} style={{
                  padding: '6px 12px', borderRadius: 16, textDecoration: 'none', fontSize: 13,
                  fontWeight: active ? 600 : 500, whiteSpace: 'nowrap',
                  color: active ? '#146bff' : '#5b6b82',
                  background: active ? 'rgba(20,107,255,0.1)' : 'transparent',
                }}>
                  {t.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side elements */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#5b6b82', padding: '4px 10px', background: '#f8fafc', borderRadius: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#10b981' }} />
              Synced
            </div>
            <div style={{ fontSize: 11, color: '#5b6b82', padding: '4px 10px', background: '#f8fafc', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{time}</span>
              <span style={{ color: '#94a3b8' }}>|</span>
              <span style={{ fontWeight: 500 }}>v1.2.0</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>AWB update</span>
            </div>
            <Link href="/booking" style={{
              background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: 16,
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
            }}>+ New Booking</Link>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: '#146bff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>A</div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '20px', width: '100%' }}>
        {children}
      </main>

      <footer style={{
        background: '#fff', borderTop: '1px solid #e5eaf3', padding: '12px 20px',
        textAlign: 'center', fontSize: 12, color: '#5b6b82',
      }}>
        Shipzy Railways • {today}
      </footer>
    </div>
  );
}
