import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shipzy Railways',
  description: 'Railway logistics booking platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f7f8fa] min-h-screen flex">
        <aside className="w-60 bg-[#00304a] text-slate-200 flex flex-col fixed h-full z-30">
          <div className="px-5 py-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#0074ff] rounded flex items-center justify-center font-bold text-white text-sm">S</div>
              <div>
                <div className="text-sm font-semibold tracking-wide text-white">SHIPZY</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider">Railways</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5 text-[13px]">
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/10 transition text-slate-200 hover:text-white">Dashboard</Link>
            <Link href="/booking" className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/10 transition text-slate-200 hover:text-white">New Booking</Link>
            <Link href="/shipments" className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/10 transition text-slate-200 hover:text-white">Shipments</Link>
            <Link href="/customers" className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/10 transition text-slate-200 hover:text-white">Customers</Link>
            <Link href="/warehouses" className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/10 transition text-slate-200 hover:text-white">Warehouses</Link>
          </nav>
          <div className="px-5 py-4 text-[11px] text-slate-400 border-t border-white/10">
            Shipzy Railways • v1.0
          </div>
        </aside>

        <div className="flex-1 ml-60">
          <header className="bg-white border-b border-[#e5e7eb] px-8 py-3.5 flex justify-between items-center sticky top-0 z-20">
            <div className="text-sm text-slate-500">Railway logistics operations</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700 font-medium">System healthy</span>
            </div>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
