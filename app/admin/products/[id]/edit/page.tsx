'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProductDTO } from '@/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<CreateProductDTO>({
    title: '', barcode: '', category: '', productType: 'BOOK',
    originalValue: 0, currentPrice: 0, quantity: 0,
    weight: 0, height: 0, width: 0, length: 0,
    description: '',
    isNew: true, primaryColor: '', returnCondition: '',
    
    // Optional fields (khởi tạo rỗng để tránh uncontrolled input)
    authors: '', publisher: '', language: '', coverType: '',
    artists: '', recordLabel: '', tracks: [],
    director: '', discType: '', studio: '', subtitles: '',
    editorInChief: '', publicationFrequency: '', issueNumber: '', issn: '', sections: '',
    publicationDate: '', releaseDate: '', genre: '', runtime: 0
  });

  // State riêng cho Tracks của CD
  const [tracks, setTracks] = useState<{ title: string; length: number; trackNumber: number }[]>([]);

  // 1. LOAD DỮ LIỆU CŨ
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        // Backend trả về: { errorCode: "ER0000", data: { ... } }
        const data = res.data.data || res.data; 
        
        // Populate form
        setFormData({
            ...data,
            // Đảm bảo boolean/date đúng định dạng
            isNew: data.isNew !== undefined ? data.isNew : true,
            publicationDate: data.publicationDate || '',
            releaseDate: data.releaseDate || ''
        });

        // Nếu là CD, load tracks riêng vào state
        if (data.productType === 'CD' && data.tracks) {
            setTracks(data.tracks);
        }
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải thông tin sản phẩm");
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, router]);

  // --- HANDLERS ---
  const handleChange = (field: keyof CreateProductDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Logic Track (CD)
  const addTrack = () => setTracks([...tracks, { title: '', length: 0, trackNumber: tracks.length + 1 }]);
  
  const updateTrack = (index: number, field: 'title' | 'length', val: any) => {
    const newTracks = [...tracks];
    // @ts-ignore
    newTracks[index][field] = val;
    setTracks(newTracks);
  };

  const removeTrack = (index: number) => {
    const filtered = tracks.filter((_, i) => i !== index);
    // Re-index track number
    const reindexed = filtered.map((t, i) => ({ ...t, trackNumber: i + 1 }));
    setTracks(reindexed);
  };

  // 2. SUBMIT UPDATE (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate Giá (30% - 150%)
    const minPrice = formData.originalValue * 0.3;
    const maxPrice = formData.originalValue * 1.5;
    if (formData.currentPrice < minPrice || formData.currentPrice > maxPrice) {
      toast.error(`Giá bán phải từ ${minPrice} đến ${maxPrice} (30%-150% giá nhập)`);
      setSubmitting(false);
      return;
    }

    try {
      // 2.1. Payload Chung
      const commonFields = {
        title: formData.title,
        barcode: formData.barcode,
        category: formData.category,
        productType: formData.productType,
        originalValue: formData.originalValue,
        currentPrice: formData.currentPrice,
        quantity: formData.quantity,
        weight: formData.weight,
        height: formData.height,
        width: formData.width,
        length: formData.length,
        description: formData.description,
        isNew: formData.isNew,
        primaryColor: formData.primaryColor,
        returnCondition: formData.returnCondition
      };

      // 2.2. Payload Riêng (Lọc trường rác)
      let specificPayload = {};
      switch (formData.productType) {
        case 'BOOK':
          specificPayload = {
            authors: formData.authors,
            publisher: formData.publisher,
            coverType: formData.coverType,
            publicationDate: formData.publicationDate,
            numberOfPages: formData.numberOfPages,
            language: formData.language,
            genre: formData.genre
          };
          break;
        case 'CD':
          specificPayload = {
            artists: formData.artists,
            recordLabel: formData.recordLabel,
            genre: formData.genre,
            releaseDate: formData.releaseDate,
            tracks: tracks // Gửi danh sách tracks mới nhất
          };
          break;
        case 'DVD':
          specificPayload = {
            director: formData.director,
            discType: formData.discType,
            runtime: formData.runtime,
            studio: formData.studio,
            subtitles: formData.subtitles,
            genre: formData.genre,
            releaseDate: formData.releaseDate,
            language: formData.language
          };
          break;
        case 'NEWSPAPER':
          specificPayload = {
            editorInChief: formData.editorInChief,
            publisher: formData.publisher,
            publicationDate: formData.publicationDate,
            issueNumber: formData.issueNumber,
            publicationFrequency: formData.publicationFrequency,
            issn: formData.issn,
            language: formData.language,
            sections: formData.sections
          };
          break;
      }

      const finalPayload = { ...commonFields, ...specificPayload };

      // Gọi API PUT
      await api.put(`/api/products/${id}`, finalPayload);
      
      toast.success("Cập nhật sản phẩm thành công!");
      router.push('/admin/products');
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "Lỗi khi cập nhật";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDER UI SECTIONS ---

  const renderBookFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Tác giả</Label><Input value={formData.authors} onChange={e => handleChange('authors', e.target.value)} /></div>
      <div className="space-y-2"><Label>Nhà xuất bản</Label><Input value={formData.publisher} onChange={e => handleChange('publisher', e.target.value)} /></div>
      <div className="space-y-2"><Label>Loại bìa</Label>
        <Select value={formData.coverType} onValueChange={v => handleChange('coverType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="PAPERBACK">Paperback</SelectItem><SelectItem value="HARDCOVER">Hardcover</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Ngày xuất bản</Label><Input type="date" value={formData.publicationDate} onChange={e => handleChange('publicationDate', e.target.value)} /></div>
      <div className="space-y-2"><Label>Số trang</Label><Input type="number" value={formData.numberOfPages} onChange={e => handleChange('numberOfPages', Number(e.target.value))} /></div>
      <div className="space-y-2"><Label>Ngôn ngữ</Label><Input value={formData.language} onChange={e => handleChange('language', e.target.value)} /></div>
      <div className="space-y-2"><Label>Thể loại</Label><Input value={formData.genre} onChange={e => handleChange('genre', e.target.value)} /></div>
    </div>
  );

  const renderCDFields = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nghệ sĩ</Label><Input value={formData.artists} onChange={e => handleChange('artists', e.target.value)} /></div>
            <div className="space-y-2"><Label>Hãng thu âm</Label><Input value={formData.recordLabel} onChange={e => handleChange('recordLabel', e.target.value)} /></div>
            <div className="space-y-2"><Label>Thể loại</Label><Input value={formData.genre} onChange={e => handleChange('genre', e.target.value)} /></div>
            <div className="space-y-2"><Label>Ngày phát hành</Label><Input type="date" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} /></div>
        </div>
        {/* Tracklist UI */}
        <div className="border rounded-md p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center"><Label className="font-bold">Danh sách bài hát</Label><span className="text-xs bg-gray-200 px-2 rounded-full">{tracks.length}</span></div>
                <Button type="button" size="sm" variant="secondary" onClick={addTrack}><Plus size={14}/> Thêm bài</Button>
            </div>
            {tracks.map((track, idx) => (
                <div key={idx} className="flex gap-2 items-end mb-2">
                    <span className="w-8 text-center pb-2 font-bold text-gray-400">#{track.trackNumber}</span>
                    <Input className="flex-1" placeholder="Tên bài" value={track.title} onChange={e => updateTrack(idx, 'title', e.target.value)} />
                    <Input className="w-24" type="number" placeholder="Giây" value={track.length} onChange={e => updateTrack(idx, 'length', Number(e.target.value))} />
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeTrack(idx)}><Trash size={16}/></Button>
                </div>
            ))}
            {tracks.length === 0 && <p className="text-center text-sm text-gray-400 py-2">Chưa có bài hát nào</p>}
        </div>
    </div>
  );

  const renderDVDFields = () => (
    <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Đạo diễn</Label><Input value={formData.director} onChange={e => handleChange('director', e.target.value)} /></div>
        <div className="space-y-2"><Label>Studio</Label><Input value={formData.studio} onChange={e => handleChange('studio', e.target.value)} /></div>
        <div className="space-y-2"><Label>Loại đĩa</Label>
            <Select value={formData.discType} onValueChange={v => handleChange('discType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="DVD">DVD</SelectItem><SelectItem value="BLURAY">Blu-ray</SelectItem><SelectItem value="HD_DVD">HD-DVD</SelectItem></SelectContent>
            </Select>
        </div>
        <div className="space-y-2"><Label>Thời lượng (phút)</Label><Input type="number" value={formData.runtime} onChange={e => handleChange('runtime', Number(e.target.value))} /></div>
        <div className="space-y-2"><Label>Ngôn ngữ</Label><Input value={formData.language} onChange={e => handleChange('language', e.target.value)} /></div>
        <div className="space-y-2"><Label>Phụ đề</Label><Input value={formData.subtitles} onChange={e => handleChange('subtitles', e.target.value)} /></div>
        <div className="space-y-2"><Label>Thể loại</Label><Input value={formData.genre} onChange={e => handleChange('genre', e.target.value)} /></div>
        <div className="space-y-2"><Label>Ngày phát hành</Label><Input type="date" value={formData.releaseDate} onChange={e => handleChange('releaseDate', e.target.value)} /></div>
    </div>
  );

  const renderNewspaperFields = () => (
    <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Tổng biên tập</Label><Input value={formData.editorInChief} onChange={e => handleChange('editorInChief', e.target.value)} /></div>
        <div className="space-y-2"><Label>Nhà xuất bản</Label><Input value={formData.publisher} onChange={e => handleChange('publisher', e.target.value)} /></div>
        <div className="space-y-2"><Label>Ngày phát hành</Label><Input type="date" value={formData.publicationDate} onChange={e => handleChange('publicationDate', e.target.value)} /></div>
        <div className="space-y-2"><Label>Tần suất</Label><Input value={formData.publicationFrequency} onChange={e => handleChange('publicationFrequency', e.target.value)} /></div>
        <div className="space-y-2"><Label>Số phát hành</Label><Input value={formData.issueNumber} onChange={e => handleChange('issueNumber', e.target.value)} /></div>
        <div className="space-y-2"><Label>ISSN</Label><Input value={formData.issn} onChange={e => handleChange('issn', e.target.value)} /></div>
        <div className="space-y-2"><Label>Ngôn ngữ</Label><Input value={formData.language} onChange={e => handleChange('language', e.target.value)} /></div>
        <div className="space-y-2"><Label>Chuyên mục</Label><Input value={formData.sections} onChange={e => handleChange('sections', e.target.value)} /></div>
    </div>
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
            <Button variant="outline" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm #{id}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. THÔNG TIN CƠ BẢN */}
        <Card>
            <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Read-only: Định danh */}
                <div className="space-y-2">
                    <Label className="text-gray-500">Loại sản phẩm (Read-only)</Label>
                    <Input disabled value={formData.productType} className="bg-gray-100 font-bold" />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-500">Mã vạch (Read-only)</Label>
                    <Input disabled value={formData.barcode} className="bg-gray-100" />
                </div>

                {/* Editable */}
                <div className="space-y-2 col-span-2">
                    <Label>Tên sản phẩm *</Label>
                    <Input required value={formData.title} onChange={e => handleChange('title', e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Danh mục (Category)</Label>
                    <Input value={formData.category} onChange={e => handleChange('category', e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Tồn kho</Label>
                    <Input type="number" value={formData.quantity} onChange={e => handleChange('quantity', Number(e.target.value))} />
                </div>

                <div className="space-y-2">
                    <Label>Giá nhập</Label>
                    <Input type="number" value={formData.originalValue} onChange={e => handleChange('originalValue', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label>Giá bán</Label>
                    <Input type="number" value={formData.currentPrice} onChange={e => handleChange('currentPrice', Number(e.target.value))} />
                </div>

                {/* Kích thước */}
                <div className="grid grid-cols-4 gap-2 col-span-2 bg-gray-50 p-2 rounded border">
                    <div className="space-y-1"><Label className="text-xs">Nặng (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={e => handleChange('weight', Number(e.target.value))} /></div>
                    <div className="space-y-1"><Label className="text-xs">Dài (cm)</Label><Input type="number" step="0.1" value={formData.length} onChange={e => handleChange('length', Number(e.target.value))} /></div>
                    <div className="space-y-1"><Label className="text-xs">Rộng (cm)</Label><Input type="number" step="0.1" value={formData.width} onChange={e => handleChange('width', Number(e.target.value))} /></div>
                    <div className="space-y-1"><Label className="text-xs">Cao (cm)</Label><Input type="number" step="0.1" value={formData.height} onChange={e => handleChange('height', Number(e.target.value))} /></div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-2 col-span-2">
                    <div className="space-y-2">
                        <Label>Tình trạng</Label>
                        <Select value={formData.isNew ? "true" : "false"} onValueChange={(val) => handleChange('isNew', val === 'true')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="true">Mới</SelectItem><SelectItem value="false">Cũ</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2"><Label>Màu sắc</Label><Input value={formData.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Đổi trả</Label><Input value={formData.returnCondition} onChange={e => handleChange('returnCondition', e.target.value)} /></div>
                </div>

                <div className="col-span-2 space-y-2">
                    <Label>Mô tả</Label>
                    <Textarea rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                </div>
            </CardContent>
        </Card>

        {/* 2. THÔNG TIN CHI TIẾT (DYNAMIC RENDER) */}
        <Card>
            <CardHeader><CardTitle>Thông tin chi tiết ({formData.productType})</CardTitle></CardHeader>
            <CardContent>
                {formData.productType === 'BOOK' && renderBookFields()}
                {formData.productType === 'CD' && renderCDFields()}
                {formData.productType === 'DVD' && renderDVDFields()}
                {formData.productType === 'NEWSPAPER' && renderNewspaperFields()}
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pb-10">
            <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
            <Button type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? <Loader2 className="animate-spin mr-2" /> : <><Save size={18} className="mr-2"/> Lưu thay đổi</>}
            </Button>
        </div>
      </form>
    </div>
  );
}