import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Download, Calendar, DollarSign, Users, Package, FileText, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';


interface PreNeedPlan {
  id: string;
  contractId?: string;
  client: string;
  planType: string;
  lotSize: string;
  totalAmount: number;
  downPayment: number;
  monthlyPayment: number;
  termMonths: number;
  paidMonths: number;
  remainingBalance: number;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  startDate: string;
  endDate: string;
  contact: string;
  email: string;
  beneficiary: string;
  notes: string;
  createdAt?: any;
  userId?: string;
}

interface PackageType {
  id?: string;  // ADD THIS LINE
  name: string;
  price: number;
  description: string;
   lotSize?: string;  // ADD THIS LINE
  category?: string;
}
export function PreNeedPurchase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [preNeedPlans, setPreNeedPlans] = useState<PreNeedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PreNeedPlan | null>(null);
const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
const [isLoadingPackages, setIsLoadingPackages] = useState(true);
const [isViewPackageDialogOpen, setIsViewPackageDialogOpen] = useState(false);
const [isEditPackageDialogOpen, setIsEditPackageDialogOpen] = useState(false);
  const [editPackageData, setEditPackageData] = useState({
  name: '',
  price: 0,
  description: ''
});
// Form state
  const [formData, setFormData] = useState({
    clientName: '',
    contact: '',
    email: '',
    beneficiary: '',
    packageType: '',
    downPayment: 0,
    term: '',
    startDate: '',
    notes: ''
  });

 // Load packages from Firebase
useEffect(() => {
  loadPackages();
}, []);

const loadPackages = async () => {
  try {
    setIsLoadingPackages(true);
    const packagesSnapshot = await getDocs(collection(db, 'packageTypes'));
    
    const packages: PackageType[] = [];
    packagesSnapshot.forEach((doc) => {
      const data = doc.data();
     packages.push({
  id: doc.id,
  name: data.name || '',
  price: Number(data.price) || 0,
  description: data.description || '',
  lotSize: data.lotSize || '',      // ADD THIS LINE
  category: data.category || ''      // ADD THIS LINE
});
    });
    
    // Sort by price (low to high)
    packages.sort((a, b) => a.price - b.price);
    
    setPackageTypes(packages);
    setIsLoadingPackages(false);
  } catch (error) {
    console.error('Error loading packages:', error);
    alert('❌ Error loading packages from database');
    setIsLoadingPackages(false);
  }
};

  // Check user role on mount
  useEffect(() => {
    checkUserRole();
  }, []);

  // Load plans when user role is determined
  useEffect(() => {
    if (userRole !== null) {
      loadPreNeedPlans();
    }
  }, [userRole]);

  const checkUserRole = async () => {
    const user = auth.currentUser;
    if (!user) {
      setUserRole('guest');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is admin
      const adminDoc = await getDocs(query(collection(db, 'admins'), where('__name__', '==', user.uid)));
      if (!adminDoc.empty) {
        setUserRole('admin');
        return;
      }

      // Check if user is staff
      const staffDoc = await getDocs(query(collection(db, 'staff'), where('__name__', '==', user.uid)));
      if (!staffDoc.empty) {
        setUserRole('staff');
        return;
      }

      // Default to user
      setUserRole('user');
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('user');
    }
  };

  const loadPreNeedPlans = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;

      let plans: PreNeedPlan[] = [];

      if (!user) {
        setPreNeedPlans([]);
        setIsLoading(false);
        return;
      }

      // Fetch all documents
      const querySnapshot = await getDocs(collection(db, 'preNeedAgreements'));

     let contractCounter = 1;

