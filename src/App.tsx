import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';

// ✅ Import Firebase Auth
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 🔹 Handle Login using Firebase Authentication
  const handleLogin = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Temporary manual role assignment (later can store in Firestore)
      let role: 'admin' | 'staff' = 'staff';
      if (email === 'elumirshereeanne@gmail.com') role = 'admin';

      setCurrentUser({
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        role,
      });
    } catch (error: any) {
      alert(`Login failed: ${error.message}`);
    }
  };

  // 🔹 Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  // 🔹 Conditional Rendering
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <StaffDashboard user={currentUser} onLogout={handleLogout} />;
}
