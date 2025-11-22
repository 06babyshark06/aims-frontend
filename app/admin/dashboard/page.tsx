'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Users, Package, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  // Ở đây có thể gọi API lấy stats nếu backend hỗ trợ
  // Hiện tại ta hiển thị Quick Actions

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-slate-500">Xin chào, Admin!</p>
      </div>

      {/* Stats Cards (Giả lập hoặc cần API riêng) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng chờ xử lý</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Cần duyệt ngay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Mặt hàng đang kinh doanh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Khách hàng đăng ký</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Truy cập nhanh</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/orders">
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition cursor-pointer group">
              <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                Duyệt đơn hàng <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-sm text-yellow-600 mt-2">Xem và xử lý các đơn hàng đang chờ (Pending).</p>
            </div>
          </Link>
          
          <Link href="/admin/products/create">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer group">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                Thêm sản phẩm mới <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-sm text-blue-600 mt-2">Nhập kho sách, CD, DVD mới.</p>
            </div>
          </Link>

          <Link href="/admin/users">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer group">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Quản lý User <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
              </h3>
              <p className="text-sm text-gray-600 mt-2">Xem danh sách và phân quyền tài khoản.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}