querySnapshot.forEach((doc) => {
  const data = doc.data();
  
  // Filter based on role
  // Admin and staff can see all, users can only see their own
  if (userRole === 'admin' || userRole === 'staff' || data.userId === user.uid) {
    // Generate sequential contract ID
    const contractId = data.contractId || `PN-${String(contractCounter).padStart(3, '0')}`;
    contractCounter++;
plans.push({
  id: doc.id,
  contractId: contractId,
  client: data.client || '',
  planType: data.planType || '',
  lotSize: data.lotSize || '',
  totalAmount: Number(data.totalAmount) || 0,
  downPayment: Number(data.downPayment) || 0,
  monthlyPayment: Number(data.monthlyPayment) || 0,
  termMonths: Number(data.termMonths) || 0,
  paidMonths: Number(data.paidMonths) || 0,
  remainingBalance: Number(data.remainingBalance) || 0,
            status: data.status || 'active',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            contact: data.contact || '',
            email: data.email || '',
            beneficiary: data.beneficiary || '',
            notes: data.notes || '',
            createdAt: data.createdAt || Timestamp.now(),
            userId: data.userId || '',
          });
        }
      });

      // Sort by creation date (newest first)
      plans.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setPreNeedPlans(plans);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error loading pre-need plans:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      setIsLoading(false);

      if (error.code === 'permission-denied') {
        alert('❌ Error: Permission denied. Check Firestore rules.');
      } else if (error.code === 'failed-precondition') {
        alert('❌ Error: Index required. Check console for link.');
      } else {
        alert(`❌ Error: ${error.message}`);
      }
    }
  };
 // Migration function to update existing contracts with PN-XXX IDs
  const migrateContractIds = async () => {
    if (!confirm('This will update all contracts without a contractId to use the PN-XXX format. Continue?')) {
      return;
    }

    try {
      setIsLoading(true);
      const contractsSnapshot = await getDocs(collection(db, 'preNeedAgreements'));
      let counter = 1;
      let updatedCount = 0;
      
      for (const contractDoc of contractsSnapshot.docs) {
        const data = contractDoc.data();
        
        // Only update if contractId doesn't exist
        if (!data.contractId) {
          const newContractId = `PN-${String(counter).padStart(3, '0')}`;
          
          await updateDoc(doc(db, 'preNeedAgreements', contractDoc.id), {
            contractId: newContractId
          });
          
          console.log(`✅ Updated ${contractDoc.id} to ${newContractId}`);
          updatedCount++;
          counter++;
        } else {
          counter++;
        }
      }
      
      alert(`✅ Migration complete! Updated ${updatedCount} contract(s) with PN-XXX IDs`);
      setIsLoading(false);
      loadPreNeedPlans(); // Reload to show updated IDs
    } catch (error) {
      console.error('Migration error:', error);
      alert('❌ Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsLoading(false);
    }
  };

  const handleViewPackage = (pkg: PackageType) => {
  setSelectedPackage(pkg);
  setIsViewPackageDialogOpen(true);
};

const handleEditPackage = (pkg: PackageType) => {
  setSelectedPackage(pkg);
  setEditPackageData({
    name: pkg.name,
    price: pkg.price,
    description: pkg.description
  });
  setIsEditPackageDialogOpen(true);
};

const handleSavePackageChanges = async () => {
  if (!selectedPackage || !selectedPackage.id) return;
  
  if (!editPackageData.name || !editPackageData.price || !editPackageData.description) {
    alert('❌ Error: Please fill in all fields');
    return;
  }

  try {
    await updateDoc(doc(db, 'packageTypes', selectedPackage.id), {
      name: editPackageData.name,
      price: editPackageData.price,
      description: editPackageData.description
    });
    
 alert('✅ Success: Package updated successfully');
    setIsEditPackageDialogOpen(false);
    loadPackages();
  } catch (error) {
    console.error('Error updating package:', error);
    alert('❌ Error: Failed to update package');
  }
};
const setupInitialPackages = async () => {
  if (!confirm('This will create initial package types from official price list in Firebase. Continue?')) {
    return;
  }

  try {
    // Check if packages already exist
    const existingPackages = await getDocs(collection(db, 'packageTypes'));
    
    // Create a Set of existing package names
    const existingNames = new Set<string>();
    existingPackages.forEach(doc => {
      existingNames.add(doc.data().name);
    });

    const initialPackages = [
      { name: 'Lawn Area - Prime', price: 79461.00, description: 'Double Tiered Lawn lot in Garden Areas', lotSize: '2x2m', category: 'Lawn Area' },
      { name: 'Lawn Area - Special Premium', price: 76133.00, description: 'Special Premium lawn lot beside the road', lotSize: '2x2m', category: 'Lawn Area' },
      { name: 'Lawn Area - Premium', price: 72406.00, description: 'Premium lawn lot nearest to road/walkway', lotSize: '2x2m', category: 'Lawn Area' },
      { name: 'Lawn Area - Regular', price: 69478.00, description: 'Regular lawn lot', lotSize: '2x2m', category: 'Lawn Area' },
      { name: 'Memorial Garden - Special Premium', price: 391315.00, description: 'Special Premium memorial garden lot beside road', lotSize: '3x3m', category: 'Memorial Garden' },
      { name: 'Memorial Garden - Premium', price: 346726.00, description: 'Premium memorial garden lot nearest to road', lotSize: '3x3m', category: 'Memorial Garden' },
      { name: 'Memorial Garden - Regular', price: 306796.00, description: 'Regular memorial garden lot', lotSize: '3x3m', category: 'Memorial Garden' },
      { name: 'Garden Family Estate - Special Premium', price: 851308.00, description: 'Special Premium garden family estate', lotSize: '4x4m', category: 'Garden Family Estate' },
      { name: 'Garden Family Estate - Premium', price: 784093.00, description: 'Premium family estate along walkways', lotSize: '4x4m', category: 'Garden Family Estate' },
      { name: 'Family Estate - Premier', price: 1927501.00, description: 'Premier Family Estate (Mausoleum)', lotSize: '5x5m', category: 'Family Estate' },
      { name: 'Family Estate - Prestige', price: 1053473.00, description: 'Prestige Family Estate (Mausoleum)', lotSize: '4x5m', category: 'Family Estate' },
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const pkg of initialPackages) {
      // Only add if it doesn't already exist
      if (!existingNames.has(pkg.name)) {
        await addDoc(collection(db, 'packageTypes'), pkg);
        addedCount++;
      } else {
        skippedCount++;
      }
    }
    
    alert(`✅ Success: Added ${addedCount} new package(s), skipped ${skippedCount} existing package(s)!`);
    loadPackages();
  } catch (error) {
    console.error('Error creating packages:', error);
    alert('❌ Error: Failed to create initial packages');
  }
};

const removeDuplicatePackages = async () => {
  if (!confirm('This will remove duplicate packages. Continue?')) {
    return;
  }

  try {
    setIsLoadingPackages(true);
    const packagesSnapshot = await getDocs(collection(db, 'packageTypes'));
    
    const seenNames = new Set<string>();
    const duplicatesToDelete: string[] = [];
    
    packagesSnapshot.forEach((doc) => {
      const data = doc.data();
      const packageName = data.name;
      
      if (seenNames.has(packageName)) {
        // This is a duplicate
        duplicatesToDelete.push(doc.id);
      } else {
        // First occurrence, keep it
        seenNames.add(packageName);
      }
    });
    
    // Delete duplicates
    for (const docId of duplicatesToDelete) {
      await deleteDoc(doc(db, 'packageTypes', docId));
    }
    
    alert(`✅ Success: Removed ${duplicatesToDelete.length} duplicate package(s)!`);
    loadPackages();
    setIsLoadingPackages(false);
  } catch (error) {
    console.error('Error removing duplicates:', error);
    alert('❌ Error: Failed to remove duplicates');
    setIsLoadingPackages(false);
  }
};
const handleCreatePlan = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert('❌ Error: You must be logged in to create a plan');
      return;
    }

    if (!formData.clientName || !formData.contact || !formData.email || !formData.packageType || !formData.term || !formData.startDate) {
      alert('❌ Error: Please fill in all required fields');
      return;
    }

    const selectedPackage = packageTypes.find(pkg => pkg.name === formData.packageType);
    if (!selectedPackage) return;

    const totalAmount = selectedPackage.price;
    const downPayment = formData.downPayment || 0;
    const remainingAfterDown = totalAmount - downPayment;
    const termMonths = parseInt(formData.term);
    const monthlyPayment = Math.ceil(remainingAfterDown / termMonths);

    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);

    // Get lot size from the selected package
    const lotSize = selectedPackage.lotSize || '2x2m';

    const existingPlans = await getDocs(collection(db, 'preNeedAgreements'));
    const contractId = `PN-${String(existingPlans.size + 1).padStart(3, '0')}`;

    const newPlan: Omit<PreNeedPlan, 'id'> = {
      contractId: contractId,
      client: formData.clientName,
      planType: formData.packageType,
lotSize: lotSize,
      totalAmount,
      downPayment,
      monthlyPayment,
      termMonths,
      paidMonths: downPayment > 0 ? 1 : 0,
      remainingBalance: remainingAfterDown,
      status: 'active',
      startDate: formData.startDate,
      endDate: endDate.toISOString().split('T')[0],
      contact: formData.contact,
      email: formData.email,
      beneficiary: formData.beneficiary,
      notes: formData.notes,
      createdAt: Timestamp.now(),
      userId: user.uid,
    };

    await addDoc(collection(db, 'preNeedAgreements'), newPlan);

    alert('✅ Success: Pre-need plan created successfully');

    setFormData({
      clientName: '',
      contact: '',
      email: '',
      beneficiary: '',
      packageType: '',
      downPayment: 0,
      term: '',
      startDate: '',
      notes: ''
    });
    setIsDialogOpen(false);
    loadPreNeedPlans();
  } catch (error: any) {
    console.error('Error creating plan:', error);
    alert(`❌ Error: ${error.message}`);
  }
};
// Then continue with handleDeletePlan, etc...

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await deleteDoc(doc(db, 'preNeedAgreements', planId));
      alert('✅ Success: Plan deleted successfully');
      loadPreNeedPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('❌ Error: Failed to delete plan');
    }
  };

  const handleUpdateStatus = async (planId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'preNeedAgreements', planId), {
        status: newStatus
      });
      alert('✅ Success: Status updated successfully');
      loadPreNeedPlans();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error: Failed to update status');
    }
  };

  const handleViewPlan = (plan: PreNeedPlan) => {
  setSelectedPlan(plan);
  setIsViewDialogOpen(true);
};

