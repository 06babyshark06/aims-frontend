// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Chỉ chạy logic này với các route bắt đầu bằng /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Ở bản production, bạn nên verify token kỹ hơn (gọi API verify)
    // Ở đây check nhanh cookie hoặc header tùy cách bạn lưu
    // Vì client-side lưu localStorage, middleware khó check trực tiếp localStorage.
    // Cách đơn giản nhất cho đồ án: Check cookie nếu bạn lưu token vào cookie, 
    // hoặc xử lý redirect ở Client Component (như AdminLayout bên dưới).
    
    // Tuy nhiên, NextJS Middleware chạy ở Edge, không access được localStorage.
    // Ta sẽ dùng Layout để bảo vệ route admin.
    return NextResponse.next();
  }
}

export const config = {
  matcher: '/admin/:path*',
};