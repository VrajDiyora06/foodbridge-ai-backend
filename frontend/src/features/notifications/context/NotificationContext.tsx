import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { socketService } from '../../../services/socket.service';
import { NOTIFICATION_QUERY_KEYS } from '../hooks/useNotificationQueries';
import { ToastContainer, type ToastMessage } from '../../../components/common/Toast';
import type { NotificationItem } from '../types/notification.types';

interface NotificationContextType {
  isConnected: boolean;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const queryClient = useQueryClient();

  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toastData: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toastData, id };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Keep max 5 active toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect();
      setIsConnected(false);
      return;
    }

    const socket = socketService.connect(token);

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time Event Listeners
    socket.on('notification:new', (notification: NotificationItem) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      addToast({
        title: notification.title,
        message: notification.message,
        type: 'info',
      });
    });

    socket.on('notification:read', () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    });

    socket.on('notification:deleted', () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    });

    socket.on('notification:broadcast', (data: { title: string; message: string }) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      addToast({
        title: `📢 ${data.title}`,
        message: data.message,
        type: 'warning',
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification:new');
      socket.off('notification:read');
      socket.off('notification:deleted');
      socket.off('notification:broadcast');
    };
  }, [isAuthenticated, token, queryClient, addToast]);

  return (
    <NotificationContext.Provider value={{ isConnected, toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </NotificationContext.Provider>
  );
};

export const useNotificationSocket = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationSocket must be used within a NotificationProvider');
  }
  return context;
};
