'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Cart } from '@/types';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Minus, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  const fetchCart = async () => {
    try {
      // API Endpoint 11
      const res = await api.get('/cart');
      if (res.data.success) setCart(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId: number, newQty: number) => {
    if (newQty < 1) return;
    // API Endpoint 13
    await api.put(`/cart/items/${productId}`, { quantity: newQty });
    fetchCart();
  };

  const removeItem = async (productId: number) => {
    // API Endpoint 14
    await api.delete(`/cart/items/${productId}`);
    fetchCart();
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <Link href="/"><Button>Quay lại mua sắm</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <div className="grid md:grid-cols-3 gap-8">
          {/* List Items */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">
                      {item.productTitle}
                      <div className="text-xs text-gray-500">Loại: {item.productType}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" h-8 w-8 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="icon" variant="outline" h-8 w-8
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                        <Trash2 size={18} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h3 className="font-bold text-lg mb-4">Tổng quan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng (gồm VAT):</span>
                <span className="text-red-600">{formatCurrency(cart.totalWithVAT)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">*Chưa bao gồm phí vận chuyển</p>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button className="w-full size-lg">Tiến hành đặt hàng</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}