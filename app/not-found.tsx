import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'
 
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4 text-center">
      <FileQuestion className="h-24 w-24 text-gray-300" />
      <h2 className="text-3xl font-bold text-gray-800">Không tìm thấy trang</h2>
      <p className="text-gray-500">Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.</p>
      <Link href="/">
        <Button>Quay về trang chủ</Button>
      </Link>
    </div>
  )
}