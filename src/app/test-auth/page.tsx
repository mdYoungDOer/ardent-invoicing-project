'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session error:', sessionError);
      
      setAuthState({ session, sessionError });

      if (session?.user) {
        // Get user data
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('User data:', user);
        console.log('User error:', userError);
        
        setUserData({ user, userError });
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'deyoungdoer@gmail.com',
      password: 'YOUR_PASSWORD_HERE' // Replace with actual password
    });
    
    console.log('Login result:', { data, error });
    if (data) {
      await checkAuth();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthState(null);
    setUserData(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Session Status
          </Typography>
          <pre>{JSON.stringify(authState, null, 2)}</pre>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Data
          </Typography>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleLogin}>
          Test Login
        </Button>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="outlined" onClick={checkAuth}>
          Refresh
        </Button>
      </Box>
    </Container>
  );
}
