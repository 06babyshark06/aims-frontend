'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product, ApiResponse } from '@/types';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Package, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // API Endpoint 5
    api.get<ApiResponse<Product>>(`/products/${id}`)
      .then((res) => {
        if (res.data.success) setProduct(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    try {
      // API Endpoint 12
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error("Không thể thêm sản phẩm");
    }
  };

  if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin" /></div>;
  if (!product) return <div className="text-center mt-20">Không tìm thấy sản phẩm</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow">
          {/* Ảnh Demo */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center rounded-lg relative">
            <span className="text-4xl text-gray-300 font-bold uppercase">{product.productType}</span>
            {product.quantity === 0 && (
              <Badge variant="destructive" className="absolute top-4 right-4 text-lg px-4 py-1">
                Hết hàng
              </Badge>
            )}
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <div className="text-gray-500 mt-1">Barcode: {product.barcode}</div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-red-600">
                {formatCurrency(product.currentPrice)}
              </span>
              {product.originalValue > product.currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.originalValue)}
                </span>
              )}
            </div>

            <div className="border-t border-b py-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Info size={18} /> Mô tả
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>

            {/* Thông số kỹ thuật (Physical attributes) */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
               <h3 className="font-semibold flex items-center gap-2">
                <Package size={18} /> Thông số vận chuyển
              </h3>
               <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* <div>Khối lượng: <span className="font-medium">{product.weight || 0} kg</span></div> */}
                  {/* Các trường này có thể undefined tuỳ loại sản phẩm */}
                  {/* <div>Kích thước: {product.length} x {product.width} x {product.height} cm</div> */}
               </div>
            </div>

            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full md:w-auto text-lg px-8"
                onClick={addToCart}
                disabled={product.quantity <= 0}
              >
                <ShoppingCart className="mr-2" />
                {product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}