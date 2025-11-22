'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Định nghĩa kiểu dữ liệu đơn giản cho Order History
interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: any[]; // Chi tiết items có thể hiển thị nếu cần
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra login
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // API Endpoint 21: Get My Orders
    api.get('/orders/my-orders?page=0&size=20')
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.data.content || []); // content vì là phân trang
        }
      })
      .catch((err) => console.error("Lỗi tải đơn hàng", err))
      .finally(() => setLoading(false));
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Lịch sử mua hàng</h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Bạn chưa có đơn hàng nào.</p>
            <Link href="/"><Button variant="link">Mua sắm ngay</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-gray-50/50">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">Đơn hàng #{order.orderNumber || order.id}</CardTitle>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white hover:opacity-90`}>
                    {order.status}
                  </Badge>
                </CardHeader>
                <CardContent className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Số lượng sản phẩm: {order.items?.length || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}