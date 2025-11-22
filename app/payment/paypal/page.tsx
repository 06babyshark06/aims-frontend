'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

function PayPalContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount'); // Giá trị tiền
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setProcessing(true);
    try {
      // Bước 1: Gọi API tạo PayPal Order (Endpoint 28 trong ApiDoc)
      // Backend Java sẽ giao tiếp với PayPal server thật và trả về link approve
      const createRes = await api.post('/payment/paypal/create', {
        orderId: Number(orderId),
        amount: Number(amount),
        paymentMethod: 'PAYPAL'
      });

      // DEMO: Vì ta không có sandbox thật ở đây, ta giả lập thành công sau 2 giây
      // Nếu làm thật: window.location.href = createRes.data.approvalLink;
      
      setTimeout(async () => {
        // Bước 2: Giả lập PayPal gọi callback về (Endpoint 29)
        // Thực tế: PayPal sẽ redirect user về trang /payment/paypal/callback
        
        await api.post(`/orders/${orderId}/confirm`, {
            confirmed: true,
            transactionId: `PAYPAL-${Date.now()}`
        });

        toast.success("Thanh toán PayPal thành công!" );
        router.push(`/payment/success?orderId=${orderId}`);
      }, 2000);

    } catch (error) {
      toast.error("Giao dịch bị từ chối bởi PayPal");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <Card>
        <CardHeader className="text-center border-b bg-blue-50">
          <div className="mx-auto bg-white p-2 rounded-full w-fit mb-2">
             {/* Logo PayPal giả lập bằng text hoặc icon */}
             <span className="text-blue-800 font-bold italic text-2xl">PayPal</span>
          </div>
          <CardTitle className="text-blue-900">Cổng thanh toán an toàn</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-500">Đang thanh toán cho đơn hàng</p>
            <p className="text-2xl font-bold">#{orderId}</p>
            <div className="text-3xl font-bold text-blue-600 mt-4">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-100 flex gap-2 text-sm text-yellow-800">
            <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
            <p>Bạn đang sử dụng môi trường Sandbox. Tiền sẽ không bị trừ thật.</p>
          </div>

          <Button 
            className="w-full h-12 text-lg bg-[#0070BA] hover:bg-[#003087]" 
            onClick={handlePayPalPayment}
            disabled={processing}
          >
            {processing ? (
              <><Loader2 className="animate-spin mr-2" /> Đang xử lý...</>
            ) : (
              <><CreditCard className="mr-2" /> Thanh toán ngay</>
            )}
          </Button>
          
          <Button variant="ghost" className="w-full" onClick={() => router.back()} disabled={processing}>
            Hủy giao dịch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PayPalPage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />
      <Suspense fallback={<div className="text-center pt-20">Đang tải cổng thanh toán...</div>}>
        <PayPalContent />
      </Suspense>
    </div>
  );
}