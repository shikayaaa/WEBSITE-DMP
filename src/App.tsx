import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';

// ✅ Import Firebase Auth
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// ✅ User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Handle Login using Firebase Authentication
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Temporary manual role assignment (you can later use Firestore for this)
      let role: 'admin' | 'staff' = 'staff';
      if (email === 'elumirshereeanne@gmail.com') role = 'admin';

      setCurrentUser({
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        role,
      });

      alert('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      alert('Logged out successfully.');
    } catch (error: any) {
      console.error('Logout failed:', error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  // 🔹 Conditional Rendering
  if (loading) {
    return <div style={{ padding: 20 }}>Logging in...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
}
