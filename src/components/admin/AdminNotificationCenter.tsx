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
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  LinearProgress,
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
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAdminRealtime } from '@/hooks/useAdminRealtime';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/exchange-rates';

interface AdminNotificationCenterProps {
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

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AdminNotificationCenter({ open, onClose }: AdminNotificationCenterProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    notifications,
    unreadCount,
    systemStats,
    realtimeMetrics,
    recentActivity,
    markAsRead,
    markAllAsRead,
    refreshStats,
    refreshNotifications,
  } = useAdminRealtime();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
      await Promise.all([refreshStats(), refreshNotifications()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotifications = () => (
    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No system notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System alerts and monitoring notifications will appear here
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
  );

  const renderSystemOverview = () => (
    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
      {/* System Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {systemStats.totalUsers.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                +{realtimeMetrics.newUsersToday} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {systemStats.totalTenants.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Tenants
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                +{realtimeMetrics.newTenantsToday} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <MoneyIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(systemStats.totalRevenue, 'GHS')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Revenue
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                +{formatCurrency(realtimeMetrics.revenueToday, 'GHS')} today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <StorageIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {systemStats.storageUsage.totalFiles.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Files Stored
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'info.main' }}>
                {formatFileSize(systemStats.storageUsage.totalSize)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Storage Usage by Bucket */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Storage Usage by Bucket
          </Typography>
          {Object.entries(systemStats.storageUsage.buckets).map(([bucket, usage]) => (
            <Box key={bucket} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {bucket.replace('-', ' ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {usage.files} files • {formatFileSize(usage.size)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(usage.size / systemStats.storageUsage.totalSize) * 100}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent System Activity
          </Typography>
          {recentActivity.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {recentActivity.slice(0, 5).map((activity, index) => (
                <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <SecurityIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.action} {activity.resource_type}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
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
            <DashboardIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin Center
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Notifications" />
            <Tab label="System Overview" />
          </Tabs>
        </Box>

        {/* Content */}
        {activeTab === 0 ? renderNotifications() : renderSystemOverview()}

        {/* Footer */}
        {activeTab === 0 && notifications.length > 0 && (
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
