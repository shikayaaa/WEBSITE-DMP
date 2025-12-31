// src/hooks/useFirestore.js
// UPDATED VERSION - Checks both preneed_contracts AND preNeedAgreements

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ==================== PRE-NEED CONTRACTS ====================

// Hook to fetch all pre-need contracts (checks both collection names)
export const usePreNeedContracts = (statusFilter = null, assignedStaff = null) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const setupListener = async () => {
      try {
        // First, check which collection exists and has data
        let collectionName = 'preneed_contracts';
        
        // Try preneed_contracts first
        const preneedSnapshot = await getDocs(collection(db, 'preneed_contracts'));
        const preNeedAgreementsSnapshot = await getDocs(collection(db, 'preNeedAgreements'));
        
        console.log('📊 Collection Check:');
        console.log('  preneed_contracts:', preneedSnapshot.size, 'documents');
        console.log('  preNeedAgreements:', preNeedAgreementsSnapshot.size, 'documents');
        
        // Use whichever collection has data
        if (preNeedAgreementsSnapshot.size > 0 && preneedSnapshot.size === 0) {
          collectionName = 'preNeedAgreements';
          console.log('✅ Using collection: preNeedAgreements');
        } else {
          console.log('✅ Using collection: preneed_contracts');
        }
        
        // Build query
        let q = query(collection(db, collectionName));
        
        const constraints = [];
        if (statusFilter && statusFilter !== 'all') {
          constraints.push(where('status', '==', statusFilter));
        }
        if (assignedStaff) {
          constraints.push(where('assignedStaff', '==', assignedStaff));
        }
        
        if (constraints.length > 0) {
          q = query(collection(db, collectionName), ...constraints);
        }

        // Set up real-time listener
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log(`📥 Received ${snapshot.size} contracts from ${collectionName}`);
            
            const contractsData = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Contract data:', data);
              
              return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamps to JavaScript Dates
                startDate: data.startDate?.toDate?.() || data.startDate,
                endDate: data.endDate?.toDate?.() || data.endDate,
                nextPaymentDue: data.nextPaymentDue?.toDate?.() || data.nextPaymentDue,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt
              };
            });
            
            // Sort by creation date (newest first)
            contractsData.sort((a, b) => {
              const aTime = a.createdAt?.getTime?.() || 0;
              const bTime = b.createdAt?.getTime?.() || 0;
              return bTime - aTime;
            });
            
            console.log('✅ Processed contracts:', contractsData);
            setContracts(contractsData);
            setLoading(false);
          },
          (err) => {
            console.error('❌ Error fetching pre-need contracts:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('❌ Error setting up listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [statusFilter, assignedStaff]);

  return { contracts, loading, error };
};

// ==================== PACKAGE TYPES ====================

// Hook to fetch all package types (checks both collection names)
export const usePackageTypes = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    
    const setupListener = async () => {
      try {
        // Check which collection exists
        let collectionName = 'preneed_packages';
        
        const preneedSnapshot = await getDocs(collection(db, 'preneed_packages'));
        const packageTypesSnapshot = await getDocs(collection(db, 'packageTypes'));
        
        console.log('📦 Package Collections:');
        console.log('  preneed_packages:', preneedSnapshot.size, 'documents');
        console.log('  packageTypes:', packageTypesSnapshot.size, 'documents');
        
        if (packageTypesSnapshot.size > 0 && preneedSnapshot.size === 0) {
          collectionName = 'packageTypes';
          console.log('✅ Using collection: packageTypes');
        } else {
          console.log('✅ Using collection: preneed_packages');
        }
        
        const q = query(collection(db, collectionName));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const packagesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Sort by price
            packagesData.sort((a, b) => (a.price || 0) - (b.price || 0));
            
            console.log('✅ Loaded packages:', packagesData);
            setPackages(packagesData);
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching packages:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up package listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { packages, loading, error };
};

// ==================== STAFF STATISTICS ====================

// Get staff-specific statistics (checks both collection names)
export const useStaffStats = (staffName) => {
  const [stats, setStats] = useState({
    myActiveContracts: 0,
    myTotalRevenue: 0,
    myUpcomingPayments: 0,
    myOverdueAccounts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staffName) {
      setLoading(false);
      return;
    }

    let unsubscribe;
    
    const setupListener = async () => {
      try {
        // Check which collection to use
        let collectionName = 'preneed_contracts';
        
        const preneedSnapshot = await getDocs(collection(db, 'preneed_contracts'));
        const preNeedAgreementsSnapshot = await getDocs(collection(db, 'preNeedAgreements'));
        
        if (preNeedAgreementsSnapshot.size > 0 && preneedSnapshot.size === 0) {
          collectionName = 'preNeedAgreements';
        }
        
        const q = query(
          collection(db, collectionName),
          where('assignedStaff', '==', staffName)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            let myActiveContracts = 0;
            let myTotalRevenue = 0;
            let myUpcomingPayments = 0;
            let myOverdueAccounts = 0;
            
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            snapshot.forEach(doc => {
              const contractData = doc.data();
              
              if (contractData.status === 'active') {
                myActiveContracts++;
              }
              
              if (contractData.status === 'overdue') {
                myOverdueAccounts++;
              }
              
              // Calculate revenue collected
              myTotalRevenue += (contractData.totalAmount || 0) - (contractData.remainingBalance || 0);
              
              // Check for upcoming payments
              if (contractData.nextPaymentDue) {
                const dueDate = contractData.nextPaymentDue.toDate?.() || new Date(contractData.nextPaymentDue);
                if (dueDate >= now && dueDate <= nextWeek) {
                  myUpcomingPayments++;
                }
              }
            });
            
            setStats({
              myActiveContracts,
              myTotalRevenue,
              myUpcomingPayments,
              myOverdueAccounts
            });
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching staff stats:', err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up stats listener:', err);
        setLoading(false);
      }
    };
    
    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [staffName]);

  return { stats, loading };
};