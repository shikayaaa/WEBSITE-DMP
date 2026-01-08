import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertTriangle, X, FileText, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, limit } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'payment_completed' | 'contract_created' | 'interment_completed';
  title: string;
  message: string;
  date?: string;
  createdAt?: any;
  read: boolean;
  priority?: 'high' | 'medium' | 'low';
  userId?: string;
  // Interment-specific fields
  intermentId?: string;
  deceasedName?: string;
  serviceDate?: string;
  serviceTime?: string;
  location?: string;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    // Use currentUser?.uid or userData?.uid depending on your auth implementation
    const userId = currentUser?.uid || userData?.uid;
    
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('🔔 [NOTIFICATIONS] Setting up real-time listener for user:', userId);

    try {
      // Query notifications for the current user
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit to last 50 notifications
      );

      // Real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📬 [NOTIFICATIONS] Received', snapshot.size, 'notifications');
        
        const notificationsList: Notification[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Format date
          let formattedDate = 'Just now';
          if (data.createdAt?.toDate) {
            const date = data.createdAt.toDate();
            formattedDate = new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            }).format(date);
          } else if (data.date) {
            formattedDate = data.date;
          }

          // Determine priority based on type
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (data.type === 'payment_overdue') priority = 'high';
          else if (data.type === 'payment_completed' || data.type === 'interment_completed') priority = 'low';
          
          notificationsList.push({
            id: doc.id,
            type: data.type || 'contract_created',
            title: data.title || 'Notification',
            message: data.message || '',
            date: formattedDate,
            createdAt: data.createdAt,
            read: data.read || false,
            priority: data.priority || priority,
            userId: data.userId,
            // Interment fields
            intermentId: data.intermentId,
            deceasedName: data.deceasedName,
            serviceDate: data.serviceDate,
            serviceTime: data.serviceTime,
            location: data.location,
          });
        });
        
        setNotifications(notificationsList);
        setLoading(false);
      }, (error) => {
        console.error('❌ [NOTIFICATIONS] Error:', error);
        toast.error('Failed to load notifications');
        setLoading(false);
      });

      return () => {
        console.log('🔕 [NOTIFICATIONS] Cleaning up listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Setup error:', error);
      setLoading(false);
    }
  }, [currentUser?.uid, userData?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, {
        read: true,
      });
      
      // Update local state immediately for better UX
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update all unread notifications
      const updatePromises = unreadNotifications.map(notif => {
        const notificationRef = doc(db, 'notifications', notif.id);
        return updateDoc(notificationRef, { read: true });
      });
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const deleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const notificationRef = doc(db, 'notifications', id);
      await deleteDoc(notificationRef);
      
      // Remove from local state immediately
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'payment_due':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'payment_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'contract_created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'interment_completed':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string, read: boolean) => {
    if (read) return 'text-muted-foreground';
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-foreground';
    }
  };

  const getNotificationBg = (priority: string, read: boolean) => {
    if (read) return 'bg-muted/20';
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-background';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-600 hover:bg-red-600">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 hover:bg-muted/10 cursor-pointer transition-colors ${
                          getNotificationBg(notification.priority || 'medium', notification.read)
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium text-sm ${getPriorityColor(notification.priority || 'medium', notification.read)}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                
                                {/* Additional details for interment notifications */}
                                {notification.type === 'interment_completed' && notification.serviceDate && (
                                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                    {notification.serviceDate && (
                                      <p>📅 Service Date: {notification.serviceDate} at {notification.serviceTime}</p>
                                    )}
                                    {notification.location && (
                                      <p>📍 Location: {notification.location}</p>
                                    )}
                                  </div>
                                )}
                                
                                <p className="text-xs text-muted-foreground mt-2">
                                  {notification.date}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => deleteNotification(notification.id, e)}
                                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && (
                        <Separator className="mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && !loading && (
              <>
                <Separator />
                <div className="p-3">
                  <p className="text-xs text-center text-muted-foreground">
                    Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}