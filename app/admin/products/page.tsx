'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Product, Page, ApiResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, Eye, Search, Loader2, History, Package, Filter, X, 
  RefreshCcw // Import thêm Icon RefreshCcw
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState({ page: 0, size: 20, totalPages: 1, totalElements: 0 });

  const [filters, setFilters] = useState({
    keyword: '',
    category: '', 
    status: 'ALL', 
    minPrice: '',
    maxPrice: ''
  });

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ productId: 0, quantity: 0, reason: '' });

  // 1. Fetch Products
  const fetchProducts = async (pageIndex = 0) => {
    setLoading(true);
    try {
      const params: any = { 
        page: pageIndex, 
        size: pagination.size,
        sortDirection: 'DESC',
        sortBy: 'id'
      };

      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.category) params.category = filters.category; 
      if (filters.status && filters.status !== 'ALL') {
          params.status = filters.status;
      }
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      
      const res = await api.get<ApiResponse<Page<Product>>>('/api/products/search', { params });
      
      if (res.data.errorCode === 'ER0000') {
        const data = res.data.data;
        setProducts(data.content);
        setPagination({
          page: data.number,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // 2. Xóa / Vô hiệu hóa
  const handleDelete = async (product: Product) => {
    let message = "Bạn chắc chắn muốn xóa sản phẩm này?";
    if (product.quantity > 0) {
        message = `Sản phẩm "${product.title}" VẪN CÒN HÀNG. Hệ thống sẽ chuyển sang trạng thái 'Ngừng kinh doanh' (DEACTIVATED). Bạn có chắc chắn không?`;
    }
    
    if (!confirm(message)) return;
    
    try {
      await api.delete(`/api/products/${product.id}`);
      toast.success("Thao tác thành công");
      fetchProducts(pagination.page);
    } catch (error: any) {
       const msg = error?.response?.data?.message || "Xóa thất bại";
       toast.error(msg);
    }
  };

  // --- 5. HÀM MỚI: KÍCH HOẠT LẠI SẢN PHẨM ---
  const handleActivate = async (product: Product) => {
    if (!confirm(`Bạn muốn mở bán lại sản phẩm "${product.title}"?`)) return;
    
    try {
        // Backend yêu cầu gửi đủ dữ liệu để validate (@Valid ProductDTO)
        // Nên ta lấy chi tiết sản phẩm trước rồi mới gửi update
        const detailRes = await api.get(`/api/products/${product.id}`);
        const fullProductData = detailRes.data.data;

        // Tạo payload mới với status là ACTIVE
        const payload = {
            ...fullProductData,
            status: 'ACTIVE'
        };

        // Gọi API Update
        await api.put(`/api/products/${product.id}`, payload);
        
        toast.success("Đã kích hoạt lại sản phẩm!");
        fetchProducts(pagination.page); // Reload danh sách
    } catch (error: any) {
        console.error(error);
        toast.error("Lỗi kích hoạt: " + (error?.response?.data?.message || "Không xác định"));
    }
  };
  // ------------------------------------------

  // 3. Xóa nhiều
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length > 10) {
        toast.error("Chỉ được xóa tối đa 10 sản phẩm cùng lúc");
        return;
    }
    if (!confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;

    try {
      await api.delete('/api/products/bulk', { data: selectedIds });
      toast.success(`Đã xử lý ${selectedIds.length} sản phẩm`);
      setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi xóa hàng loạt");
    }
  };

  // 4. Adjust Stock
  const handleAdjustStock = async () => {
    if (!stockForm.reason) {
        toast.error("Bắt buộc phải nhập lý do điều chỉnh");
        return;
    }
    try {
      const payload = {
          productId: stockForm.productId,
          adjustmentQuantity: Number(stockForm.quantity),
          reason: stockForm.reason
      };

      await api.post('/api/products/adjust-stock', payload);
      toast.success("Cập nhật tồn kho thành công");
      setStockModalOpen(false);
      fetchProducts(pagination.page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cập nhật tồn kho thất bại");
    }
  };

  // UI Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(0);
  };

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', status: 'ALL', minPrice: '', maxPrice: '' });
    setLoading(true);
    api.get<ApiResponse<Page<Product>>>('/api/products/search', { 
        params: { page: 0, size: 20, sortDirection: 'DESC', sortBy: 'id' } 
    }).then(res => {
        if (res.data.errorCode === 'ER0000') {
            setProducts(res.data.data.content);
            setPagination({ ...pagination, totalElements: res.data.data.totalElements });
        }
    }).finally(() => setLoading(false));
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case 'ACTIVE': return <Badge className="bg-green-600 hover:bg-green-700">Đang bán</Badge>;
          case 'DEACTIVATED': return <Badge variant="destructive">Ngừng KD</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) setSelectedIds([]);
    else setSelectedIds(products.map(p => p.id));
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const openStockModal = (product: Product) => {
      setStockForm({ productId: product.id, quantity: 0, reason: '' });
      setStockModalOpen(true);
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
           <p className="text-sm text-slate-500">Tổng: {pagination.totalElements} sản phẩm</p>
        </div>
        <div className="flex gap-2">
            {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 size={16} className="mr-2" /> Xóa ({selectedIds.length})
                </Button>
            )}
            <Link href="/admin/products/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus size={18} className="mr-2" /> Thêm mới
                </Button>
            </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
                <Label>Từ khóa</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Nhập tên sản phẩm..." 
                        className="pl-9"
                        value={filters.keyword}
                        onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                    />
                </div>
            </div>
            <div className="w-full md:w-[180px] space-y-1.5">
                <Label>Trạng thái</Label>
                <Select value={filters.status} onValueChange={(val) => setFilters({...filters, status: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả</SelectItem>
                        <SelectItem value="ACTIVE">Đang bán</SelectItem>
                        <SelectItem value="DEACTIVATED">Ngừng kinh doanh</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full md:w-[200px] space-y-1.5">
                <Label>Danh mục</Label>
                <Input placeholder="VD: Novel, Pop..." value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}/>
            </div>
            <div className="flex gap-2 w-full md:w-[200px]">
                <div className="space-y-1.5 flex-1"><Label>Giá từ</Label><Input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})}/></div>
                <div className="space-y-1.5 flex-1"><Label>Đến</Label><Input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}/></div>
            </div>
            <div className="flex gap-2">
                <Button type="submit" variant="default" className="gap-2"><Filter size={16} /> Lọc</Button>
                <Button type="button" variant="outline" onClick={clearFilters} title="Xóa bộ lọc"><X size={16} /></Button>
            </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-100">
            <TableRow>
              <TableHead className="w-[50px]"><Checkbox checked={products.length > 0 && selectedIds.length === products.length} onCheckedChange={toggleSelectAll}/></TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="animate-spin inline mr-2"/> Đang tải dữ liệu...</TableCell></TableRow>
            ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-32 text-center text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id} className={p.status === 'DEACTIVATED' ? 'bg-gray-50 opacity-60' : ''}>
                <TableCell><Checkbox checked={selectedIds.includes(p.id)} onCheckedChange={() => toggleSelectOne(p.id)}/></TableCell>
                <TableCell>
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-5">{p.category}</Badge>
                        <span className="text-xs text-gray-500 font-mono">{p.barcode}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="font-semibold text-red-600">{formatCurrency(p.currentPrice)}</div>
                    {p.originalValue > p.currentPrice && <div className="text-xs text-gray-400 line-through">{formatCurrency(p.originalValue)}</div>}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${p.quantity === 0 ? 'text-red-500' : 'text-slate-700'}`}>{p.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-slate-200" onClick={() => openStockModal(p)} title="Điều chỉnh tồn kho"><Package size={14} /></Button>
                    </div>
                </TableCell>
                <TableCell>{getStatusBadge(p.status)}</TableCell>
                
                {/* --- CỘT HÀNH ĐỘNG --- */}
                <TableCell className="text-right space-x-1">
                    <Link href={`/admin/products/${p.id}/history`}>
                        <Button variant="ghost" size="icon" title="Lịch sử thay đổi"><History size={16} /></Button>
                    </Link>
                    
                    <Link href={`/admin/products/${p.id}`}>
                        <Button variant="ghost" size="icon" title="Xem chi tiết"><Eye size={16} className="text-blue-600" /></Button>
                    </Link>

                    {/* Logic hiển thị nút: Nếu DEACTIVATED thì hiện nút Kích hoạt, ngược lại hiện nút Xóa */}
                    {p.status === 'DEACTIVATED' ? (
                        <Button 
                            variant="ghost" size="icon" 
                            onClick={() => handleActivate(p)} 
                            className="text-green-600 hover:bg-green-50"
                            title="Mở bán lại (Re-activate)"
                        >
                            <RefreshCcw size={16} />
                        </Button>
                    ) : (
                        <Button 
                            variant="ghost" size="icon" 
                            onClick={() => handleDelete(p)} 
                            className="text-red-600 hover:bg-red-50"
                            title="Ngừng kinh doanh / Xóa"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
            <span className="text-xs text-gray-500">Trang {pagination.page + 1} / {pagination.totalPages}</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={pagination.page === 0} onClick={() => fetchProducts(pagination.page - 1)}>Trước</Button>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages - 1} onClick={() => fetchProducts(pagination.page + 1)}>Sau</Button>
            </div>
        </div>
      </div>

      {/* Modal Adjust Stock */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Điều chỉnh tồn kho</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Số lượng thay đổi (+ nhập, - xuất)</Label>
                    <Input type="number" value={stockForm.quantity} onChange={(e) => setStockForm({...stockForm, quantity: Number(e.target.value)})}/>
                    <p className="text-xs text-gray-500">Ví dụ: 10 (thêm), -5 (giảm)</p>
                </div>
                <div className="space-y-2"><Label>Lý do (Bắt buộc)</Label><Input placeholder="Nhập lý do..." value={stockForm.reason} onChange={(e) => setStockForm({...stockForm, reason: e.target.value})}/></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setStockModalOpen(false)}>Hủy</Button><Button onClick={handleAdjustStock}>Lưu thay đổi</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}