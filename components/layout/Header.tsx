'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const [user, setUser] = useState<any>(null);

  // Check trạng thái login khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <header className="border-b sticky top-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition">
          AIMS Store
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
           {/* (Giữ nguyên code Search cũ) */}
           <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
           <Input placeholder="Tìm kiếm sách, CD, DVD..." className="pl-8" />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-[1.2rem] bg-red-500">
                !
              </Badge>
            </Button>
          </Link>

          {/* Login Logic */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserIcon size={16} />
                  <span className="max-w-[100px] truncate">{user.fullName || user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">Hồ sơ & Mật khẩu</DropdownMenuItem>
                </Link>
                <Link href="/orders/history">
                  <DropdownMenuItem className="cursor-pointer">Lịch sử đơn hàng</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link href="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}