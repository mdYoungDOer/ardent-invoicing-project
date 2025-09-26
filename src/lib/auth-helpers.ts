// Authentication helper functions to handle redirects properly

export const getAuthRedirectUrl = () => {
  // Use environment variable for production, fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  return {
    signup: `${baseUrl}/auth/callback`,
    login: `${baseUrl}/auth/callback`,
    resetPassword: `${baseUrl}/auth/reset-password`,
    confirmEmail: `${baseUrl}/auth/confirm-email`,
  };
};

export const getRoleBasedRedirect = (role: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  switch (role) {
    case 'super':
      return `${baseUrl}/admin/dashboard`;
    case 'sme':
      return `${baseUrl}/dashboard`;
    case 'client':
      return `${baseUrl}/client/dashboard`;
    default:
      return `${baseUrl}/dashboard`;
  }
};

// Function to handle auth state changes and redirects
export const handleAuthStateChange = async (event: string, session: any) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Import supabase client dynamically to avoid circular imports
    const { supabase } = await import('./supabase');
    
    // Get user role from database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (userData?.role) {
      const redirectUrl = getRoleBasedRedirect(userData.role);
      window.location.href = redirectUrl;
    }
  }
};
