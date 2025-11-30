'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, ApiResponse } from '@/types';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Loader2, BookOpen, Film, Music, Newspaper, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import Loading from './loading';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gọi API (giả sử endpoint là /api/products)
        const res = await api.get<ApiResponse<Product[]>>('/api/products/random?count=20');
        
        // Kiểm tra errorCode dựa trên cấu trúc JSON mới
        if (res.data.errorCode === 'ER0000') {
          // Chỉ lấy sản phẩm đang ACTIVE
          const activeProducts = res.data.data.filter(p => p.status === 'ACTIVE');
          setProducts(activeProducts);
        } else {
          toast.error(`Lỗi: ${res.data.message}`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); 
    setAddingId(product.id);
    
    try {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      toast.success(`Đã thêm "${product.title}" vào giỏ`);
    } catch (error) {
      toast.error("Thêm vào giỏ thất bại");
    } finally {
      setAddingId(null);
    }
  };

  // Hàm helper để lấy icon/màu sắc dựa trên category (vì API không trả về ảnh)
  const getCategoryVisuals = (category: string) => {
    switch (category) {
      case 'BOOK': return { icon: <BookOpen size={48} />, color: 'bg-blue-100 text-blue-600', label: 'Sách' };
      case 'MOVIE': return { icon: <Film size={48} />, color: 'bg-red-100 text-red-600', label: 'Phim' };
      case 'MUSIC': return { icon: <Music size={48} />, color: 'bg-purple-100 text-purple-600', label: 'Nhạc' };
      case 'NEWS': return { icon: <Newspaper size={48} />, color: 'bg-gray-100 text-gray-600', label: 'Báo' };
      default: return { icon: <AlertCircle size={48} />, color: 'bg-gray-100 text-gray-400', label: category };
    }
  };

  // Tính phần trăm giảm giá
  const calculateDiscount = (original: number, current: number) => {
    if (original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Sản phẩm mới nhất</h1>
        
        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const visual = getCategoryVisuals(p.category);
              const discount = calculateDiscount(p.originalValue, p.currentPrice);

              return (
                <Card key={p.id} className="flex flex-col hover:shadow-xl transition-all duration-300 group border-slate-200">
                  <Link href={`/products/${p.id}`} className="flex-1 flex flex-col relative">
                    
                    {/* Badge giảm giá */}
                    {discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                        -{discount}%
                      </div>
                    )}

                    {/* Phần hiển thị Ảnh giả lập (Do API thiếu ảnh) */}
                    <div className={`aspect-[4/3] ${visual.color} flex flex-col items-center justify-center transition-colors`}>
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        {visual.icon}
                      </div>
                      <span className="text-xs font-semibold mt-2 opacity-70">{visual.label}</span>
                    </div>
                    
                    <CardContent className="flex-1 p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                         <div className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider font-bold">
                            {p.barcode}
                         </div>
                         <div className={`text-[10px] font-bold ${p.quantity > 10 ? 'text-green-600' : 'text-orange-500'}`}>
                            {p.quantity > 0 ? `Còn ${p.quantity}` : 'Hết hàng'}
                         </div>
                      </div>

                      <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-800 group-hover:text-primary transition-colors mt-1">
                        {p.title}
                      </h3>
                      
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                        {p.description}
                      </p>

                      <div className="mt-auto flex items-end gap-2">
                        <div className="font-bold text-red-600 text-xl">
                          {formatCurrency(p.currentPrice)}
                        </div>
                        {p.originalValue > p.currentPrice && (
                          <div className="text-sm text-slate-400 line-through mb-1">
                            {formatCurrency(p.originalValue)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Link>

                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full gap-2 font-medium" 
                      onClick={(e) => addToCart(e, p)}
                      disabled={p.quantity <= 0 || addingId === p.id}
                      variant={p.quantity > 0 ? "default" : "secondary"}
                    >
                      {addingId === p.id ? (
                          <Loader2 size={18} className="animate-spin" />
                      ) : (
                          <ShoppingCart size={18} />
                      )}
                      
                      {p.quantity <= 0 
                          ? 'Hết hàng' 
                          : (addingId === p.id ? 'Đang xử lý...' : 'Chọn mua')
                      }
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <p>Không tìm thấy sản phẩm nào.</p>
            </div>
        )}
      </main>
    </div>
  );
}