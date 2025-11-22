'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Unlock, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  status: string; // ACTIVE, BLOCKED
  roles: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      // API Endpoint 33: Get All Users
      const res = await api.get('/users?page=0&size=50');
      if (res.data.success) setUsers(res.data.data.content);
    } catch (error) {
      toast.error("Lỗi tải danh sách người dùng" );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleStatus = async (user: User) => {
    const isBlocked = user.status === 'BLOCKED';
    const action = isBlocked ? 'unblock' : 'block'; // Endpoint 38, 39
    
    if (!confirm(`Bạn có chắc muốn ${isBlocked ? 'mở khóa' : 'chặn'} user này?`)) return;

    try {
      await api.put(`/users/${user.id}/${action}`);
      toast.success(`Đã cập nhật trạng thái user ${user.username}`);
      fetchUsers(); // Reload list
    } catch (error) {
      toast.error("Không thể thực hiện thao tác" );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <Badge variant="outline" className="text-base px-4 py-1">
          Tổng: {users.length} users
        </Badge>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Thông tin cá nhân</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin inline" /></TableCell>
              </TableRow>
            ) : users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-500">@{user.username} • {user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <Badge key={role} variant={role === 'ROLE_ADMIN' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {role.replace('ROLE_', '')}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.roles.includes('ROLE_ADMIN') ? (
                    <span className="text-xs text-gray-400 italic">Admin</span>
                  ) : (
                    <Button 
                      size="sm" 
                      variant={user.status === 'ACTIVE' ? "destructive" : "outline"}
                      className="gap-2 h-8"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === 'ACTIVE' ? <Lock size={14} /> : <Unlock size={14} />}
                      {user.status === 'ACTIVE' ? 'Chặn' : 'Mở khóa'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}