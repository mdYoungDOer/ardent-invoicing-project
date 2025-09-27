import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeService, NotificationData } from '@/lib/realtime';
import { useAppStore } from '@/lib/store';

export interface UseRealtimeOptions {
  tenantId?: string;
  userId?: string;
  enableNotifications?: boolean;
  enableCollaboration?: boolean;
  onError?: (error: Error) => void;
}

export interface RealtimeState {
  isConnected: boolean;
  activeChannels: string[];
  notifications: NotificationData[];
  unreadCount: number;
  isSubscribed: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { user, tenant, setError } = useAppStore();
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    activeChannels: [],
    notifications: [],
    unreadCount: 0,
    isSubscribed: false,
  });

  const {
    tenantId = tenant?.id,
    userId = user?.id,
    enableNotifications = true,
    enableCollaboration = false,
    onError,
  } = options;

  const channelsRef = useRef<Map<string, any>>(new Map());
  const notificationChannelRef = useRef<any>(null);

  // Load initial notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const notifications = await RealtimeService.getUserNotifications(userId, {
        limit: 20,
        unreadOnly: false,
      });

      const unreadCount = await RealtimeService.getUnreadCount(userId);

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      onError?.(error as Error);
    }
  }, [userId, onError]);

  // Handle new notification
  const handleNewNotification = useCallback((notification: NotificationData) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
      });
    }
  }, []);

  // Subscribe to notifications
  const subscribeToNotifications = useCallback(() => {
    if (!userId || !enableNotifications) return;

    notificationChannelRef.current = RealtimeService.subscribeToNotifications(
      userId,
      handleNewNotification,
      (error) => {
        console.error('Notification subscription error:', error);
        onError?.(error);
      }
    );
  }, [userId, enableNotifications, handleNewNotification, onError]);

  // Subscribe to tenant data changes
  const subscribeToTenantData = useCallback(() => {
    if (!tenantId) return;

    const tables = ['invoices', 'expenses', 'customers', 'products'];
    const channels = RealtimeService.subscribeToTenant(tenantId, tables, {
      onInsert: (payload) => {
        console.log('New record inserted:', payload);
        // You can add specific handling for each table here
      },
      onUpdate: (payload) => {
        console.log('Record updated:', payload);
        // You can add specific handling for each table here
      },
      onDelete: (payload) => {
        console.log('Record deleted:', payload);
        // You can add specific handling for each table here
      },
      onError: (error) => {
        console.error('Tenant subscription error:', error);
        onError?.(error);
      },
    });

    channels.forEach((channel, index) => {
      channelsRef.current.set(`tenant-${tables[index]}`, channel);
    });
  }, [tenantId, onError]);

  // Initialize real-time subscriptions
  useEffect(() => {
    if (!userId || !tenantId) return;

    const initializeRealtime = async () => {
      try {
        // Load initial notifications
        await loadNotifications();

        // Subscribe to notifications
        subscribeToNotifications();

        // Subscribe to tenant data
        subscribeToTenantData();

        setState(prev => ({
          ...prev,
          isConnected: true,
          isSubscribed: true,
          activeChannels: Array.from(channelsRef.current.keys()),
        }));
      } catch (error) {
        console.error('Failed to initialize realtime:', error);
        onError?.(error as Error);
      }
    };

    initializeRealtime();

    return () => {
      // Cleanup subscriptions
      RealtimeService.unsubscribeAll();
      channelsRef.current.clear();
      notificationChannelRef.current = null;

      setState(prev => ({
        ...prev,
        isConnected: false,
        isSubscribed: false,
        activeChannels: [],
      }));
    };
  }, [userId, tenantId, loadNotifications, subscribeToNotifications, subscribeToTenantData, onError]);

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
    if (!userId) return;

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
  }, [userId, state.notifications, onError]);

  // Create notification
  const createNotification = useCallback(async (data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    targetUserId?: string;
    targetTenantId?: string;
    data?: any;
  }) => {
    try {
      const targetUserId = data.targetUserId || userId;
      const targetTenantId = data.targetTenantId || tenantId;

      if (!targetUserId) {
        throw new Error('Target user ID is required');
      }

      await RealtimeService.createNotification({
        title: data.title,
        message: data.message,
        type: data.type,
        user_id: targetUserId,
        tenant_id: targetTenantId,
        data: data.data,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
      onError?.(error as Error);
    }
  }, [userId, tenantId, onError]);

  // Broadcast to tenant
  const broadcastToTenant = useCallback(async (message: {
    type: string;
    data: any;
    title: string;
    description?: string;
  }) => {
    if (!tenantId) return;

    try {
      await RealtimeService.broadcastToTenant(tenantId, message);
    } catch (error) {
      console.error('Failed to broadcast to tenant:', error);
      onError?.(error as Error);
    }
  }, [tenantId, onError]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    ...state,
    markAsRead,
    markAllAsRead,
    createNotification,
    broadcastToTenant,
    requestNotificationPermission,
    refreshNotifications: loadNotifications,
  };
}

// Specialized hooks for specific use cases
export function useNotifications(userId?: string) {
  const { user } = useAppStore();
  const actualUserId = userId || user?.id;
  
  return useRealtime({
    userId: actualUserId,
    enableNotifications: true,
    enableCollaboration: false,
  });
}

export function useTenantRealtime(tenantId?: string) {
  const { tenant } = useAppStore();
  const actualTenantId = tenantId || tenant?.id;
  
  return useRealtime({
    tenantId: actualTenantId,
    enableNotifications: false,
    enableCollaboration: false,
  });
}

export function useCollaboration(documentId: string, documentType: string) {
  const { user, tenant } = useAppStore();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);
  const collaborationChannelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id || !documentId) return;

    const channel = RealtimeService.subscribeToCollaborativeEditing(
      documentId,
      user.id,
      (user) => {
        setCollaborators(prev => [...prev, user]);
      },
      (user) => {
        setCollaborators(prev => prev.filter(c => c.userId !== user.userId));
      },
      (content) => {
        // Handle content changes
        console.log('Content changed:', content);
      }
    );

    collaborationChannelRef.current = channel;
    setIsActive(true);

    return () => {
      channel?.unsubscribe();
      setIsActive(false);
      setCollaborators([]);
    };
  }, [user?.id, documentId, documentType]);

  const broadcastContentChange = useCallback(async (content: any) => {
    if (!documentId || !user?.id) return;
    
    await RealtimeService.broadcastContentChange(documentId, content, user.id);
  }, [documentId, user?.id]);

  return {
    collaborators,
    isActive,
    broadcastContentChange,
  };
}
