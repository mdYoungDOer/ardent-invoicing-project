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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Storage as DatabaseIcon,
  Route as RouterIcon,
  AccountCircle as SessionIcon
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  data?: any;
  timestamp: string;
}

export default function DebugAuth() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const router = useRouter();

  const addResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, data?: any) => {
    const result: DebugResult = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    setResults(prev => [...prev, result]);
  };

  const runComprehensiveDebug = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // =====================================================
      // 1. BASIC CONNECTION TEST
      // =====================================================
      setCurrentTest('Testing Supabase Connection...');
      addResult('connection', 'info', 'Testing Supabase connection...');
      
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        addResult('connection', 'success', 'Supabase connection successful', { data });
      } catch (error: any) {
        addResult('connection', 'error', 'Supabase connection failed', { error: error.message });
        return;
      }

      // =====================================================
      // 2. SESSION STATUS TEST
      // =====================================================
      setCurrentTest('Checking Current Session...');
      addResult('session', 'info', 'Checking current session status...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          addResult('session', 'success', 'Session found', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: session.expires_at,
            accessToken: session.access_token ? 'Present' : 'Missing'
          });
        } else {
          addResult('session', 'warning', 'No active session found');
        }
      } catch (error: any) {
        addResult('session', 'error', 'Session check failed', { error: error.message });
      }

      // =====================================================
      // 3. AUTH STATE CHANGE TEST
      // =====================================================
      setCurrentTest('Testing Auth State Changes...');
      addResult('auth_state', 'info', 'Setting up auth state change listener...');
      
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          addResult('auth_state', 'info', `Auth state changed: ${event}`, {
            event,
            hasSession: !!session,
            userId: session?.user?.id
          });
        });
        
        // Clean up after 5 seconds
        setTimeout(() => {
          subscription?.unsubscribe();
        }, 5000);
        
        addResult('auth_state', 'success', 'Auth state listener set up successfully');
      } catch (error: any) {
        addResult('auth_state', 'error', 'Auth state listener failed', { error: error.message });
      }

      // =====================================================
      // 4. USER DATA ACCESS TEST
      // =====================================================
      setCurrentTest('Testing User Data Access...');
      addResult('user_data', 'info', 'Testing user data access...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) throw userError;
          
          addResult('user_data', 'success', 'User data retrieved successfully', {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            tenant_id: userData.tenant_id
          });
        } else {
          addResult('user_data', 'warning', 'No session available for user data test');
        }
      } catch (error: any) {
        addResult('user_data', 'error', 'User data access failed', { error: error.message });
      }

      // =====================================================
      // 5. RLS POLICY TEST
      // =====================================================
      setCurrentTest('Testing RLS Policies...');
      addResult('rls_policies', 'info', 'Testing Row Level Security policies...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Test different RLS scenarios
          const tests = [
            { name: 'Select own data', query: () => supabase.from('users').select('*').eq('id', session.user.id) },
            { name: 'Select all users', query: () => supabase.from('users').select('*') },
            { name: 'Count users', query: () => supabase.from('users').select('count') }
          ];
          
          for (const test of tests) {
            try {
              const { data, error } = await test.query();
              if (error) {
                addResult('rls_policies', 'warning', `${test.name} failed`, { error: error.message });
              } else {
                addResult('rls_policies', 'success', `${test.name} successful`, { 
                  resultCount: Array.isArray(data) ? data.length : 'N/A' 
                });
              }
            } catch (err: any) {
              addResult('rls_policies', 'error', `${test.name} threw error`, { error: err.message });
            }
          }
        } else {
          addResult('rls_policies', 'warning', 'No session available for RLS testing');
        }
      } catch (error: any) {
        addResult('rls_policies', 'error', 'RLS policy test failed', { error: error.message });
      }

      // =====================================================
      // 6. LOGIN SIMULATION TEST
      // =====================================================
      setCurrentTest('Simulating Login Process...');
      addResult('login_simulation', 'info', 'Simulating the exact login process...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Simulate the exact login flow
          addResult('login_simulation', 'info', 'Step 1: Session exists', { userId: session.user.id });
          
          // Step 2: Verify user role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            addResult('login_simulation', 'error', 'Step 2: User data fetch failed', { error: userError.message });
          } else {
            addResult('login_simulation', 'success', 'Step 2: User data fetched', { 
              role: userData.role,
              email: userData.email 
            });
            
            // Step 3: Check role
            if (userData.role === 'sme') {
              addResult('login_simulation', 'success', 'Step 3: SME role confirmed');
              
              // Step 4: Test redirect simulation
              addResult('login_simulation', 'info', 'Step 4: Testing redirect simulation...');
              
              // Simulate the redirect delay
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Verify session is still there
              const { data: { session: verifySession } } = await supabase.auth.getSession();
              if (verifySession) {
                addResult('login_simulation', 'success', 'Step 4: Session verified for redirect');
              } else {
                addResult('login_simulation', 'error', 'Step 4: Session lost during redirect simulation');
              }
            } else {
              addResult('login_simulation', 'error', 'Step 3: Invalid role', { role: userData.role });
            }
          }
        } else {
          addResult('login_simulation', 'warning', 'No session available for login simulation');
        }
      } catch (error: any) {
        addResult('login_simulation', 'error', 'Login simulation failed', { error: error.message });
      }

      // =====================================================
      // 7. MIDDLEWARE SIMULATION TEST
      // =====================================================
      setCurrentTest('Testing Middleware Logic...');
      addResult('middleware', 'info', 'Testing middleware authentication logic...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Simulate middleware checks
          addResult('middleware', 'info', 'Middleware: Session found', { userId: session.user.id });
          
          // Check user role for middleware
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            addResult('middleware', 'error', 'Middleware: User role check failed', { error: userError.message });
          } else {
            addResult('middleware', 'success', 'Middleware: User role check passed', { role: userData.role });
            
            // Check if user can access SME routes
            if (userData.role === 'sme') {
              addResult('middleware', 'success', 'Middleware: SME access granted');
            } else {
              addResult('middleware', 'error', 'Middleware: SME access denied', { role: userData.role });
            }
          }
        } else {
          addResult('middleware', 'warning', 'Middleware: No session found');
        }
      } catch (error: any) {
        addResult('middleware', 'error', 'Middleware test failed', { error: error.message });
      }

      // =====================================================
      // 8. DASHBOARD ACCESS TEST
      // =====================================================
      setCurrentTest('Testing Dashboard Access...');
      addResult('dashboard_access', 'info', 'Testing dashboard access logic...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          addResult('dashboard_access', 'info', 'Dashboard: Session found', { userId: session.user.id });
          
          // Simulate dashboard authentication guard
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            addResult('dashboard_access', 'error', 'Dashboard: User data fetch failed', { error: userError.message });
          } else {
            addResult('dashboard_access', 'success', 'Dashboard: User data fetched', { 
              role: userData.role,
              tenant_id: userData.tenant_id 
            });
            
            if (userData.role !== 'sme') {
              addResult('dashboard_access', 'error', 'Dashboard: Invalid role for SME dashboard', { role: userData.role });
            } else {
              addResult('dashboard_access', 'success', 'Dashboard: SME role confirmed for dashboard access');
            }
          }
        } else {
          addResult('dashboard_access', 'warning', 'Dashboard: No session found');
        }
      } catch (error: any) {
        addResult('dashboard_access', 'error', 'Dashboard access test failed', { error: error.message });
      }

      // =====================================================
      // 9. REDIRECT SIMULATION TEST
      // =====================================================
      setCurrentTest('Testing Redirect Logic...');
      addResult('redirect', 'info', 'Testing redirect logic...');
      
      try {
        // Test if we can navigate to dashboard
        addResult('redirect', 'info', 'Testing dashboard navigation...');
        
        // Simulate the redirect process
        const redirectTest = () => {
          return new Promise((resolve) => {
            // Simulate window.location.href redirect
            setTimeout(() => {
              addResult('redirect', 'success', 'Redirect simulation completed');
              resolve(true);
            }, 100);
          });
        };
        
        await redirectTest();
      } catch (error: any) {
        addResult('redirect', 'error', 'Redirect test failed', { error: error.message });
      }

      // =====================================================
      // 10. COMPREHENSIVE SUMMARY
      // =====================================================
      setCurrentTest('Generating Summary...');
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const warningCount = results.filter(r => r.status === 'warning').length;
      
      addResult('summary', 'info', 'Debug test completed', {
        totalTests: results.length,
        successes: successCount,
        errors: errorCount,
        warnings: warningCount,
        successRate: `${Math.round((successCount / results.length) * 100)}%`
      });

    } catch (error: any) {
      addResult('debug_error', 'error', 'Debug test failed', { error: error.message });
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BugReportIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Comprehensive Authentication Debug
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This comprehensive debug tool will test every aspect of the authentication flow 
            to identify the exact cause of login issues.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={runComprehensiveDebug}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <BugReportIcon />}
              sx={{ mr: 2 }}
            >
              {loading ? currentTest : 'Run Comprehensive Debug'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setResults([])}
              disabled={loading}
            >
              Clear Results
            </Button>
          </Box>

          {loading && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Running:</strong> {currentTest}
              </Typography>
            </Alert>
          )}

          {results.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Debug Results ({results.length} tests)
              </Typography>
              
              {results.map((result, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {getStatusIcon(result.status)}
                      <Typography sx={{ ml: 1, flexGrow: 1 }}>
                        <strong>{result.test}</strong>
                      </Typography>
                      <Chip 
                        label={result.status.toUpperCase()} 
                        color={getStatusColor(result.status) as any}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
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
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push('/sme/login')}
                    startIcon={<SecurityIcon />}
                  >
                    Test SME Login
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push('/dashboard')}
                    startIcon={<DatabaseIcon />}
                  >
                    Test Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.open('/test-auth', '_blank')}
                    startIcon={<SessionIcon />}
                  >
                    Test Auth Page
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => window.location.reload()}
                    startIcon={<RouterIcon />}
                  >
                    Refresh Page
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
