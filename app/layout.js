import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shipzy Railways',
  description: 'Railway logistics booking platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <nav className="bg-slate-900 text-white shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold">S</div>
              <h1 className="text-xl font-bold tracking-tight">Shipzy Railways</h1>
            </div>
            <div className="space-x-6 text-sm font-medium">
              <Link href="/booking" className="hover:text-blue-400 transition">Booking</Link>
              <Link href="/customers" className="hover:text-blue-400 transition">Customers</Link>
              <Link href="/warehouses" className="hover:text-blue-400 transition">Warehouses</Link>
              <Link href="/shipments" className="hover:text-blue-400 transition">Shipments</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
