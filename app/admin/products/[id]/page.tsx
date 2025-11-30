'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Edit, Trash2, Calendar, User, 
  BookOpen, Disc, Film, Newspaper, Clock, Hash, Globe 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Gọi API GET /api/products/{id}
        const res = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
        if (res.data.errorCode === 'ER0000') {
            setProduct(res.data.data);
        } else {
            toast.error("Lỗi: " + res.data.message);
        }
      } catch (error) {
        toast.error("Không tìm thấy sản phẩm");
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!product) return null;

  // Helper render dòng thông tin
  const InfoRow = ({ icon: Icon, label, value }: { icon?: any, label: string, value?: string | number | null }) => {
    if (!value) return null; // Không có dữ liệu thì ẩn luôn dòng này
    return (
        <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
            {Icon && <Icon className="w-4 h-4 text-gray-400 mt-1" />}
            <div className="flex-1">
                <span className="text-sm font-medium text-gray-500 block">{label}</span>
                <span className="text-sm text-gray-900 font-semibold">{value}</span>
            </div>
        </div>
    );
  };

  // Helper lấy icon theo loại (Fallback theo category nếu productType null)
  const getProductIcon = () => {
      const type = product.productType || product.category; // Fallback
      if (type?.toUpperCase().includes('BOOK')) return <BookOpen className="w-6 h-6" />;
      if (type?.toUpperCase().includes('CD')) return <Disc className="w-6 h-6" />;
      if (type?.toUpperCase().includes('DVD')) return <Film className="w-6 h-6" />;
      if (type?.toUpperCase().includes('BAO') || type?.toUpperCase().includes('NEWS')) return <Newspaper className="w-6 h-6" />;
      return <Hash className="w-6 h-6" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/admin/products">
                <Button variant="outline" size="icon"><ArrowLeft size={18}/></Button>
            </Link>
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    {getProductIcon()}
                    {product.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{product.category}</Badge>
                    <Badge className={product.status === 'ACTIVE' ? 'bg-green-600' : 'bg-red-600'}>
                        {product.status}
                    </Badge>
                    <span className="text-sm text-gray-500 font-mono">{product.barcode}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <Link href={`/admin/products/${id}/edit`}>
                <Button><Edit size={16} className="mr-2"/> Chỉnh sửa</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
        <div className="space-y-6 md:col-span-1">
            <Card>
                <CardHeader><CardTitle>Tổng quan</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                    <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-4">
                        <span className="text-gray-400 font-bold text-xl">{product.category}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-500">Giá bán</div>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(product.currentPrice)}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Giá gốc</div>
                        <div className="text-sm line-through">{formatCurrency(product.originalValue)}</div>
                    </div>
                    <Separator className="my-2"/>
                    <InfoRow label="Tồn kho" value={product.quantity} />
                    <InfoRow label="Tình trạng" value={product.isNew ? "Hàng mới" : "Đã sử dụng"} />
                    <InfoRow label="Màu sắc" value={product.primaryColor} />
                    <InfoRow label="Đổi trả" value={product.returnCondition} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Kích thước & Vận chuyển</CardTitle></CardHeader>
                <CardContent>
                    <InfoRow label="Cân nặng" value={`${product.weight} kg`} />
                    <InfoRow label="Kích thước (D x R x C)" value={`${product.length} x ${product.width} x ${product.height} cm`} />
                </CardContent>
            </Card>
        </div>

        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
        <div className="space-y-6 md:col-span-2">
            
            {/* THÔNG TIN CHI TIẾT (RENDER ĐỘNG) */}
            <Card>
                <CardHeader><CardTitle>Thông tin chi tiết</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                    {/* Các trường dùng chung cho Sách/Báo */}
                    <InfoRow icon={User} label="Tác giả / Nghệ sĩ / Đạo diễn / TBT" 
                        value={product.authors || product.artists || product.director || product.editorInChief} 
                    />
                    <InfoRow icon={Globe} label="Nhà xuất bản / Studio / Hãng đĩa" 
                        value={product.publisher || product.studio || product.recordLabel} 
                    />
                    
                    {/* Ngày tháng */}
                    <InfoRow icon={Calendar} label="Ngày xuất bản / Phát hành" 
                        value={product.publicationDate || product.releaseDate} 
                    />
                    
                    {/* Ngôn ngữ & Thể loại */}
                    <InfoRow icon={Globe} label="Ngôn ngữ" value={product.language} />
                    <InfoRow icon={Hash} label="Thể loại (Genre)" value={product.genre} />
                    
                    {/* Sách */}
                    <InfoRow icon={BookOpen} label="Loại bìa" value={product.coverType} />
                    <InfoRow icon={Hash} label="Số trang" value={product.numberOfPages} />
                    
                    {/* Báo (Newspaper) */}
                    <InfoRow icon={Clock} label="Tần suất phát hành" value={product.publicationFrequency} />
                    <InfoRow icon={Hash} label="Số phát hành" value={product.issueNumber} />
                    <InfoRow icon={Hash} label="ISSN" value={product.issn} />
                    <InfoRow icon={Newspaper} label="Chuyên mục" value={product.sections} />

                    {/* DVD */}
                    <InfoRow icon={Disc} label="Loại đĩa" value={product.discType} />
                    <InfoRow icon={Clock} label="Thời lượng" value={product.runtime ? `${product.runtime} phút` : null} />
                    <InfoRow icon={Globe} label="Phụ đề" value={product.subtitles} />
                </CardContent>
            </Card>

            {/* TRACK LIST (Dành riêng cho CD) */}
            {product.tracks && product.tracks.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Danh sách bài hát ({product.tracks.length})</CardTitle></CardHeader>
                    <CardContent>
                        <div className="border rounded-md divide-y">
                            {product.tracks.map((track) => (
                                <div key={track.id || track.trackNumber} className="flex justify-between p-3 hover:bg-gray-50">
                                    <div className="flex gap-3">
                                        <span className="font-mono text-gray-400 w-6">#{track.trackNumber}</span>
                                        <span className="font-medium">{track.title}</span>
                                    </div>
                                    <span className="text-gray-500 text-sm">{track.length} phút</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mô tả */}
            <Card>
                <CardHeader><CardTitle>Mô tả sản phẩm</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {product.description || "Chưa có mô tả."}
                    </p>
                </CardContent>
            </Card>

            {/* Meta Data */}
            <div className="text-xs text-gray-400 flex justify-between px-2">
                <span>Tạo bởi: {product.createdBy} lúc {product.createdAt && format(new Date(product.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                <span>Cập nhật lần cuối: {product.updatedAt && format(new Date(product.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
            </div>
        </div>
      </div>
    </div>
  );
}