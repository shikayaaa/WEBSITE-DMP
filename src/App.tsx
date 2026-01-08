import React from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { doc, collection, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// ✅ User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App Content Component (uses useAuth hook)
function AppContent() {
  const { currentUser, userRole, loading, login, logout } = useAuth();

  // Handle Login
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);

      // ✅ LOG THE LOGIN EVENT
      if (currentUser) {
        try {
          await setDoc(doc(collection(db, 'users', currentUser.uid, 'security_logs')), {
            eventType: 'user_login',
            timestamp: Timestamp.now(),
            ipAddress: 'N/A',
            userAgent: navigator.userAgent,
          });
          console.log('✅ Login event logged successfully');
        } catch (logError) {
          console.error('❌ Could not log login event:', logError);
        }
      }

      alert('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const userId = currentUser?.uid;

      // ✅ LOG THE LOGOUT EVENT BEFORE SIGNING OUT
      if (userId) {
        try {
          await setDoc(doc(collection(db, 'users', userId, 'security_logs')), {
            eventType: 'user_logout',
            timestamp: Timestamp.now(),
            ipAddress: 'N/A',
            userAgent: navigator.userAgent,
          });
          console.log('✅ Logout event logged successfully');
        } catch (logError) {
          console.error('❌ Could not log logout event:', logError);
        }
      }

      await logout();
      alert('Logged out successfully.');
    } catch (error: any) {
      console.error('Logout failed:', error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Not Logged In
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Convert to User type for dashboards
  const user: User = {
    id: currentUser.uid,
    name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || '',
    role: (userRole as 'admin' | 'staff') || 'staff',
  };

  // Render appropriate dashboard
  return userRole === 'admin' ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <StaffDashboard user={user} onLogout={handleLogout} />
  );
}