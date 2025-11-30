'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ArrowLeft, Clock, Activity, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ProductHistory {
  id: number;
  actionType: 'ADDED' | 'UPDATED' | 'DELETED' | 'STOCK_ADJUSTED';
  actionDate: string;
  performedBy: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  // product: ... (Không cần thiết hiển thị ở list)
}

export default function ProductHistoryPage() {
  const params = useParams();
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/products/${params.id}/history`);
        // Kiểm tra cấu trúc ApiResponse
        if (res.data && Array.isArray(res.data.data)) {
            setHistory(res.data.data);
        } else if (Array.isArray(res.data)) {
            setHistory(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchHistory();
  }, [params.id]);

  // Helper để tô màu Badge theo ActionType
  const getActionBadge = (type: string) => {
    switch (type) {
        case 'ADDED': return <Badge className="bg-green-600 hover:bg-green-700">Tạo mới</Badge>;
        case 'UPDATED': return <Badge className="bg-blue-600 hover:bg-blue-700">Cập nhật</Badge>;
        case 'DELETED': return <Badge variant="destructive">Xóa</Badge>;
        case 'STOCK_ADJUSTED': return <Badge variant="secondary">Kho hàng</Badge>;
        default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Helper để format chuỗi value dài dòng (Java toString)
  const formatValue = (val?: string) => {
      if (!val) return <span className="text-gray-400 italic">Không có dữ liệu</span>;
      
      // Nếu chuỗi quá dài (như toString của Entity), ta cắt bớt hoặc hiển thị trong thẻ code
      // Trong ví dụ của bạn: "CDEntity(artists=An...)"
      return (
          <div className="bg-slate-50 p-2 rounded text-xs font-mono border text-wrap break-all max-h-32 overflow-y-auto">
              {val}
          </div>
      );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
            <Button variant="outline" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-600" />
                Lịch sử hoạt động
            </h1>
            <p className="text-sm text-gray-500">Sản phẩm #{params.id}</p>
        </div>
      </div>

      {/* Timeline List */}
      <Card>
        <CardHeader><CardTitle>Nhật ký thay đổi ({history.length})</CardTitle></CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[180px]">Thời gian</TableHead>
                        <TableHead className="w-[150px]">Người thực hiện</TableHead>
                        <TableHead className="w-[120px]">Hành động</TableHead>
                        <TableHead>Chi tiết thay đổi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8">Đang tải...</TableCell></TableRow>
                    ) : history.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Chưa có lịch sử nào.</TableCell></TableRow>
                    ) : (
                        history.map((log) => (
                            <TableRow key={log.id} className="align-top">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                            {format(new Date(log.actionDate), 'dd/MM/yyyy')}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(log.actionDate), 'HH:mm:ss')}
                                        </span>
                                    </div>
                                </TableCell>
                                
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-gray-400" />
                                        <span className="font-medium">{log.performedBy}</span>
                                    </div>
                                </TableCell>
                                
                                <TableCell>
                                    {getActionBadge(log.actionType)}
                                </TableCell>
                                
                                <TableCell>
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-800">{log.description}</p>
                                        
                                        {/* Hiển thị diff: Cũ -> Mới (Nếu là Update) */}
                                        {log.actionType === 'UPDATED' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-red-500 mb-1 block">Dữ liệu cũ</span>
                                                    {formatValue(log.oldValue)}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-green-600 mb-1 block">Dữ liệu mới</span>
                                                    {formatValue(log.newValue)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nếu là ADDED: Chỉ hiện New Value */}
                                        {log.actionType === 'ADDED' && (
                                            <div className="mt-2">
                                                <span className="text-[10px] uppercase font-bold text-green-600 mb-1 block">Dữ liệu khởi tạo</span>
                                                {formatValue(log.newValue)}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}