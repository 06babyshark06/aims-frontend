'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu trả về từ API Create Payment
interface TransactionData {
  transactionId: string;
  providerTransactionId: string; // Cái này quan trọng để gọi callback
  orderId: number;
  paymentMethod: string;
  amount: number;
  qrString: string;
}

function VietQRContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Lấy orderId từ URL (do trang Checkout chuyển sang)
  const orderId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);

  // 1. Tự động gọi API tạo giao dịch khi vào trang
  useEffect(() => {
    if (!orderId) return;

    const createPayment = async () => {
      try {
        // API Create Transaction
        const res = await api.post('/api/v1/payments', { 
          orderId: Number(orderId) 
        });

        if (res.data?.errorCode === 'ER0000') {
          setTransaction(res.data.data);
        } else {
          toast.error(res.data?.message || "Không thể tạo giao dịch thanh toán");
        }
      } catch (error) {
        toast.error("Lỗi kết nối hệ thống thanh toán");
      } finally {
        setLoading(false);
      }
    };

    createPayment();
  }, [orderId]);

  // 2. Xử lý khi bấm nút "Tôi đã chuyển khoản" (Giả lập Callback)
  const handleConfirm = async () => {
    if (!transaction) return;
    setProcessing(true);

    try {
      // API Callback (Giả lập đối tác gọi lại)
      // Lưu ý: data gửi lên key là "transactionId" nhưng giá trị là "providerTransactionId" lấy từ bước trước
      const res = await api.post('/api/v1/payments/vietqr/callback', {
        transactionId: transaction.providerTransactionId
      });

      if (res.data?.errorCode === 'ER0000') {
        toast.success("Thanh toán thành công!");
        // Chuyển hướng về trang lịch sử hoặc trang thành công
        router.push('/orders/history');
      } else {
        toast.error("Giao dịch chưa được xác nhận. Vui lòng thử lại.");
      }
    } catch (error) {
      toast.error("Lỗi khi xác nhận thanh toán");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Đang khởi tạo giao dịch...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return <div className="p-10 text-center">Không tìm thấy thông tin giao dịch</div>;
  }

  // Link ảnh QR Code (Dùng link VietQR.io để hiển thị đẹp, thay vì chuỗi string mock)
  const qrImageUrl = `https://img.vietqr.io/image/MB-0000000000-compact.png?amount=${transaction.amount}&addInfo=ORDER ${transaction.orderId}`;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Header />
      <div className="container mx-auto py-10 px-4 flex justify-center">
        <Card className="w-full max-w-md p-6 bg-white shadow-xl text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">Thanh toán VietQR</h1>
          <p className="text-gray-500 mb-6">Mã giao dịch: {transaction.transactionId}</p>
          
          <div className="border-2 border-blue-100 rounded-lg p-2 inline-block mb-6 relative">
             <img src={qrImageUrl} alt="VietQR" className="w-64 h-64 object-contain" />
             {/* Overlay giả lập Mock */}
             <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs py-1 opacity-90">
                Mode: Sandbox Testing
             </div>
          </div>

          <div className="bg-gray-50 p-4 rounded text-sm space-y-2 mb-6 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-bold">#{transaction.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số tiền:</span>
              <span className="font-bold text-red-600 text-lg">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nội dung CK:</span>
              <span className="font-mono bg-white px-1 border rounded">ORDER {transaction.orderId}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4 text-xs flex gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>Vì đang chạy thử nghiệm (Mock), vui lòng bấm nút bên dưới để giả lập ngân hàng xác nhận đã nhận tiền.</p>
          </div>

          <Button 
            onClick={handleConfirm} 
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            disabled={processing}
          >
            {processing ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
            {processing ? "Đang xác nhận..." : "Xác nhận thanh toán"}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default function VietQRPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VietQRContent />
    </Suspense>
  );
}