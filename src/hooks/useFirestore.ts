// src/hooks/useFirestore.ts
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// PRE-NEED CONTRACTS HOOK
// ==========================================
export function usePreNeedContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);

        const contractsRef = collection(db, 'preNeedAgreements');
        const q = query(contractsRef, orderBy('startDate', 'desc'));
        const querySnapshot = await getDocs(q);

        const contractsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setContracts(contractsList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching contracts:', err);
        setError(err.message || 'Failed to load contracts');
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  return { contracts, loading, error };
}

// ==========================================
// PACKAGE TYPES HOOK
// ==========================================
export function usePackageTypes() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        const packagesRef = collection(db, 'packageTypes');
        const querySnapshot = await getDocs(packagesRef);

        const packagesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setPackages(packagesList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching packages:', err);
        setError(err.message || 'Failed to load packages');
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
}

// ==========================================
// STAFF STATS HOOK
// ==========================================
export function useStaffStats(staffName: string) {
  const [stats, setStats] = useState<{
    myActiveContracts: number;
    myTotalRevenue: number;
    myUpcomingPayments: number;
    myOverdueAccounts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch contracts assigned to this staff member
        const contractsRef = collection(db, 'preNeedAgreements');
        const q = query(contractsRef, where('assignedStaff', '==', staffName));
        const querySnapshot = await getDocs(q);

        const contracts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const myActiveContracts = contracts.filter(
          (c: any) => c.status === 'active'
        ).length;

        const myTotalRevenue = contracts.reduce(
          (sum: number, c: any) => sum + ((c.totalAmount || 0) - (c.remainingBalance || 0)),
          0
        );

        // Upcoming payments (contracts with next payment due within 7 days)
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const myUpcomingPayments = contracts.filter((c: any) => {
          if (!c.nextPaymentDue) return false;
          const dueDate = c.nextPaymentDue.toDate ? c.nextPaymentDue.toDate() : new Date(c.nextPaymentDue);
          return dueDate >= now && dueDate <= sevenDaysFromNow;
        }).length;

        // Overdue accounts
        const myOverdueAccounts = contracts.filter(
          (c: any) => c.status === 'overdue'
        ).length;

        setStats({
          myActiveContracts,
          myTotalRevenue,
          myUpcomingPayments,
          myOverdueAccounts
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching staff stats:', err);
        setError(err.message || 'Failed to load stats');
        setLoading(false);
      }
    };

    if (staffName) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [staffName]);

  return { stats, loading, error };
}

// ==========================================
// PAYMENTS HOOK
// ==========================================
export function usePayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentsRef = collection(db, 'payments');
        const q = query(paymentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const paymentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setPayments(paymentsList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching payments:', err);
        setError(err.message || 'Failed to load payments');
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return { payments, loading, error };
}

// ==========================================
// INTERMENT REQUESTS HOOK
// ==========================================
export function useIntermentRequests() {
  const [interments, setInterments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterments = async () => {
      try {
        setLoading(true);
        setError(null);

        const intermentsRef = collection(db, 'interment_requests');
        const q = query(intermentsRef, orderBy('preferredDate', 'asc'));
        const querySnapshot = await getDocs(q);

        const intermentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setInterments(intermentsList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching interments:', err);
        setError(err.message || 'Failed to load interments');
        setLoading(false);
      }
    };

    fetchInterments();
  }, []);

  return { interments, loading, error };
}

// ==========================================
// LOTS HOOK
// ==========================================
export function useLots() {
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        setLoading(true);
        setError(null);

        const lotsRef = collection(db, 'lots');
        const querySnapshot = await getDocs(lotsRef);

        const lotsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLots(lotsList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching lots:', err);
        setError(err.message || 'Failed to load lots');
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  return { lots, loading, error };
}

// ==========================================
// REAL-TIME CONTRACTS HOOK (with live updates)
// ==========================================
export function useRealtimeContracts() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const contractsRef = collection(db, 'preNeedAgreements');
      const q = query(contractsRef, orderBy('startDate', 'desc'));

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const contractsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setContracts(contractsList);
          setLoading(false);
        },
        (err) => {
          console.error('Error in real-time contracts:', err);
          setError(err.message || 'Failed to load contracts');
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up real-time contracts:', err);
      setError(err.message || 'Failed to setup real-time updates');
      setLoading(false);
    }
  }, []);

  return { contracts, loading, error };
}

// ==========================================
// USERS HOOK
// ==========================================
export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setUsers(usersList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}

// ==========================================
// STAFF HOOK
// ==========================================
export function useStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);

        const staffRef = collection(db, 'staff');
        const querySnapshot = await getDocs(staffRef);

        const staffList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStaff(staffList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching staff:', err);
        setError(err.message || 'Failed to load staff');
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return { staff, loading, error };
}

// Hook for fetching deed of sales
export function useDeedOfSales() {
  const [deeds, setDeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'deedOfSales'),
      orderBy('saleDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const deedsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeeds(deedsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching deeds:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { deeds, loading, error };
}

// Hook for staff-specific stats
export function useStaffDeedStats(staffName: string) {
  const [stats, setStats] = useState({
    myCompletedDeeds: 0,
    myPendingDeeds: 0,
    myTotalValue: 0,
    thisMonthDeeds: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'deedOfSales'),
      where('assistedBy', '==', staffName)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const myDeeds = snapshot.docs.map((doc) => doc.data());
      
      const completed = myDeeds.filter((d) => d.status === 'completed').length;
      const pending = myDeeds.filter(
        (d) => d.status === 'pending-notarization' || d.status === 'pending-documents'
      ).length;
      const totalValue = myDeeds.reduce((sum, deed) => sum + (deed.purchasePrice || 0), 0);
      
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const thisMonth = myDeeds.filter(
        (d) => d.saleDate?.startsWith(currentMonth)
      ).length;

      setStats({
        myCompletedDeeds: completed,
        myPendingDeeds: pending,
        myTotalValue: totalValue,
        thisMonthDeeds: thisMonth,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [staffName]);

  return { stats, loading };
}