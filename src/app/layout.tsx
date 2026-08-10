import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Maraki Food Zones | Authentic Ethiopian Delivery",
  description: "Order the best Ethiopian food in town, delivered fast and fresh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
