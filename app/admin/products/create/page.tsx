'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, Plus, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProductDTO } from '@/types';

const initialForm: CreateProductDTO = {
  title: '', barcode: '', category: '', productType: 'BOOK',
  originalValue: 0, currentPrice: 0, quantity: 0,
  weight: 0, height: 0, width: 0, length: 0,
  description: '',
  isNew: true, primaryColor: 'Multi', returnCondition: 'New',

  authors: '', publisher: '', language: '', coverType: 'PAPERBACK',
  artists: '', recordLabel: '', tracks: [],
  director: '', discType: 'DVD', studio: '', subtitles: '',
  editorInChief: '', publicationFrequency: 'Daily',
  publicationDate: '', releaseDate: '', genre: '',issn: '', sections: ''
};

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProductDTO>(initialForm);
  const [tracks, setTracks] = useState<{ title: string; length: number; trackNumber: number }[]>([]);

  const handleChange = (field: keyof CreateProductDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTrack = () => {
    setTracks([
      ...tracks,
      { title: '', length: 0, trackNumber: tracks.length + 1 }
    ]);
  };
  const updateTrack = (index: number, field: 'title' | 'length', val: any) => {
    const newTracks = [...tracks];
    // @ts-ignore
    newTracks[index][field] = val;
    setTracks(newTracks);
  };
  const removeTrack = (index: number) => {
    const filtered = tracks.filter((_, i) => i !== index);
    const reindexed = filtered.map((t, i) => ({ ...t, trackNumber: i + 1 }));
    setTracks(reindexed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validate Giá
    const minPrice = formData.originalValue * 0.3;
    const maxPrice = formData.originalValue * 1.5;
    if (formData.currentPrice < minPrice || formData.currentPrice > maxPrice) {
      toast.error(`Giá bán phải từ ${minPrice} đến ${maxPrice} (30%-150% giá nhập)`);
      setLoading(false);
      return;
    }

    try {
      // 2. TẠO PAYLOAD SẠCH (Quan trọng để khớp với @JsonTypeInfo backend)

      // Lấy các trường chung nhất
      const commonFields = {
        title: formData.title,
        barcode: formData.barcode,
        category: formData.category, // Input category
        productType: formData.productType, // Quan trọng: Jackson dùng field này để phân loại
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

      let specificPayload = {};

      // Chỉ ghép thêm các trường của đúng loại đó
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
            tracks: tracks
          };
          break;

        case 'DVD':
          specificPayload = {
            director: formData.director,
            discType: formData.discType,
            runtime: formData.runtime,
            studio: formData.studio,
            subtitles: formData.subtitles,
            language: formData.language,
            genre: formData.genre,
            releaseDate: formData.releaseDate
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

      // Gộp lại thành payload cuối cùng
      const finalPayload = { ...commonFields, ...specificPayload };

      console.log("Sending Payload:", finalPayload); // Debug xem gửi gì

      await api.post('/api/products', finalPayload);
      toast.success("Thêm sản phẩm thành công!");
      router.push('/admin/products');
    } catch (error: any) {
      console.error(error);
      // Hiển thị lỗi chi tiết từ Backend trả về
      const msg = error?.response?.data?.message || JSON.stringify(error?.response?.data) || "Lỗi hệ thống";
      toast.error("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER SECTIONS (Giữ nguyên phần UI Render bên dưới) ---
  const renderBookFields = () => (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="space-y-2">
        <Label>Tác giả</Label>
        <Input required value={formData.authors} onChange={e => handleChange('authors', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Nhà xuất bản</Label>
        <Input required value={formData.publisher} onChange={e => handleChange('publisher', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Loại bìa</Label>
        <Select value={formData.coverType} onValueChange={v => handleChange('coverType', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PAPERBACK">Bìa mềm (Paperback)</SelectItem>
            <SelectItem value="HARDCOVER">Bìa cứng (Hardcover)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ngày xuất bản</Label>
        <Input type="date" onChange={e => handleChange('publicationDate', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Số trang</Label>
        <Input type="number" onChange={e => handleChange('numberOfPages', Number(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Ngôn ngữ</Label>
        <Input value={formData.language} onChange={e => handleChange('language', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Thể loại (Genre)</Label>
        <Input value={formData.genre} onChange={e => handleChange('genre', e.target.value)} />
      </div>
    </div>
  );

  const renderDVDFields = () => (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Cột 1 */}
      <div className="space-y-2">
        <Label>Đạo diễn *</Label>
        <Input required value={formData.director} onChange={e => handleChange('director', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Studio *</Label>
        <Input required value={formData.studio} onChange={e => handleChange('studio', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Loại đĩa (Disc Type) *</Label>
        <Select value={formData.discType} onValueChange={v => handleChange('discType', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="DVD">DVD</SelectItem>
            <SelectItem value="BLURAY">Blu-ray</SelectItem>
            <SelectItem value="HD_DVD">HD-DVD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Thời lượng (phút) *</Label>
        <Input
          type="number"
          placeholder="VD: 120"
          required
          value={formData.runtime}
          onChange={e => handleChange('runtime', Number(e.target.value))}
        />
      </div>

      {/* Cột 2 */}
      <div className="space-y-2">
        <Label>Ngôn ngữ (Language) *</Label>
        <Input required value={formData.language} onChange={e => handleChange('language', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Phụ đề (Subtitles) *</Label>
        <Input required placeholder="VD: Viet, Eng..." value={formData.subtitles} onChange={e => handleChange('subtitles', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Thể loại (Genre)</Label>
        <Input value={formData.genre} onChange={e => handleChange('genre', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Ngày phát hành</Label>
        <Input type="date" onChange={e => handleChange('releaseDate', e.target.value)} />
      </div>
    </div>
  );

  const renderCDFields = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nghệ sĩ *</Label>
          <Input required value={formData.artists} onChange={e => handleChange('artists', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Hãng thu âm *</Label>
          <Input required value={formData.recordLabel} onChange={e => handleChange('recordLabel', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Thể loại (Genre) *</Label>
          <Input required value={formData.genre} onChange={e => handleChange('genre', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Ngày phát hành</Label>
          <Input type="date" onChange={e => handleChange('releaseDate', e.target.value)} />
        </div>
      </div>

      {/* Tracklist UI */}
      <div className="border rounded-md p-4 bg-slate-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Label className="font-bold text-base">Danh sách bài hát</Label>
            <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full font-mono">
              {tracks.length} bài
            </span>
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={addTrack} className="gap-1">
            <Plus size={14} /> Thêm bài hát
          </Button>
        </div>

        <div className="space-y-2">
          {tracks.map((track, idx) => (
            <div key={idx} className="flex gap-3 items-end bg-white p-2 rounded border shadow-sm">
              {/* Track Number (Read-only) */}
              <div className="w-10 text-center pb-2 font-mono font-bold text-slate-400">
                #{track.trackNumber}
              </div>

              <div className="flex-1 space-y-1">
                <Label className="text-xs text-slate-500">Tên bài hát</Label>
                <Input
                  placeholder="Nhập tên bài..."
                  value={track.title}
                  onChange={e => updateTrack(idx, 'title', e.target.value)}
                />
              </div>

              <div className="w-[100px] space-y-1">
                <Label className="text-xs text-slate-500">Độ dài (giây)</Label>
                <Input
                  type="number"
                  min="0"
                  value={track.length}
                  onChange={e => updateTrack(idx, 'length', Number(e.target.value))}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => removeTrack(idx)}
                tabIndex={-1}
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}

          {tracks.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
              <p>Chưa có bài hát nào trong đĩa CD này.</p>
              <Button type="button" variant="link" onClick={addTrack}>Thêm bài đầu tiên</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderNewspaperFields = () => (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Cột 1 */}
      <div className="space-y-2">
        <Label>Tổng biên tập (Editor-in-chief) *</Label>
        <Input required value={formData.editorInChief} onChange={e => handleChange('editorInChief', e.target.value)} />
      </div>
      
      <div className="space-y-2">
        <Label>Nhà xuất bản (Publisher) *</Label>
        <Input required value={formData.publisher} onChange={e => handleChange('publisher', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Ngày phát hành *</Label>
        <Input type="date" required value={formData.publicationDate} onChange={e => handleChange('publicationDate', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Tần suất phát hành</Label>
        <Input 
            placeholder="VD: Daily, Weekly..." 
            value={formData.publicationFrequency} 
            onChange={e => handleChange('publicationFrequency', e.target.value)} 
        />
      </div>

      {/* Cột 2 */}
      <div className="space-y-2">
        <Label>Số phát hành (Issue Number)</Label>
        <Input 
            placeholder="VD: 145/2025" 
            value={formData.issueNumber} 
            onChange={e => handleChange('issueNumber', e.target.value)} 
        />
      </div>

      <div className="space-y-2">
        <Label>Mã ISSN</Label>
        <Input placeholder="VD: 1234-5678" value={formData.issn} onChange={e => handleChange('issn', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Ngôn ngữ</Label>
        <Input value={formData.language} onChange={e => handleChange('language', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Chuyên mục (Sections)</Label>
        <Input 
            placeholder="VD: Thể thao, Kinh tế, Xã hội..." 
            value={formData.sections} 
            onChange={e => handleChange('sections', e.target.value)} 
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon"><ArrowLeft size={18} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. THÔNG TIN CHUNG */}
        <Card>
          <CardHeader><CardTitle>Thông tin cơ bản</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input required value={formData.title} onChange={e => handleChange('title', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Loại sản phẩm</Label>
              <Select
                value={formData.productType}
                onValueChange={(val: any) => {
                  handleChange('productType', val);
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOK">Sách (Book)</SelectItem>
                  <SelectItem value="CD">Đĩa CD</SelectItem>
                  <SelectItem value="DVD">Đĩa DVD</SelectItem>
                  <SelectItem value="NEWSPAPER">Báo chí (Newspaper)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input Category tự nhập */}
            <div className="space-y-2">
              <Label>Danh mục (Category) *</Label>
              <Input
                required
                placeholder="VD: Action, Education, Novel..."
                value={formData.category}
                onChange={e => handleChange('category', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mã vạch (Barcode) *</Label>
              <Input required value={formData.barcode} onChange={e => handleChange('barcode', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Số lượng tồn kho ban đầu</Label>
              <Input type="number" value={formData.quantity} onChange={e => handleChange('quantity', Number(e.target.value))} />
            </div>

            {/* Giá */}
            <div className="space-y-2">
              <Label>Giá nhập (Original Value) *</Label>
              <Input type="number" required min="0" value={formData.originalValue} onChange={e => handleChange('originalValue', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Giá bán (Current Price) *</Label>
              <Input type="number" required min="0" value={formData.currentPrice} onChange={e => handleChange('currentPrice', Number(e.target.value))} />
              <p className="text-xs text-gray-500">Phải từ 30% - 150% giá nhập.</p>
            </div>

            {/* Kích thước */}
            <div className="grid grid-cols-4 gap-2 col-span-2">
              <div className="space-y-1"><Label className="text-xs">Nặng (kg)</Label><Input type="number" step="0.1" onChange={e => handleChange('weight', Number(e.target.value))} /></div>
              <div className="space-y-1"><Label className="text-xs">Dài (cm)</Label><Input type="number" step="0.1" onChange={e => handleChange('length', Number(e.target.value))} /></div>
              <div className="space-y-1"><Label className="text-xs">Rộng (cm)</Label><Input type="number" step="0.1" onChange={e => handleChange('width', Number(e.target.value))} /></div>
              <div className="space-y-1"><Label className="text-xs">Cao (cm)</Label><Input type="number" step="0.1" onChange={e => handleChange('height', Number(e.target.value))} /></div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-2">

              {/* 1. Tình trạng (Boolean) */}
              <div className="space-y-2">
                <Label>Tình trạng hàng hóa</Label>
                <Select
                  value={formData.isNew ? "true" : "false"}
                  onValueChange={(val) => handleChange('isNew', val === 'true')}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hàng mới (New)</SelectItem>
                    <SelectItem value="false">Đã qua sử dụng (Used)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Màu sắc chủ đạo</Label>
                <Input
                  placeholder="VD: Xanh, Bìa đỏ, Đen..."
                  value={formData.primaryColor}
                  onChange={e => handleChange('primaryColor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Điều kiện đổi trả</Label>
                <Input
                  placeholder="VD: Trong 7 ngày, Nguyên seal..."
                  value={formData.returnCondition}
                  onChange={e => handleChange('returnCondition', e.target.value)}
                />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Mô tả</Label>
              <Textarea rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thông tin chi tiết ({formData.productType})</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.productType === 'BOOK' && renderBookFields()}
            {formData.productType === 'DVD' && renderDVDFields()}
            {formData.productType === 'CD' && renderCDFields()}
            {formData.productType === 'NEWSPAPER' && renderNewspaperFields()}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Lưu sản phẩm</>}
          </Button>
        </div>
      </form>
    </div>
  );
}