'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('VIETQR'); // Mặc định theo API: VIETQR

  const { register, handleSubmit } = useForm<CheckoutForm>();

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      // 1. Chuẩn bị dữ liệu đúng y hệt cấu trúc JSON API yêu cầu
      const payload = {
        deliveryInfo: {
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity
        },
        paymentMethod: paymentMethod // Giá trị: "VIETQR" hoặc "PAYPAL"
      };

      // 2. Gọi API Place Order
      const res = await api.post('/api/v1/orders', payload);

      // 3. Xử lý dữ liệu trả về để đưa sang trang khác
      if (res.data?.errorCode === 'ER0000') {
        const orderData = res.data.data;
        
        // Lấy các dữ liệu quan trọng từ response để gửi đi
        const orderId = orderData.id;
        const amount = orderData.totalAmount; // API trả về totalAmount
        const orderNumber = orderData.orderNumber;

        toast.success(`Đặt hàng thành công! Mã: ${orderNumber}`);

        // 4. Chuyển hướng sang trang Thanh toán và "mang theo" dữ liệu qua URL
        if (paymentMethod === 'VIETQR') {
           router.push(`/payment/vietqr?id=${orderId}&amount=${amount}&code=${orderNumber}`);
        } else {
           router.push(`/payment/paypal?id=${orderId}&amount=${amount}&code=${orderNumber}`);
        }
      } else {
        toast.error(res.data?.message || "Đặt hàng thất bại");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi hệ thống hoặc phiên đăng nhập hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Thông tin giao hàng</h1>
        <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Họ tên</Label>
                    <Input {...register('customerName')} placeholder="Nguyễn Văn A" required />
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input {...register('customerPhone')} placeholder="0987654321" required />
                  </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <Input {...register('customerEmail')} type="email" placeholder="email@example.com" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tỉnh/Thành phố</Label>
                    <Input {...register('shippingCity')} placeholder="Hanoi" required />
                  </div>
                  <div>
                    <Label>Địa chỉ chi tiết</Label>
                    <Input {...register('shippingAddress')} placeholder="Số 1 Đại Cồ Việt" required />
                  </div>
              </div>

              <div className="mt-6">
                <Label className="text-base font-semibold">Phương thức thanh toán</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-blue-50">
                    <RadioGroupItem value="VIETQR" id="vietqr" />
                    <Label htmlFor="vietqr" className="cursor-pointer font-normal">Thanh toán qua VietQR (App Ngân hàng)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-blue-50">
                    <RadioGroupItem value="PAYPAL" id="paypal" />
                    <Label htmlFor="paypal" className="cursor-pointer font-normal">Thanh toán quốc tế (PayPal)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full mt-6 h-12 text-lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Xác nhận đặt hàng"}
              </Button>
            </form>
        </div>
      </main>
    </div>
  );
}