import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: any;
  created_at: string;
  read: boolean;
  user_id: string;
  tenant_id?: string;
}

export interface SubscriptionOptions {
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onError?: (error: Error) => void;
}

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static notificationChannel: RealtimeChannel | null = null;

  /**
   * Subscribe to table changes
   */
  static subscribeToTable(
    table: string,
    options: SubscriptionOptions = {}
  ): RealtimeChannel {
    const channelName = `table:${table}`;
    
    // Close existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log('INSERT event:', payload);
          options.onInsert?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log('UPDATE event:', payload);
          options.onUpdate?.(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log('DELETE event:', payload);
          options.onDelete?.(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${table} changes`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${table} changes`);
          options.onError?.(new Error(`Failed to subscribe to ${table} changes`));
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Subscribe to tenant-specific changes
   */
  static subscribeToTenant(
    tenantId: string,
    tables: string[],
    options: SubscriptionOptions = {}
  ): RealtimeChannel[] {
    const channels: RealtimeChannel[] = [];

    tables.forEach(table => {
      const channelName = `tenant:${tenantId}:${table}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            console.log(`Tenant ${tenantId} ${table} event:`, payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                options.onInsert?.(payload);
                break;
              case 'UPDATE':
                options.onUpdate?.(payload);
                break;
              case 'DELETE':
                options.onDelete?.(payload);
                break;
            }
          }
        )
        .subscribe((status) => {
          console.log(`Tenant subscription status for ${table}:`, status);
          if (status === 'CHANNEL_ERROR') {
            options.onError?.(new Error(`Failed to subscribe to tenant ${tenantId} ${table} changes`));
          }
        });

      channels.push(channel);
      this.channels.set(channelName, channel);
    });

    return channels;
  }

  /**
   * Subscribe to user notifications
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationData) => void,
    onError?: (error: Error) => void
  ): RealtimeChannel {
    const channelName = `notifications:${userId}`;
    
    if (this.notificationChannel) {
      this.notificationChannel.unsubscribe();
    }

    this.notificationChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          onNotification(payload.new as NotificationData);
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          onError?.(new Error('Failed to subscribe to notifications'));
        }
      });

    this.channels.set(channelName, this.notificationChannel);
    return this.notificationChannel;
  }

  /**
   * Create a notification
   */
  static async createNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    user_id: string;
    tenant_id?: string;
    data?: any;
  }): Promise<NotificationData> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...data,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<NotificationData[]> {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Broadcast message to tenant members
   */
  static async broadcastToTenant(
    tenantId: string,
    message: {
      type: string;
      data: any;
      title: string;
      description?: string;
    }
  ): Promise<void> {
    // Get all users in the tenant
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to get tenant users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      return;
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      title: message.title,
      message: message.description || message.type,
      type: 'info' as const,
      user_id: user.id,
      tenant_id: tenantId,
      data: message.data,
      read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      throw new Error(`Failed to broadcast to tenant: ${insertError.message}`);
    }
  }

  /**
   * Subscribe to collaborative editing
   */
  static subscribeToCollaborativeEditing(
    documentId: string,
    userId: string,
    onUserJoin: (user: any) => void,
    onUserLeave: (user: any) => void,
    onContentChange: (content: any) => void
  ): RealtimeChannel {
    const channelName = `collaboration:${documentId}`;
    
    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('Presence state:', presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        onUserJoin({ userId: key, ...newPresences[0] });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        onUserLeave({ userId: key, ...leftPresences[0] });
      })
      .on('broadcast', { event: 'content-change' }, ({ payload }) => {
        console.log('Content changed:', payload);
        onContentChange(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Broadcast content change for collaborative editing
   */
  static async broadcastContentChange(
    documentId: string,
    content: any,
    userId: string
  ): Promise<void> {
    const channelName = `collaboration:${documentId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'content-change',
        payload: {
          content,
          userId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  static unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  static unsubscribeAll(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
    
    if (this.notificationChannel) {
      this.notificationChannel.unsubscribe();
      this.notificationChannel = null;
    }
  }

  /**
   * Get active channels
   */
  static getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Check if channel is active
   */
  static isChannelActive(channelName: string): boolean {
    return this.channels.has(channelName);
  }
}

// Convenience functions for common subscriptions
export const subscribeToInvoices = (tenantId: string, onUpdate: (invoice: any) => void) =>
  RealtimeService.subscribeToTenant(tenantId, ['invoices'], {
    onInsert: (payload) => onUpdate(payload.new),
    onUpdate: (payload) => onUpdate(payload.new),
    onDelete: (payload) => onUpdate(payload.old),
  });

export const subscribeToExpenses = (tenantId: string, onUpdate: (expense: any) => void) =>
  RealtimeService.subscribeToTenant(tenantId, ['expenses'], {
    onInsert: (payload) => onUpdate(payload.new),
    onUpdate: (payload) => onUpdate(payload.new),
    onDelete: (payload) => onUpdate(payload.old),
  });

export const subscribeToCustomers = (tenantId: string, onUpdate: (customer: any) => void) =>
  RealtimeService.subscribeToTenant(tenantId, ['customers'], {
    onInsert: (payload) => onUpdate(payload.new),
    onUpdate: (payload) => onUpdate(payload.new),
    onDelete: (payload) => onUpdate(payload.old),
  });
