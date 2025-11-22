'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, setValue, watch } = useForm();
  const productType = watch('productType');

  // Load dữ liệu cũ
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        // API Endpoint 5: Get Product Detail
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          const product = res.data.data;
          // Populate form
          Object.keys(product).forEach(key => setValue(key, product[key]));
        }
      } catch (error) {
        toast.error("Không tìm thấy sản phẩm");
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, setValue, router, toast]);

  const onSubmit = async (data: any) => {
    try {
      // API Endpoint 7: Update Product
      await api.put(`/products/${id}`, {
        ...data,
        currentPrice: Number(data.currentPrice),
        originalValue: Number(data.originalValue),
        quantity: Number(data.quantity),
        weight: Number(data.weight)
      });
      
      toast.success("Cập nhật thành công!" );
      router.push('/admin/products');
    } catch (error) {
      toast.error("Vui lòng kiểm tra lại" );
    }
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft /></Button>
        <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm #{id}</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Loại sản phẩm</Label>
            <Select 
              value={productType} 
              onValueChange={(val) => setValue('productType', val)} 
              disabled // Không cho đổi loại sản phẩm khi edit
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="book">Sách</SelectItem>
                <SelectItem value="cd">CD</SelectItem>
                <SelectItem value="dvd">DVD</SelectItem>
                <SelectItem value="lp">LP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input {...register('barcode')} disabled className="bg-gray-100" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tên sản phẩm</Label>
          <Input {...register('title')} required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Giá gốc</Label>
            <Input type="number" {...register('originalValue')} required />
          </div>
          <div className="space-y-2">
            <Label>Giá bán</Label>
            <Input type="number" {...register('currentPrice')} required />
          </div>
          <div className="space-y-2">
            <Label>Tồn kho</Label>
            <Input type="number" {...register('quantity')} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Danh mục</Label>
            <Input {...register('category')} />
          </div>
          <div className="space-y-2">
             <Label>Cân nặng (kg)</Label>
             <Input type="number" step="0.1" {...register('weight')} />
          </div>
        </div>

        {/* Dynamic fields cho Book */}
        {productType === 'book' && (
           <div className="p-4 bg-blue-50 rounded border border-blue-100 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Tác giả</Label>
                 <Input {...register('author')} />
              </div>
              <div className="space-y-2">
                 <Label>Nhà xuất bản</Label>
                 <Input {...register('publisher')} />
              </div>
           </div>
        )}

        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Textarea {...register('description')} className="h-32" />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
          <Button type="submit" className="gap-2"><Save size={16} /> Lưu thay đổi</Button>
        </div>
      </form>
    </div>
  );
}