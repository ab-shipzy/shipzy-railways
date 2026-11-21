import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shipzy Railways',
  description: 'Railway logistics booking platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Shipzy Railways</h1>
            <div className="space-x-4">
              <Link href="/booking" className="hover:underline">Booking</Link>
              <Link href="/customers" className="hover:underline">Customers</Link>
              <Link href="/warehouses" className="hover:underline">Warehouses</Link>
              <Link href="/shipments" className="hover:underline">Shipments</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
