'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

// Schema validation
const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // Cập nhật Endpoint: /api/v1/auth/login
      const res = await api.post('/api/v1/auth/login', data);
      
      // Cập nhật logic check thành công dựa trên errorCode "ER0000"
      if (res.data?.errorCode === 'ER0000') {
        const { token, user } = res.data.data;
        
        // Lưu token và user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success("Đăng nhập thành công");
        
        // Chuyển hướng
        router.push('/');
      } else {
        // Xử lý trường hợp API trả về 200 nhưng có lỗi nghiệp vụ (sai pass, user bị khóa...)
        toast.error(res.data?.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Xử lý lỗi mạng hoặc lỗi server (4xx, 5xx)
      const msg = error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">AIMS Login</CardTitle>
          <p className="text-sm text-gray-500">Đăng nhập để quản lý đơn hàng của bạn</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input 
                id="username" 
                placeholder="admin" 
                {...register('username')} 
              />
              {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
            
            <div className="text-center text-sm mt-4">
              <span className="text-gray-500">Chưa có tài khoản? </span>
              <Link href="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}