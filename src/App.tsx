import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication - in real app this would call an API
    if (email === 'elumirshereeanne@gmail.com' && password === 'Sheree123') {
      setCurrentUser({
        id: '1',
        name: 'Sheree',
        email: 'elumirshereeanne@gmail.com',
        role: 'admin'
      });
    } else if (email === 'jeanmarieaambos@gmail.com' && password === 'jean123') {
      setCurrentUser({
        id: '2',
        name: 'Jean',
        email: 'jeanmarieaambos@gmail.com',
        role: 'staff'
      });
    } else {
      alert('Invalid credentials. Please check your email and password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
}