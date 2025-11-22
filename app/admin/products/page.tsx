'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // Reuse API Search để lấy list (API 4)
      const res = await api.get('/products/search?size=100'); 
      if (res.data.success) setProducts(res.data.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      // API Endpoint 8
      await api.delete(`/products/${id}`);
      toast.success("Đã xóa sản phẩm");
      fetchProducts(); // Reload list
    } catch (error) {
      toast.error("Không thể xóa (có thể do còn hàng trong kho)");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <Link href="/admin/products/create">
          <Button className="gap-2"><Plus size={18} /> Thêm mới</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 mb-4">
           <Input placeholder="Tìm theo tên..." className="max-w-sm" />
           <Button variant="outline"><Search size={18} /></Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <div>Loading...</div> : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell className="font-medium max-w-[300px] truncate" title={p.title}>
                  {p.title}
                  <div className="text-xs text-gray-400">{p.barcode}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{p.productType}</Badge></TableCell>
                <TableCell>{formatCurrency(p.currentPrice)}</TableCell>
                <TableCell>
                  <span className={p.quantity < 10 ? "text-red-500 font-bold" : ""}>
                    {p.quantity}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" size="icon"><Edit size={16} /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}