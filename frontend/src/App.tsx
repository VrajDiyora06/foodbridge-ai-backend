import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './features/notifications/context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
