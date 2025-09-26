'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert, 
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function TestAdmin() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  const addResult = (test: string, status: string, message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toISOString() }]);
  };

  const runAdminTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Test 1: Check current session
      addResult('session', 'info', 'Checking current session...');
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        addResult('session', 'success', 'Session found', {
          userId: currentSession.user.id,
          email: currentSession.user.email,
          role: currentSession.user.role
        });
      } else {
        addResult('session', 'warning', 'No session found');
      }

      // Test 2: Check localStorage
      addResult('localStorage', 'info', 'Checking localStorage for admin data...');
      const storedAdmin = localStorage.getItem('ardent_admin');
      if (storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin);
          addResult('localStorage', 'success', 'Admin data found in localStorage', adminData);
        } catch (error) {
          addResult('localStorage', 'error', 'Failed to parse stored admin data', { error: error.message });
        }
      } else {
        addResult('localStorage', 'warning', 'No admin data in localStorage');
      }

      // Test 3: Check user data from database
      if (currentSession) {
        addResult('userData', 'info', 'Fetching user data from database...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (userError) {
          addResult('userData', 'error', 'Failed to fetch user data', { error: userError.message });
        } else {
          setUserData(userData);
          addResult('userData', 'success', 'User data fetched', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
        }
      }

      // Test 4: Test admin dashboard access
      addResult('dashboard', 'info', 'Testing admin dashboard access...');
      try {
        const response = await fetch('/admin/dashboard');
        if (response.ok) {
          addResult('dashboard', 'success', 'Admin dashboard accessible');
        } else {
          addResult('dashboard', 'error', 'Admin dashboard not accessible', { 
            status: response.status,
            statusText: response.statusText 
          });
        }
      } catch (error: any) {
        addResult('dashboard', 'error', 'Admin dashboard access failed', { error: error.message });
      }

    } catch (error: any) {
      addResult('error', 'error', 'Test failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('ardent_admin');
    localStorage.removeItem('ardent_user');
    setResults([]);
    addResult('clear', 'info', 'Storage cleared');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Super Admin Test Page
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This page tests the Super Admin authentication flow to identify issues.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={runAdminTest}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ mr: 2 }}
            >
              {loading ? 'Testing...' : 'Run Admin Test'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={clearStorage}
              disabled={loading}
            >
              Clear Storage
            </Button>
          </Box>

          {results.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Test Results ({results.length} tests)
              </Typography>
              
              {results.map((result, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        <strong>{result.test}</strong>
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={result.status === 'success' ? 'success.main' : 
                               result.status === 'error' ? 'error.main' : 
                               result.status === 'warning' ? 'warning.main' : 'info.main'}
                        sx={{ mr: 2 }}
                      >
                        {result.status.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {result.message}
                    </Typography>
                    {result.data && (
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Data:
                        </Typography>
                        <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </Paper>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => window.open('/admin/login', '_blank')}
              >
                Test Admin Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.open('/admin/dashboard', '_blank')}
              >
                Test Admin Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.open('/debug-auth', '_blank')}
              >
                Run Full Debug
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
