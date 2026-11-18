import './globals.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'Why Smart Money AI - Quantitative Stock Intelligence',
  description: '5 AM market intelligence, institutional smart money proxies, and calibrated predictive signals for US and TSX equities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-gray-100 min-h-screen flex flex-col antialiased">
        <Navbar isDemoMode={true} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
