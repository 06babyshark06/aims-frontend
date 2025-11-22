'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch } = useForm();
  const productType = watch('productType');

  const onSubmit = async (data: any) => {
    try {
      // Convert số
      const payload = {
        ...data,
        currentPrice: Number(data.currentPrice),
        originalValue: Number(data.originalValue),
        quantity: Number(data.quantity),
        weight: Number(data.weight || 0),
        isNew: true
      };

      // API Endpoint 6
      await api.post('/products', payload);
      toast.success("Thêm sản phẩm thành công!");
      router.push('/admin/products');
    } catch (error) {
      toast.error("Vui lòng kiểm tra lại dữ liệu nhập");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Loại sản phẩm</Label>
            <Select onValueChange={(val) => setValue('productType', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book">Sách (Book)</SelectItem>
                <SelectItem value="cd">Đĩa CD</SelectItem>
                <SelectItem value="dvd">Đĩa DVD</SelectItem>
                <SelectItem value="lp">Đĩa than (LP)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Barcode</Label>
            <Input {...register('barcode')} required placeholder="VD: BOOK-001" />
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
            <Label>Giá bán hiện tại</Label>
            <Input type="number" {...register('currentPrice')} required />
          </div>
          <div className="space-y-2">
            <Label>Số lượng kho</Label>
            <Input type="number" {...register('quantity')} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Danh mục</Label>
          <Input {...register('category')} placeholder="VD: Programming, Music..." />
        </div>

        {/* Các trường dynamic tùy loại sản phẩm (Demo đơn giản) */}
        {productType === 'book' && (
           <div className="p-4 bg-gray-50 rounded space-y-4 border">
              <Label className="text-blue-600">Thông tin sách</Label>
              <div className="grid grid-cols-2 gap-4">
                 <Input {...register('author')} placeholder="Tác giả" />
                 <Input {...register('publisher')} placeholder="Nhà xuất bản" />
              </div>
           </div>
        )}

        <div className="space-y-2">
          <Label>Mô tả chi tiết</Label>
          <Textarea {...register('description')} className="h-32" />
        </div>

        <div className="flex gap-4 pt-4">
           <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
           <Button type="submit" className="flex-1">Tạo sản phẩm</Button>
        </div>
      </form>
    </div>
  );
}