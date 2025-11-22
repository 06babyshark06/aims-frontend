'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Schema validation: Yêu cầu password min 6 ký tự và confirm password khớp
const registerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // API Endpoint 1: Register User
      const res = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        // phoneNumber: "..." (Optional, có thể thêm trường này nếu muốn)
      });

      if (res.data.success) {
        toast.success("Vui lòng đăng nhập để tiếp tục");
        router.push('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Tên đăng nhập hoặc Email đã tồn tại" );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Đăng ký thành viên</CardTitle>
          <p className="text-sm text-gray-500">Tạo tài khoản để mua sắm tại AIMS</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" placeholder="Nguyễn Văn A" {...register('fullName')} />
              {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" placeholder="user123" {...register('username')} />
              {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="email@example.com" {...register('email')} />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
            </div>

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <span className="text-sm text-gray-500">Đã có tài khoản? </span>
          <Link href="/login" className="text-blue-600 hover:underline ml-1 text-sm">Đăng nhập ngay</Link>
        </CardFooter>
      </Card>
    </div>
  );
}