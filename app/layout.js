import './globals.css';
import Sidebar from './Sidebar';

export const metadata = {
  title: 'Shipzy Railways',
  description: 'Railway logistics booking',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f7f8fa] text-[#0f172a]">
        <Sidebar>{children}</Sidebar>
      </body>
    </html>
  );
}
