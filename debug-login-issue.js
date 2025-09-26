// Debug Login Issue - Frontend Authentication Flow
// Add this to your browser console to debug the login process

console.log('🔍 Debugging Super Admin Login...');

// 1. Check if Supabase client is working
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// 2. Check current auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('Current session:', session);
  console.log('Session error:', error);
});

// 3. Test login manually
const testLogin = async () => {
  console.log('Testing login with credentials...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'deyoungdoer@gmail.com',
    password: 'YOUR_PASSWORD_HERE' // Replace with actual password
  });
  
  console.log('Login result:', { data, error });
  
  if (data?.user) {
    console.log('User ID:', data.user.id);
    console.log('User email:', data.user.email);
    
    // Check user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    console.log('User role data:', { userData, userError });
  }
};

// 4. Check auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', { event, session });
});

// 5. Test redirect
const testRedirect = () => {
  console.log('Testing redirect...');
  window.location.href = '/admin/dashboard';
};

console.log('Run testLogin() to test the login process');
console.log('Run testRedirect() to test the redirect');