const handleEditPlan = (plan: PreNeedPlan) => {
  setSelectedPlan(plan);
  setFormData({
    clientName: plan.client,
    contact: plan.contact,
    email: plan.email,
    beneficiary: plan.beneficiary,
    packageType: plan.planType,
    downPayment: plan.downPayment,
    term: plan.termMonths.toString(),
    startDate: plan.startDate,
    notes: plan.notes
  });
  setIsEditDialogOpen(true);
};
const handleSaveEdit = async () => {
  try {
    if (!selectedPlan) return;
    
    const user = auth.currentUser;
    if (!user) {
      alert('❌ Error: You must be logged in to edit a plan');
      return;
    }

    if (!formData.clientName || !formData.contact || !formData.email || !formData.packageType || !formData.term || !formData.startDate) {
      alert('❌ Error: Please fill in all required fields');
      return;
    }

    const selectedPackage = packageTypes.find(pkg => pkg.name === formData.packageType);
    if (!selectedPackage) return;

    const totalAmount = selectedPackage.price;
    const downPayment = formData.downPayment || 0;
    const remainingAfterDown = totalAmount - downPayment;
    const termMonths = parseInt(formData.term);
    const monthlyPayment = Math.ceil(remainingAfterDown / termMonths);

    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);

    // Get lot size from the selected package
    const lotSize = selectedPackage.lotSize || '2x2m';
    // Update the document in Firebase
    await updateDoc(doc(db, 'preNeedAgreements', selectedPlan.id), {
      client: formData.clientName,
      planType: formData.packageType,
lotSize: lotSize,
      totalAmount,
      downPayment,
      monthlyPayment,
      termMonths,
      remainingBalance: remainingAfterDown,
      startDate: formData.startDate,
      endDate: endDate.toISOString().split('T')[0],
      contact: formData.contact,
      email: formData.email,
      beneficiary: formData.beneficiary,
      notes: formData.notes,
    });

    alert('✅ Success: Plan updated successfully');
    setIsEditDialogOpen(false);
    loadPreNeedPlans(); // Reload the plans to show updated data
  } catch (error: any) {
    console.error('Error updating plan:', error);
    alert(`❌ Error: ${error.message}`);
  }
};

