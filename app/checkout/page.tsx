'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DeliveryInfo, OrderCalculation } from '@/types';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { register, handleSubmit, getValues } = useForm<DeliveryInfo>();
  const [orderCalc, setOrderCalc] = useState<OrderCalculation | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('QR_CODE');
  const router = useRouter();

  const handleCalculateShipping = async () => {
    const data = getValues();
    if (!data.shippingCity || !data.shippingAddress) return;

    setLoadingCalc(true);
    try {
      // API Endpoint 17
      const res = await api.post('/orders/calculate-shipping', {
        ...data,
        // Giả định giá trị mặc định nếu form chưa điền hết để tránh lỗi backend
        customerName: data.customerName || "Guest",
        customerEmail: data.customerEmail || "guest@example.com",
        customerPhone: data.customerPhone || "0000000000"
      });
      if (res.data.success) {
        setOrderCalc(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi tính phí ship", error);
    } finally {
      setLoadingCalc(false);
    }
  };

  const onSubmit = async (data: DeliveryInfo) => {
    try {
      // API Endpoint 18: Place Order
      const res = await api.post('/orders', {
        deliveryInfo: data,
        paymentMethod: paymentMethod
      });

      if (res.data.success) {
        toast.success("Đặt hàng thành công!");
        const orderId = res.data.data.id;
        const amount = res.data.data.totalAmount;

        // Chuyển hướng tùy theo phương thức thanh toán
        if (paymentMethod === 'QR_CODE') {
           // Gọi API tạo QR code rồi chuyển trang hiển thị
           router.push(`/payment/qr?orderId=${orderId}&amount=${amount}`);
        } else {
           router.push(`/payment/success?orderId=${orderId}`);
        }
      }
    } catch (error) {
      toast.error("Vui lòng kiểm tra lại kho hàng");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thanh toán & Giao hàng</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Thông tin giao hàng */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Họ và tên</Label>
                <Input {...register('customerName', { required: true })} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register('customerEmail', { required: true })} type="email" />
              </div>
              <div>
                <Label>Số điện thoại</Label>
                <Input {...register('customerPhone', { required: true })} />
              </div>
              <div>
                <Label>Tỉnh / Thành phố</Label>
                <Input 
                  {...register('shippingCity', { required: true })} 
                  onBlur={handleCalculateShipping} 
                  placeholder="Hà Nội" 
                />
                <p className="text-xs text-gray-500 mt-1">Nhập thành phố để tính phí ship</p>
              </div>
              <div>
                <Label>Địa chỉ chi tiết</Label>
                <Input 
                  {...register('shippingAddress', { required: true })} 
                  onBlur={handleCalculateShipping}
                  placeholder="Số 1 Đại Cồ Việt" 
                />
              </div>
            </form>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 border p-4 rounded cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="QR_CODE" id="qr" />
                  <Label htmlFor="qr" className="cursor-pointer">Thanh toán qua VietQR (Momo/Bank)</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="PAYPAL" id="paypal" />
                  <Label htmlFor="paypal" className="cursor-pointer">Thanh toán qua PayPal</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Hóa đơn tạm tính */}
          <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
            
            {loadingCalc ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
            ) : orderCalc ? (
              <div className="space-y-3">
                {orderCalc.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.productTitle} (x{item.quantity})</span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <hr className="my-4" />
                <div className="flex justify-between">
                  <span>Tổng tiền hàng (chưa VAT):</span>
                  <span>{formatCurrency(orderCalc.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (10%):</span>
                  <span>{formatCurrency(orderCalc.vatAmount)}</span>
                </div>
                <div className="flex justify-between font-medium text-blue-600">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(orderCalc.shippingFee)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-xl text-red-600">
                  <span>Thành tiền:</span>
                  <span>{formatCurrency(orderCalc.totalAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Vui lòng nhập địa chỉ để xem phí ship và tổng tiền.
              </p>
            )}

            <Button 
              type="submit" 
              form="checkout-form" 
              className="w-full mt-6 text-lg py-6"
              disabled={!orderCalc}
            >
              Đặt hàng ngay
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}