'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Cần cài @hookform/resolvers
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
      // API Endpoint 2
      const res = await api.post('/auth/login', data);
      
      if (res.data.success) {
        // Lưu token vào localStorage như hướng dẫn trong API Doc
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success("Đăng nhập thành công");
        
        // Chuyển hướng về trang chủ hoặc trang quản lý đơn hàng
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu");
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