'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Divider,
  Button,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useRealtime } from '@/hooks/useRealtime';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
};

export default function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useRealtime();

  const handleMarkAsRead = async (notificationId: string) => {
    setIsLoading(true);
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: 18,
                    minWidth: 18,
                  }
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton 
                size="small" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={16} /> : <MarkReadIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <IconButton 
                size="small" 
                onClick={handleMarkAllAsRead}
                disabled={isLoading || unreadCount === 0}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You'll see important updates and alerts here
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      px: 2,
                      py: 1.5,
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.read ? 'none' : 4,
                      borderLeftColor: `${getNotificationColor(notification.type)}.main`,
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              color: 'text.primary'
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: `${getNotificationColor(notification.type)}.main`,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="caption" 
                              color="text.disabled"
                            >
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </Typography>
                            <Chip
                              label={notification.type}
                              size="small"
                              color={getNotificationColor(notification.type) as any}
                              sx={{ 
                                height: 20,
                                fontSize: '0.625rem',
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="caption" color="text.secondary">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </Typography>
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={isLoading || unreadCount === 0}
              startIcon={<MarkReadIcon />}
            >
              Mark all read
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
