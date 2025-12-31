// src/firebase.service.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Settings interface
export interface Settings {
  general: {
    parkName: string;
    contactEmail: string;
    phone: string;
    timezone: string;
    address: string;
    officeHours: string;
    serviceHours: string;
  };
  notifications: {
    email: {
      paymentReminders: boolean;
      intermentConfirmations: boolean;
      newClientRegistration: boolean;
    };
    system: {
      dailyReports: boolean;
      systemMaintenance: boolean;
      lowInventory: boolean;
    };
    reminderDays: number;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      expiryDays: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      require2FA: boolean;
    };
    session: {
      timeoutMinutes: number;
      maxLoginAttempts: number;
    };
  };
  system: {
    database: {
      automaticBackups: boolean;
      dataRetention: boolean;
      backupTime: string;
    };
    maintenance: {
      maintenanceMode: boolean;
      debugMode: boolean;
    };
    info: {
      version: string;
      lastUpdated: string;
      databaseSize: string;
      activeUsers: number;
    };
  };
  updatedAt?: Timestamp;
  updatedBy?: string;
}

// Activity Log interface
export interface ActivityLog {
  id?: string;
  user: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Timestamp;
  type: 'payment' | 'contract' | 'interment' | 'client' | 'lot' | 'user' | 'system';
}

// Firestore collections
const SETTINGS_DOC = 'systemSettings';
const ACTIVITY_LOGS_COLLECTION = 'activityLogs';

/**
 * Fetch system settings from Firestore
 */
export const fetchSettings = async (): Promise<Settings | null> => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as Settings;
    }
    
    return getDefaultSettings();
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

/**
 * Update system settings in Firestore
 */
export const updateSettings = async (
  settings: Partial<Settings>
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const settingsRef = doc(db, 'settings', SETTINGS_DOC);
    
    await setDoc(
      settingsRef,
      {
        ...settings,
        updatedAt: Timestamp.now(),
        updatedBy: user.uid
      },
      { merge: true }
    );

    await logActivity({
      user: user.displayName || user.email || 'Unknown User',
      userId: user.uid,
      action: 'Updated Settings',
      details: `Modified system settings`,
      timestamp: Timestamp.now(),
      type: 'system'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Log user activity
 */
export const logActivity = async (activity: Omit<ActivityLog, 'id'>): Promise<void> => {
  try {
    const logsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    await addDoc(logsRef, activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Fetch activity logs with optional filters
 */
export const fetchActivityLogs = async (
  filters?: {
    type?: string;
    limit?: number;
  }
): Promise<ActivityLog[]> => {
  try {
    const logsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    
    let q = query(
      logsRef,
      orderBy('timestamp', 'desc')
    );

    if (filters?.type && filters.type !== 'all') {
      q = query(
        logsRef,
        where('type', '==', filters.type),
        orderBy('timestamp', 'desc')
      );
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

/**
 * Trigger manual backup
 */
export const triggerManualBackup = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    await logActivity({
      user: user.displayName || user.email || 'Unknown User',
      userId: user.uid,
      action: 'Manual Backup',
      details: 'Initiated manual database backup',
      timestamp: Timestamp.now(),
      type: 'system'
    });

    console.log('Manual backup triggered');
  } catch (error) {
    console.error('Error triggering backup:', error);
    throw error;
  }
};

/**
 * Get default settings
 */
const getDefaultSettings = (): Settings => {
  return {
    general: {
      parkName: 'Dumaguete Memorial Park',
      contactEmail: 'info@dumaguetememorial.com',
      phone: '+63 35 225 1234',
      timezone: 'asia-manila',
      address: '123 Memorial Drive, Dumaguete City, Negros Oriental 6200, Philippines',
      officeHours: '8:00 AM - 5:00 PM',
      serviceHours: '7:00 AM - 6:00 PM'
    },
    notifications: {
      email: {
        paymentReminders: true,
        intermentConfirmations: true,
        newClientRegistration: true
      },
      system: {
        dailyReports: true,
        systemMaintenance: true,
        lowInventory: false
      },
      reminderDays: 7
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        expiryDays: 90,
        requireSpecialChars: true,
        requireNumbers: true,
        require2FA: false
      },
      session: {
        timeoutMinutes: 30,
        maxLoginAttempts: 5
      }
    },
    system: {
      database: {
        automaticBackups: true,
        dataRetention: true,
        backupTime: '02:00'
      },
      maintenance: {
        maintenanceMode: false,
        debugMode: false
      },
      info: {
        version: 'v2.1.4',
        lastUpdated: 'December 10, 2024',
        databaseSize: '245 MB',
        activeUsers: 12
      }
    }
  };
};

export { getDefaultSettings };