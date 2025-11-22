'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/types';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Lấy params từ URL
  const initialKeyword = searchParams.get('keyword') || '';
  const initialMinPrice = Number(searchParams.get('minPrice')) || 0;
  const initialMaxPrice = Number(searchParams.get('maxPrice')) || 5000000;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State cho bộ lọc
  const [keyword, setKeyword] = useState(initialKeyword);
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // API Endpoint 4: Search Products
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      params.append('page', '0');
      params.append('size', '20');

      // Update URL để người dùng có thể share link
      router.push(`/search?${params.toString()}`);

      const res = await api.get(`/products/search?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data.content);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tìm khi mới vào trang nếu có params
  useEffect(() => {
    if (initialKeyword || searchParams.has('minPrice')) {
      handleSearch();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Bộ lọc */}
        <aside className="w-full md:w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4">Bộ lọc tìm kiếm</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Từ khóa</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)} 
                    placeholder="Tên sách, CD..." 
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label>Khoảng giá</Label>
                <div className="pt-4 px-2">
                  <Slider 
                    defaultValue={[0, 5000000]} 
                    max={10000000} 
                    step={50000}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val)}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-500">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full mt-4">
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </aside>

        {/* Kết quả tìm kiếm */}
        <div className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold mb-4">
            Kết quả tìm kiếm {keyword && `cho "${keyword}"`}
          </h1>

          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
          ) : products.length === 0 ? (
             <div className="text-center py-10 bg-white rounded shadow">Không tìm thấy sản phẩm nào phù hợp.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Card key={p.id} className="flex flex-col hover:shadow-md">
                  <CardContent className="flex-1 p-4">
                    <div className="text-xs text-gray-500 uppercase mb-1">{p.category}</div>
                    <h3 className="font-semibold line-clamp-2 h-12">{p.title}</h3>
                    <div className="mt-2 font-bold text-red-600">{formatCurrency(p.currentPrice)}</div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {/* Gọi hàm add to cart tái sử dụng */}}
                    >
                      <ShoppingCart size={16} className="mr-2" /> Thêm vào giỏ
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}