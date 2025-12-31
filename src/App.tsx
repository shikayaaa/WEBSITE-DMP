import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { StaffDashboard } from './components/StaffDashboard';

// ✅ Import Firebase Auth
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, setDoc, Timestamp, getDoc } from 'firebase/firestore';

// ✅ User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

// ✅ Create a simple Auth Context
interface AuthContextType {
  currentUser: any;
  userRole: string | null;
  userData: any;
}

export const AuthContext = React.createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userData: null
});

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'admin' | 'staff' = 'staff';
          
          if (userDoc.exists()) {
            role = userDoc.data().role || 'staff';
          } else if (user.email === 'elumirshereeanne@gmail.com') {
            role = 'admin';
          }
          
          setCurrentUser({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Handle Login using Firebase Authentication
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ LOG THE LOGIN EVENT
      try {
        await setDoc(doc(collection(db, 'users', user.uid, 'security_logs')), {
          eventType: 'user_login',
          timestamp: Timestamp.now(),
          ipAddress: 'N/A',
          userAgent: navigator.userAgent,
        });
        console.log('✅ Login event logged successfully');
      } catch (logError) {
        console.error('❌ Could not log login event:', logError);
      }

      // User will be set by onAuthStateChanged
      alert('Login successful!');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  // 🔹 Handle Logout
  const handleLogout = async () => {
    try {
      const userId = auth.currentUser?.uid;

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

      await signOut(auth);
      setCurrentUser(null);
      alert('Logged out successfully.');
    } catch (error: any) {
      console.error('Logout failed:', error);
      alert(`Logout failed: ${error.message}`);
    }
  };

  // 🔹 Auth Context Value
  const authContextValue: AuthContextType = {
    currentUser: firebaseUser,
    userRole: currentUser?.role || null,
    userData: currentUser
  };

  // 🔹 Conditional Rendering
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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ✅ Provide Auth Context to all components
  return (
    <AuthContext.Provider value={authContextValue}>
      {currentUser.role === 'admin' ? (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <StaffDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </AuthContext.Provider>
  );
}