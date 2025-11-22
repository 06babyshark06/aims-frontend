'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!orderId || !amount) return;

    const generateQR = async () => {
      try {
        // API Endpoint 26: Generate VietQR
        // Backend sẽ trả về link ảnh QR hoặc base64
        const res = await api.post('/payment/vietqr/generate', {
          orderId: Number(orderId),
          amount: Number(amount),
          paymentMethod: 'QR_CODE'
        });
        
        if (res.data.success) {
          // Giả sử backend trả về qrCodeUrl trong data
          setQrUrl(res.data.data.qrCodeUrl || "https://via.placeholder.com/300?text=QR+Error");
        }
      } catch (error) {
        toast.error("Không thể tạo mã QR");
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [orderId, amount, toast]);

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    try {
      // API Endpoint 20: Confirm Order (Giả lập callback thành công)
      // Trong thực tế, bước này thường tự động qua Webhook, nhưng demo ta làm thủ công
      await api.post(`/orders/${orderId}/confirm`, {
        confirmed: true,
        transactionId: `TXN-${Date.now()}`
      });
      
      toast.success("Thanh toán thành công!");
      router.push('/payment/success');
    } catch (error) {
      toast.error("Xác nhận thất bại");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center mt-10">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Thanh toán VietQR</h1>
      <p className="text-gray-500 mb-6">Vui lòng quét mã bên dưới để thanh toán</p>

      {loading ? (
        <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-6">
          <div className="border-2 border-blue-100 rounded-lg p-2 inline-block">
            <img src={qrUrl} alt="VietQR Code" className="w-64 h-64 object-contain" />
          </div>
          
          <div className="bg-gray-50 p-4 rounded text-sm space-y-1">
            <div className="flex justify-between">
              <span>Đơn hàng:</span>
              <span className="font-bold">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền:</span>
              <span className="font-bold text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))}
              </span>
            </div>
          </div>

          <Button onClick={handleConfirmPayment} className="w-full bg-green-600 hover:bg-green-700 gap-2">
            <CheckCircle2 size={18} />
            Tôi đã chuyển khoản
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PaymentQRPage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />
      <Suspense fallback={<div className="text-center pt-20">Đang tải...</div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}