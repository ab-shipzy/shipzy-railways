'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#00304a] text-slate-200 flex flex-col z-50 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 py-6 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0074ff] rounded flex items-center justify-center font-bold text-white text-sm">S</div>
            <div>
              <div className="text-sm font-semibold text-white">SHIPZY</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider">Railways</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-white text-xl">×</button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 text-[13px] overflow-y-auto">
          <Link href="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Dashboard</Link>
          <Link href="/booking" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">New Booking</Link>
          <Link href="/shipments" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Shipments</Link>
          <Link href="/customers" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Customers</Link>
          <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-slate-400">Settings</div>
          <Link href="/warehouses" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Warehouses</Link>
          <Link href="/stations" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Stations</Link>
          <Link href="/vendors" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-white/10 text-slate-200 hover:text-white">Vendors</Link>
        </nav>
        <div className="px-5 py-4 text-[11px] text-slate-400 border-t border-white/10">Shipzy Railways • v1.0</div>
      </aside>

      <div className="md:ml-60 min-h-screen flex flex-col">
        <header className="bg-white border-b border-[#e5e7eb] px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="md:hidden text-2xl text-slate-600">☰</button>
          <input type="search" placeholder="Search..." className="flex-1 border border-[#e5e7eb] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0074ff]/30" />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
