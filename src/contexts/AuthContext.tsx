// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Types
interface UserData {
  email: string;
  role: string;
  createdAt: string;
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, additionalData?: Partial<UserData>) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isStaff: () => boolean;
  isAdminOrStaff: () => boolean;
  fetchUserData: (uid: string) => Promise<UserData | null>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        setUserRole(data.role);
        return data;
      } else {
        // Check if user is in staff collection
        const staffDocRef = doc(db, 'staff', uid);
        const staffDoc = await getDoc(staffDocRef);
        
        if (staffDoc.exists()) {
          const data = staffDoc.data() as UserData;
          setUserData(data);
          setUserRole('staff');
          return data;
        }
        
        // Check if user is in admin collection
        const adminDocRef = doc(db, 'admins', uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (adminDoc.exists()) {
          const data = adminDoc.data() as UserData;
          setUserData(data);
          setUserRole('admin');
          return data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Sign Up function
  const signup = async (email: string, password: string, additionalData: Partial<UserData> = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        role: additionalData.role || 'user',
        ...additionalData
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserData(null);
    } catch (error) {
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  // Check if user is staff
  const isStaff = (): boolean => {
    return userRole === 'staff';
  };

  // Check if user is admin or staff
  const isAdminOrStaff = (): boolean => {
    return userRole === 'admin' || userRole === 'staff';
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userRole,
    userData,
    loading,
    signup,
    login,
    logout,
    isAdmin,
    isStaff,
    isAdminOrStaff,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;