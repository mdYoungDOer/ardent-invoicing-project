import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get user data to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch user role from database
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        // Redirect based on role
        if (userData?.role === 'super') {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        } else if (userData?.role === 'sme') {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }
    }
  }

  // Default redirect to home page
  return NextResponse.redirect(`${origin}/`);
}
