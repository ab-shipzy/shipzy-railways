import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shipzy Railways',
  description: 'Railway logistics booking platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen flex">
        <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">S</div>
              <div>
                <div className="font-bold tracking-tight">SHIPZY</div>
                <div className="text-xs text-slate-400">RAILWAYS</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 text-sm">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition">Dashboard</Link>
            <Link href="/booking" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition">New Booking</Link>
            <Link href="/shipments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition">Shipments</Link>
            <Link href="/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition">Customers</Link>
            <Link href="/warehouses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition">Warehouses</Link>
          </nav>
          <div className="p-4 text-xs text-slate-500 border-t border-slate-700">
            Shipzy Railways • v1.0
          </div>
        </aside>

        <div className="flex-1 ml-64">
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
            <div className="text-sm text-slate-500">Railway logistics platform</div>
            <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">System healthy</div>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
