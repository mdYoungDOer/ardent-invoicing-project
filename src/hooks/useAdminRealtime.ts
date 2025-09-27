import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeService, NotificationData } from '@/lib/realtime';
import { supabase } from '@/lib/supabase';

export interface AdminRealtimeState {
  isConnected: boolean;
  systemStats: {
    totalUsers: number;
    totalTenants: number;
    totalInvoices: number;
    totalRevenue: number;
    activeUsers: number;
    storageUsage: {
      totalFiles: number;
      totalSize: number;
      buckets: Record<string, { files: number; size: number }>;
    };
  };
  realtimeMetrics: {
    newUsersToday: number;
    newTenantsToday: number;
    invoicesCreatedToday: number;
    revenueToday: number;
    systemAlerts: number;
  };
  notifications: NotificationData[];
  unreadCount: number;
  recentActivity: any[];
  isSubscribed: boolean;
}

export interface AdminSystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  data?: any;
}

export function useAdminRealtime(options: {
  enableSystemMonitoring?: boolean;
  enableNotifications?: boolean;
  enableActivityTracking?: boolean;
  onError?: (error: Error) => void;
} = {}) {
  const {
    enableSystemMonitoring = true,
    enableNotifications = true,
    enableActivityTracking = true,
    onError,
  } = options;

  const [state, setState] = useState<AdminRealtimeState>({
    isConnected: false,
    systemStats: {
      totalUsers: 0,
      totalTenants: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      activeUsers: 0,
      storageUsage: {
        totalFiles: 0,
        totalSize: 0,
        buckets: {},
      },
    },
    realtimeMetrics: {
      newUsersToday: 0,
      newTenantsToday: 0,
      invoicesCreatedToday: 0,
      revenueToday: 0,
      systemAlerts: 0,
    },
    notifications: [],
    unreadCount: 0,
    recentActivity: [],
    isSubscribed: false,
  });

  const channelsRef = useRef<Map<string, any>>(new Map());
  const notificationChannelRef = useRef<any>(null);
  const systemMonitoringInterval = useRef<NodeJS.Timeout | null>(null);

  // Load initial system statistics
  const loadSystemStats = useCallback(async () => {
    try {
      const [
        usersResult,
        tenantsResult,
        invoicesResult,
        storageStatsResult,
        activityResult,
      ] = await Promise.all([
        supabase.from('users').select('id, created_at, subscription_tier', { count: 'exact' }),
        supabase.from('tenants').select('id, created_at', { count: 'exact' }),
        supabase.from('invoices').select('id, amount, created_at, status', { count: 'exact' }),
        supabase.from('storage_files').select('bucket, size', { count: 'exact' }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalUsers = usersResult.count || 0;
      const totalTenants = tenantsResult.count || 0;
      const totalInvoices = invoicesResult.count || 0;
      const totalRevenue = invoicesResult.data?.reduce((sum, inv) => 
        inv.status === 'paid' ? sum + (inv.amount || 0) : sum, 0) || 0;

      // Calculate today's metrics
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = usersResult.data?.filter(u => 
        u.created_at?.startsWith(today)).length || 0;
      const newTenantsToday = tenantsResult.data?.filter(t => 
        t.created_at?.startsWith(today)).length || 0;
      const invoicesCreatedToday = invoicesResult.data?.filter(i => 
        i.created_at?.startsWith(today)).length || 0;
      const revenueToday = invoicesResult.data?.filter(i => 
        i.created_at?.startsWith(today) && i.status === 'paid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

      // Calculate storage usage
      const storageUsage = {
        totalFiles: storageStatsResult.count || 0,
        totalSize: storageStatsResult.data?.reduce((sum, file) => sum + (file.size || 0), 0) || 0,
        buckets: {} as Record<string, { files: number; size: number }>,
      };

      storageStatsResult.data?.forEach(file => {
        if (!storageUsage.buckets[file.bucket]) {
          storageUsage.buckets[file.bucket] = { files: 0, size: 0 };
        }
        storageUsage.buckets[file.bucket].files++;
        storageUsage.buckets[file.bucket].size += file.size || 0;
      });

      setState(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          totalUsers,
          totalTenants,
          totalInvoices,
          totalRevenue,
          storageUsage,
        },
        realtimeMetrics: {
          ...prev.realtimeMetrics,
          newUsersToday,
          newTenantsToday,
          invoicesCreatedToday,
          revenueToday,
        },
        recentActivity: activityResult.data || [],
      }));
    } catch (error) {
      console.error('Failed to load system stats:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    try {
      const notifications = await RealtimeService.getUserNotifications('admin', {
        limit: 20,
        unreadOnly: false,
      });

      const unreadCount = await RealtimeService.getUnreadCount('admin');

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
      }));
    } catch (error) {
      console.error('Failed to load admin notifications:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Handle new notification
  const handleNewNotification = useCallback((notification: NotificationData) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));
  }, []);

  // Subscribe to system-wide changes
  const subscribeToSystemChanges = useCallback(() => {
    const tables = ['users', 'tenants', 'invoices', 'expenses', 'subscriptions'];
    const channels = RealtimeService.subscribeToTenant('system', tables, {
      onInsert: (payload) => {
        console.log('System-wide insert:', payload);
        loadSystemStats(); // Refresh stats on any change
      },
      onUpdate: (payload) => {
        console.log('System-wide update:', payload);
        loadSystemStats(); // Refresh stats on any change
      },
      onDelete: (payload) => {
        console.log('System-wide delete:', payload);
        loadSystemStats(); // Refresh stats on any change
      },
      onError: (error) => {
        console.error('System subscription error:', error);
        onError?.(error);
      },
    });

    channels.forEach((channel, index) => {
      channelsRef.current.set(`system-${tables[index]}`, channel);
    });
  }, [loadSystemStats, onError]);

  // Subscribe to admin notifications
  const subscribeToAdminNotifications = useCallback(() => {
    if (!enableNotifications) return;

    // Create a system-wide notification channel for admin
    notificationChannelRef.current = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.admin',
        },
        (payload) => {
          console.log('New admin notification:', payload);
          handleNewNotification(payload.new as NotificationData);
        }
      )
      .subscribe((status) => {
        console.log('Admin notification subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to admin notifications'));
        }
      });

    channelsRef.current.set('admin-notifications', notificationChannelRef.current);
  }, [enableNotifications, handleNewNotification, onError]);

  // System monitoring interval
  const startSystemMonitoring = useCallback(() => {
    if (systemMonitoringInterval.current) {
      clearInterval(systemMonitoringInterval.current);
    }

    systemMonitoringInterval.current = setInterval(() => {
      loadSystemStats();
    }, 30000); // Update every 30 seconds
  }, [loadSystemStats]);

  // Create system alert
  const createSystemAlert = useCallback(async (alert: Omit<AdminSystemAlert, 'id' | 'timestamp'>) => {
    try {
      await RealtimeService.createNotification({
        title: alert.title,
        message: alert.message,
        type: alert.type,
        user_id: 'admin',
        tenant_id: undefined,
        data: {
          severity: alert.severity,
          ...alert.data,
        },
      });
    } catch (error) {
      console.error('Failed to create system alert:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Broadcast system-wide announcement
  const broadcastSystemAnnouncement = useCallback(async (message: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    targetUsers?: string[];
    targetTenants?: string[];
  }) => {
    try {
      // If specific users/tenants are targeted, send to them
      if (message.targetUsers || message.targetTenants) {
        // Implementation for targeted announcements
        console.log('Targeted announcement:', message);
      } else {
        // Broadcast to all users
        await RealtimeService.broadcastToTenant('all', message);
      }
    } catch (error) {
      console.error('Failed to broadcast announcement:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await RealtimeService.markNotificationAsRead(notificationId);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = state.notifications.filter(n => !n.read);
      
      await Promise.all(
        unreadNotifications.map(n => RealtimeService.markNotificationAsRead(n.id))
      );

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      onError?.(error as Error);
    }
  }, [state.notifications, onError]);

  // Initialize admin real-time features
  useEffect(() => {
    const initializeAdminRealtime = async () => {
      try {
        // Load initial data
        await Promise.all([
          loadSystemStats(),
          loadNotifications(),
        ]);

        // Subscribe to system changes
        if (enableSystemMonitoring) {
          subscribeToSystemChanges();
        }

        // Subscribe to notifications
        if (enableNotifications) {
          subscribeToAdminNotifications();
        }

        // Start system monitoring
        if (enableSystemMonitoring) {
          startSystemMonitoring();
        }

        setState(prev => ({
          ...prev,
          isConnected: true,
          isSubscribed: true,
          activeChannels: Array.from(channelsRef.current.keys()),
        }));
      } catch (error) {
        console.error('Failed to initialize admin realtime:', error);
        onError?.(error as Error);
      }
    };

    initializeAdminRealtime();

    return () => {
      // Cleanup
      RealtimeService.unsubscribeAll();
      channelsRef.current.clear();
      notificationChannelRef.current = null;

      if (systemMonitoringInterval.current) {
        clearInterval(systemMonitoringInterval.current);
      }

      setState(prev => ({
        ...prev,
        isConnected: false,
        isSubscribed: false,
        activeChannels: [],
      }));
    };
  }, [
    loadSystemStats,
    loadNotifications,
    enableSystemMonitoring,
    enableNotifications,
    enableActivityTracking,
    subscribeToSystemChanges,
    subscribeToAdminNotifications,
    startSystemMonitoring,
    onError,
  ]);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    createSystemAlert,
    broadcastSystemAnnouncement,
    refreshStats: loadSystemStats,
    refreshNotifications: loadNotifications,
  };
}
