'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Product, ApiResponse } from '@/types';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import Loading from './loading';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResponse<Product[]>>('/products/random?count=20')
      .then((res) => {
        if (res.data.success) setProducts(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (productId: number) => {
    try {
      // API Endpoint 12
      await api.post('/cart/items', { productId, quantity: 1 });
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error("Không thể thêm vào giỏ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sản phẩm nổi bật</h1>
        
        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <Card key={p.id} className="flex flex-col hover:shadow-lg transition">
                <div className="aspect-square bg-gray-200 flex items-center justify-center text-gray-400">
                  {/* Placeholder image */}
                  Image: {p.productType}
                </div>
                <CardContent className="flex-1 p-4">
                  <div className="text-xs text-gray-500 uppercase">{p.category}</div>
                  <h3 className="font-semibold text-lg line-clamp-2 mt-1">{p.title}</h3>
                  <div className="mt-2 font-bold text-red-600 text-xl">
                    {formatCurrency(p.currentPrice)}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => addToCart(p.id)}
                    disabled={p.quantity <= 0}
                  >
                    <ShoppingCart size={16} />
                    {p.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}