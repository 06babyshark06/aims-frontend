'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchPendingOrders = async () => {
    try {
      // API Endpoint 22: Get Pending Orders
      const res = await api.get('/orders/pending?page=0&size=20');
      if (res.data.success) setOrders(res.data.data.content);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchPendingOrders(); }, []);

  const handleApprove = async (id: number) => {
    try {
      // API Endpoint 23: Approve
      await api.put(`/orders/${id}/approve`);
      toast.success("Đã duyệt đơn hàng!");
      fetchPendingOrders();
    } catch (error) {
      toast.error("Không thể duyệt đơn");
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      // API Endpoint 24: Reject
      await api.put(`/orders/${id}/reject`, { rejectionReason: reason });
      toast.success("Đã từ chối đơn hàng");
      fetchPendingOrders();
    } catch (error) {
      toast.error("Lỗi hệ thống");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Duyệt đơn hàng chờ xử lý</h1>
      
      {orders.length === 0 ? (
        <div className="text-gray-500">Hiện không có đơn hàng nào cần duyệt.</div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-yellow-400">
              <CardHeader className="flex flex-row justify-between items-center bg-gray-50/50 pb-2">
                <div>
                   <CardTitle className="text-lg">Đơn hàng #{order.orderNumber}</CardTitle>
                   <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                   </span>
                </div>
                <Badge className="bg-yellow-500">Chờ duyệt</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                 <div className="flex justify-between mb-4">
                    <div>
                       <p className="font-semibold">Khách hàng:</p>
                       <p>{order.deliveryInfo?.customerName}</p>
                       <p className="text-sm text-gray-500">{order.deliveryInfo?.customerPhone}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold">Tổng tiền:</p>
                       <p className="text-xl font-bold text-red-600">{formatCurrency(order.totalAmount)}</p>
                       <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                    </div>
                 </div>
                 
                 <div className="flex justify-end gap-3 border-t pt-4">
                    <Button variant="destructive" onClick={() => handleReject(order.id)}>
                       <X size={16} className="mr-2" /> Từ chối
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(order.id)}>
                       <Check size={16} className="mr-2" /> Duyệt đơn
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}