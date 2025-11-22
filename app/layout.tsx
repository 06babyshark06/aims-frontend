import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner"; // Cần chạy npx shadcn-ui@latest add toast
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AIMS - An Internet Media Store',
  description: 'Hệ thống bán hàng Media số 1 Việt Nam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {children}
        <Toaster /> 
      </body>
    </html>
  );
}