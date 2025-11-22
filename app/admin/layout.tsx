'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingCart, LogOut, BarChart } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check quyền Admin
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    // API Doc: Role có prefix ROLE_
    if (!user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_PRODUCT_MANAGER')) {
      alert("Bạn không có quyền truy cập trang này!");
      router.push('/');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          AIMS Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <BarChart size={20} /> Tổng quan
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <Package size={20} /> Quản lý Sản phẩm
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <ShoppingCart size={20} /> Duyệt Đơn hàng
            </Button>
          </Link>
          {/* Feature dành riêng cho Admin tối cao */}
          <Link href="/admin/users">
             <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <Users size={20} /> Quản lý User
            </Button>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Button 
            variant="destructive" 
            className="w-full gap-2"
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
          >
            <LogOut size={18} /> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}