import './globals.css';
import Sidebar from './Sidebar';

export const metadata = { title: 'Shipzy Railways', description: 'Railway logistics' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#eef3fc', color: '#0a1b3d' }}>
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
