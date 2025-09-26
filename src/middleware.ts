import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for login/signup pages to prevent redirect loops
  if (pathname.startsWith('/admin/login') || 
      pathname.startsWith('/admin/signup') ||
      pathname.startsWith('/sme/login') || 
      pathname.startsWith('/sme/signup')) {
    return NextResponse.next();
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication (exclude login/signup pages)
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) &&
                          !pathname.startsWith('/admin/login') && 
                          !pathname.startsWith('/admin/signup') &&
                          !pathname.startsWith('/sme/login') && 
                          !pathname.startsWith('/sme/signup');

  // Admin routes that require super admin role (exclude login/signup)
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route)) && 
                      !pathname.startsWith('/admin/login') && 
                      !pathname.startsWith('/admin/signup');

  // SME routes that require SME role (exclude login/signup)
  const smeRoutes = ['/dashboard'];
  const isSmeRoute = smeRoutes.some(route => pathname.startsWith(route)) && 
                     !pathname.startsWith('/sme/login') && 
                     !pathname.startsWith('/sme/signup');

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone();
    // Redirect to appropriate login based on route
    if (pathname.startsWith('/admin')) {
      redirectUrl.pathname = '/admin/login';
    } else if (pathname.startsWith('/dashboard')) {
      redirectUrl.pathname = '/sme/login';
    } else {
      // Default redirect to SME login for unknown routes
      redirectUrl.pathname = '/sme/login';
    }
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated but trying to access admin route without proper role
  if (session && isAdminRoute) {
    try {
      console.log('🔍 Middleware: Checking user role for admin route');
      console.log('User ID:', session.user.id);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      console.log('User role query result:', { user, userError });

      if (userError) {
        console.error('❌ Error fetching user role:', userError);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }

      if (!user || user.role !== 'super') {
        console.log('❌ User not authorized for admin access. Role:', user?.role);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
      }

      console.log('✅ User authorized for admin access');
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If user is authenticated but trying to access SME route without proper role
  if (session && isSmeRoute) {
    try {
      console.log('🔍 Middleware: Checking user role for SME route');
      console.log('User ID:', session.user.id);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      console.log('User role query result:', { user, userError });

      if (userError) {
        console.error('❌ Error fetching user role:', userError);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/sme/login';
        return NextResponse.redirect(redirectUrl);
      }

      if (!user || user.role !== 'sme') {
        console.log('❌ User not authorized for SME access. Role:', user?.role);
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        return NextResponse.redirect(redirectUrl);
      }

      console.log('✅ User authorized for SME access');
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/sme/login';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Note: Login/signup pages are excluded from middleware to prevent redirect loops

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
