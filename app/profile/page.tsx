'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Lock, LogOut } from 'lucide-react';

// Schema đổi mật khẩu
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Mật khẩu mới không khớp",
  path: ["confirmNewPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordForm) => {
    setLoading(true);
    try {
      // API Endpoint 41: Change Own Password
      const res = await api.put('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (res.data.success) {
        toast("Đổi mật khẩu thành công. Vui lòng đăng nhập lại." );
        handleLogout();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mật khẩu hiện tại không đúng" );
    } finally {
      setLoading(false);
      reset(); // Xóa form
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Cột bên trái: Thông tin User */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}`} />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user.fullName}</CardTitle>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-500 text-xs uppercase">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-xs uppercase">Vai trò</Label>
                <div className="flex gap-2 mt-1">
                  {user.roles?.map((role: string) => (
                    <span key={role} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
              <Separator />
              <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
                <LogOut size={16} /> Đăng xuất
              </Button>
            </CardContent>
          </Card>

          {/* Cột bên phải: Form đổi mật khẩu */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} /> Đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    {...register('currentPassword')} 
                  />
                  {errors.currentPassword && <span className="text-red-500 text-xs">{errors.currentPassword.message}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    {...register('newPassword')} 
                  />
                  {errors.newPassword && <span className="text-red-500 text-xs">{errors.newPassword.message}</span>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                  <Input 
                    id="confirmNewPassword" 
                    type="password" 
                    {...register('confirmNewPassword')} 
                  />
                  {errors.confirmNewPassword && <span className="text-red-500 text-xs">{errors.confirmNewPassword.message}</span>}
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}