const handleGenerateDeed = async (plan: PreNeedPlan) => {
  if (!confirm(`Generate Deed of Sale for ${plan.client}?\n\nThis will create an official deed document.`)) {
    return;
  }

  try {
    const currentYear = new Date().getFullYear();
    
    // Get all deeds for this year to generate next ID
    const deedsSnapshot = await getDocs(collection(db, 'deedOfSales'));
    const currentYearDeeds: any[] = [];
    
    deedsSnapshot.forEach((doc) => {
      const deedId = doc.data().deedId || '';
      if (deedId.startsWith(`DOS-${currentYear}`)) {
        currentYearDeeds.push(doc.data());
      }
    });
    
    const nextNumber = currentYearDeeds.length + 1;
    const deedId = `DOS-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    
    // Get current date
    const today = new Date().toISOString().split('T')[0];

    // Create the deed
    const newDeed = {
      deedId: deedId,
      contractId: plan.contractId,
      clientName: plan.client,
      lotNumber: plan.lotSize,
      block: plan.planType,
      saleDate: today,
amount: `₱${plan.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,      status: 'pending',
      notarizedBy: '',
      registrationNumber: '',
      titleNumber: '',
      notes: `Generated from Pre-Need Contract ${plan.contractId}\nPayment completed on ${today}`,
      template: 'DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE',
      preNeedContractId: plan.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'deedOfSales'), newDeed);

    alert(`✅ Success: Deed of Sale ${deedId} generated successfully!\n\nYou can now find it in the Deed of Sale section.`);
  } catch (error: any) {
    console.error('Error generating deed:', error);
    alert(`❌ Error: ${error.message}`);
  }
};
  const filteredPlans = preNeedPlans.filter(plan => {
    const matchesSearch = plan.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (paidMonths: number, termMonths: number) => {
    return Math.round((paidMonths / termMonths) * 100);
  };

const totalActiveContracts = preNeedPlans.filter(p => p.status === 'active').length;

// Total Revenue = Sum of all amounts paid (totalAmount - remainingBalance)
const totalRevenue = preNeedPlans.reduce((sum, plan) => {
  const paid = (plan.totalAmount || 0) - (plan.remainingBalance || 0);
  return sum + paid;
}, 0);

// Outstanding = Sum of ALL remaining balances from ALL plans
// Outstanding = Sum of ALL remaining balances from ALL plans
const totalOutstanding = preNeedPlans.reduce((sum, plan) => {
  const balance = Number(plan.remainingBalance) || 0;
  return sum + balance;
}, 0);
const overdueContracts = preNeedPlans.filter(p => p.status === 'overdue').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pre-need plans...</p>
        </div>
      </div>
    );
  }

  return (
   <div className="space-y-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <h2 className="text-2xl font-bold">Pre-Need Purchase</h2>
      <p className="text-gray-600">Manage pre-need memorial plans and contracts</p>
    </div>
    
    {/* BUTTONS - ONLY ONE SECTION */}
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={migrateContractIds}
        className="border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        <Download className="h-4 w-4 mr-2" />
        Migrate IDs
      </Button>
      
    <Button 
  variant="outline" 
  onClick={setupInitialPackages}
  className="border-green-500 text-green-600 hover:bg-green-50"
>
  <Download className="h-4 w-4 mr-2" />
  Setup Packages
</Button>

<Button 
  variant="outline" 
  onClick={removeDuplicatePackages}
  className="border-red-500 text-red-600 hover:bg-red-50"
>
  <Download className="h-4 w-4 mr-2" />
  Remove Duplicates
</Button>

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Pre-Need Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Pre-Need Plan</DialogTitle>
            <DialogDescription>Set up a new pre-need memorial plan for a client</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name *</Label>
                <Input 
                  id="client-name" 
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input 
                  id="contact" 
                  placeholder="+63 912 345 6789"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary</Label>
                <Input 
                  id="beneficiary" 
                  placeholder="Enter beneficiary name"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({...formData, beneficiary: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="package">Package Type *</Label>
              <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map((pkg, index) => (
                    <SelectItem key={index} value={pkg.name}>
                      {pkg.name} - ₱{pkg.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="down-payment">Down Payment (₱)</Label>
                <Input 
                  id="down-payment" 
                  type="number" 
                  placeholder="0"
                  value={formData.downPayment || ''}
                  onChange={(e) => setFormData({...formData, downPayment: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Payment Term *</Label>
                <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                 <SelectContent>
  <SelectItem value="12">12 months</SelectItem>
  <SelectItem value="36">36 months</SelectItem>
  <SelectItem value="60">60 months</SelectItem>
</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date *</Label>
                <Input 
                  id="start-date" 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Any special requirements or notes..." 
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreatePlan}>Create Plan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  {/* Summary Cards continue here... */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Contracts</p>
                <p className="text-xl font-bold text-blue-600">{totalActiveContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">₱{(totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
               <p className="text-xl font-bold text-orange-600">₱{(totalOutstanding || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-xl font-bold text-red-600">{overdueContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Pre-Need Contracts</TabsTrigger>
          <TabsTrigger value="packages">Package Types</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Need Contracts</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                          No pre-need plans found. Create your first plan to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans.map((plan) => (
                        <TableRow key={plan.id}>
                 <TableCell className="font-medium">{plan.contractId || `PN-${String(filteredPlans.indexOf(plan) + 1).padStart(3, '0')}`}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{plan.client}</p>
                              <p className="text-sm text-gray-500">{plan.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{plan.planType}</p>
                              <p className="text-sm text-gray-500">{plan.lotSize}</p>
                            </div>
                          </TableCell>
                  <TableCell>₱{plan.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="space-y-1 min-w-[120px]">
                              <div className="flex justify-between text-sm">
                                <span>{plan.paidMonths}/{plan.termMonths} months</span>
                                <span className="font-medium">{calculateProgress(plan.paidMonths, plan.termMonths)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all" 
                                  style={{ width: `${calculateProgress(plan.paidMonths, plan.termMonths)}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>₱{plan.remainingBalance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(plan.status)}>
                              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                            </Badge>
                          </TableCell>
 <TableCell>
  <div className="flex items-center gap-2">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleViewPlan(plan)}
      className="h-8 w-8 p-0"
      title="View Details"
    >
      <Eye className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleEditPlan(plan)}
      className="h-8 w-8 p-0"
      title="Edit Plan"
    >
      <Edit className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleDeletePlan(plan.id)}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      title="Delete Plan"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
    {plan.status === 'completed' && plan.remainingBalance === 0 && (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => handleGenerateDeed(plan)}
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        title="Generate Deed of Sale"
      >
        <FileText className="h-4 w-4" />
      </Button>
    )}
  </div>
</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Package Types</CardTitle>
              <p className="text-sm text-gray-600">Manage pre-need package offerings</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTypes.map((pkg, index) => (
                  <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">₱{pkg.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                     <div className="flex space-x-2">
  <Button 
    variant="outline" 
    size="sm" 
    className="flex-1"
    onClick={() => handleEditPackage(pkg)}
  >
    <Edit className="h-4 w-4 mr-1" />
    Edit
  </Button>
  <Button 
    variant="outline" 
    size="sm" 
    className="flex-1"
    onClick={() => handleViewPackage(pkg)}
  >
    <Eye className="h-4 w-4 mr-1" />
    View
  </Button>
</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* View Plan Details Dialog */}
<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <DialogTitle>Contract Details - {selectedPlan?.contractId || selectedPlan?.id}</DialogTitle>
      <DialogDescription>Complete pre-need plan information and payment history</DialogDescription>
    </DialogHeader>
    {selectedPlan && (
      <div className="space-y-6">
        {/* Client Information */}
        <div>
          <h3 className="font-semibold mb-4">Client Information</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Client Name</p>
              <p className="font-medium">{selectedPlan.client}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{selectedPlan.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact</p>
              <p className="font-medium">{selectedPlan.contact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Beneficiary</p>
              <p className="font-medium">{selectedPlan.beneficiary}</p>
            </div>
          </div>
        </div>

        <div className="border-t"></div>

        {/* Package Details */}
        <div>
          <h3 className="font-semibold mb-4">Package Details</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Package Type</p>
              <p className="font-medium">{selectedPlan.planType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lot Size</p>
              <p className="font-medium">{selectedPlan.lotSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-blue-600">₱{selectedPlan.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className={getStatusColor(selectedPlan.status)}>
                {selectedPlan.status.charAt(0).toUpperCase() + selectedPlan.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t"></div>

        {/* Payment Information */}
        <div>
          <h3 className="font-semibold mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Down Payment</p>
                <p className="font-medium">₱{selectedPlan.downPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="font-medium">₱{selectedPlan.monthlyPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Term</p>
                <p className="font-medium">{selectedPlan.termMonths} months</p>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Payment Progress</span>
                <span>{selectedPlan.paidMonths} of {selectedPlan.termMonths} months paid</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all" 
                  style={{ width: `${calculateProgress(selectedPlan.paidMonths, selectedPlan.termMonths)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid: ₱{(selectedPlan.totalAmount - selectedPlan.remainingBalance).toLocaleString()}</span>
                <span className="text-red-600">Balance: ₱{selectedPlan.remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{selectedPlan.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{selectedPlan.endDate}</p>
              </div>
            </div>
          </div>
        </div>

        {selectedPlan.notes && (
          <>
            <div className="border-t"></div>
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedPlan.notes}</p>
            </div>
          </>
        )}
      </div>
    )}
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
    </div>
  </DialogContent>
</Dialog>

{/* Edit Plan Dialog */}
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Pre-Need Plan</DialogTitle>
      <DialogDescription>Update pre-need plan information</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-client-name">Client Name *</Label>
          <Input 
            id="edit-client-name" 
            placeholder="Enter client name"
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-contact">Contact Number *</Label>
          <Input 
            id="edit-contact" 
            placeholder="+63 912 345 6789"
            value={formData.contact}
            onChange={(e) => setFormData({...formData, contact: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email Address *</Label>
          <Input 
            id="edit-email" 
            type="email" 
            placeholder="client@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-beneficiary">Beneficiary</Label>
          <Input 
            id="edit-beneficiary" 
            placeholder="Enter beneficiary name"
            value={formData.beneficiary}
            onChange={(e) => setFormData({...formData, beneficiary: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-package">Package Type *</Label>
        <Select value={formData.packageType} onValueChange={(value) => setFormData({...formData, packageType: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select package type" />
          </SelectTrigger>
          <SelectContent>
            {packageTypes.map((pkg, index) => (
              <SelectItem key={index} value={pkg.name}>
                {pkg.name} - ₱{pkg.price.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-down-payment">Down Payment (₱)</Label>
          <Input 
            id="edit-down-payment" 
            type="number" 
            placeholder="0"
            value={formData.downPayment || ''}
            onChange={(e) => setFormData({...formData, downPayment: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-term">Payment Term *</Label>
          <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
          <SelectContent>
  <SelectItem value="12">12 months</SelectItem>
  <SelectItem value="36">36 months</SelectItem>
  <SelectItem value="60">60 months</SelectItem>
</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-start-date">Start Date *</Label>
          <Input 
            id="edit-start-date" 
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-notes">Notes</Label>
        <Textarea 
          id="edit-notes" 
          placeholder="Any special requirements or notes..." 
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveEdit}>Save Changes</Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

{/* View Package Dialog */}
<Dialog open={isViewPackageDialogOpen} onOpenChange={setIsViewPackageDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Package Details</DialogTitle>
      <DialogDescription>Complete information about this package type</DialogDescription>
    </DialogHeader>
    {selectedPackage && (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">{selectedPackage.name}</h3>
          <p className="text-3xl font-bold text-blue-600">₱{selectedPackage.price.toLocaleString()}</p>
        </div>

        <div className="border-t"></div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-600">Package Description</Label>
            <p className="mt-1">{selectedPackage.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-gray-600">Base Price</Label>
              <p className="text-xl font-bold mt-1">₱{selectedPackage.price.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label className="text-gray-600">Package Type</Label>
              <p className="text-xl font-bold mt-1">{selectedPackage.name.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      </div>
    )}
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={() => setIsViewPackageDialogOpen(false)}>Close</Button>
    </div>
  </DialogContent>
</Dialog>


{/* Edit Package Dialog */}
{/* Edit Package Dialog */}
<Dialog open={isEditPackageDialogOpen} onOpenChange={setIsEditPackageDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit Package Type</DialogTitle>
      <DialogDescription>Modify package details and pricing</DialogDescription>
    </DialogHeader>
    {selectedPackage && (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="package-name">Package Name *</Label>
          <Input 
            id="package-name" 
            value={editPackageData.name}
            onChange={(e) => setEditPackageData({...editPackageData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="package-price">Base Price (₱) *</Label>
          <Input 
            id="package-price" 
            type="number" 
            value={editPackageData.price}
            onChange={(e) => setEditPackageData({...editPackageData, price: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="package-description">Description *</Label>
          <Textarea 
            id="package-description" 
            value={editPackageData.description}
            onChange={(e) => setEditPackageData({...editPackageData, description: e.target.value})}
            rows={4} 
          />
        </div>
      </div>
    )}
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={() => setIsEditPackageDialogOpen(false)}>Cancel</Button>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleSavePackageChanges}
      >
        Save Changes
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}

