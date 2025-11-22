'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, FileText } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center mt-10">
      <div className="flex justify-center mb-4">
        <CheckCircle className="w-20 h-20 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
      <p className="text-gray-600 mb-6">
        Cảm ơn bạn đã mua hàng tại AIMS. <br />
        Mã đơn hàng của bạn là: <span className="font-bold text-black">#{orderId}</span>
      </p>

      <div className="space-y-3">
        <Link href="/orders/history" className="block">
          <Button variant="outline" className="w-full gap-2">
            <FileText size={18} /> Xem lịch sử đơn hàng
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Home size={18} /> Tiếp tục mua sắm
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <Suspense fallback={<div>Đang tải...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}