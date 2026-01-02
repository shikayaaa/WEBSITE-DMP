import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // adjust path as needed

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  businessLicense: string;
  currency: string;
  acceptCash: boolean;
  acceptBankTransfer: boolean;
  acceptCheck: boolean;
  acceptCreditCard: boolean;
  paypalEnabled: boolean;
  gcashEnabled: boolean;
  mayaEnabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface StaffSettings {
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  paymentReminders: boolean;
  overdueAlerts: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
  theme: string;
  sidebarCollapsed: boolean;
  showQuickActions: boolean;
  updatedAt: Date;
}

// Get company settings (shared across all staff)
export const getCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    const docRef = doc(db, 'company_settings', 'config');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as CompanySettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching company settings:', error);
    throw error;
  }
};

// Save company settings
export const saveCompanySettings = async (
  settings: Partial<CompanySettings>,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'company_settings', 'config');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date(),
      updatedBy: userId
    }, { merge: true });
  } catch (error) {
    console.error('Error saving company settings:', error);
    throw error;
  }
};

// Get staff personal settings
export const getStaffSettings = async (userId: string): Promise<StaffSettings | null> => {
  try {
    const docRef = doc(db, 'staff_settings', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as StaffSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching staff settings:', error);
    throw error;
  }
};

// Save staff personal settings
export const saveStaffSettings = async (
  userId: string,
  settings: Partial<StaffSettings>
): Promise<void> => {
  try {
    const docRef = doc(db, 'staff_settings', userId);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving staff settings:', error);
    throw error;
  }
};