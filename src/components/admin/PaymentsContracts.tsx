import React, { useState, useEffect } from 'react';
import { Search, Eye, DollarSign, ChevronLeft, ChevronRight, Plus, History, User, MapPin, Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { collection, getDocs, getDoc, doc, query, orderBy, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Payment {
  id: string;
  client: string;
  clientId: string;
  lot: string;
  amount: number;
  paid: number;
  due: number;
  dueDate: string;
  status: string;
  contractId: string;
}

interface Contract {
  id: string;
  client: string;
  clientId: string;
  lot: string;
  date: string;
  status: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  lotSize: string;
  lotLocation: string;
  totalAmount: number;
  downPayment: number;
  monthlyPayment: number;
  paymentTerm: string;
  amountPaid: number;
  remainingBalance: number;
  nextPaymentDate: string;
  expiryDate: string;
  terms: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
}

export function PaymentsContracts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lotTypeFilter, setLotTypeFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [updateDueDateDialogOpen, setUpdateDueDateDialogOpen] = useState(false);
const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
const [newDueDate, setNewDueDate] = useState('');
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const installmentPlans = [
    {
      id: 1,
      lotType: 'Lawn Area - Prime',
      totalPrice: 79461.00,
      downPayment: 15892.00,
      monthly12: 6011.00,
      monthly36: 2483.00,
      monthly60: 1780.00,
      category: 'Lawn Area'
    },
    {
      id: 2,
      lotType: 'Lawn Area - Regular',
      totalPrice: 69478.00,
      downPayment: 13896.00,
      monthly12: 5256.00,
      monthly36: 2171.00,
      monthly60: 1557.00,
      category: 'Lawn Area'
    },
    {
      id: 3,
      lotType: 'Memorial Garden - Special Premium',
      totalPrice: 391315.00,
      downPayment: 78262.00,
      monthly12: 29601.00,
      monthly36: 12226.00,
      monthly60: 8765.00,
      category: 'Memorial Garden'
    },
    {
      id: 4,
      lotType: 'Garden Family Estate - Special Premium',
      totalPrice: 851308.00,
      downPayment: 170262.00,
      monthly12: 64397.00,
      monthly36: 26597.00,
      monthly60: 19069.00,
      category: 'Garden Family Estate'
    },
    {
      id: 5,
      lotType: 'Family Estate - Premier',
      totalPrice: 1927501.00,
      downPayment: 385500.00,
      monthly12: 145805.00,
      monthly36: 60218.00,
      monthly60: 43174.00,
      category: 'Family Estate'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPayments(), loadContracts()]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

// Load payments from user payment summaries
const loadPayments = async () => {
  try {
    console.log('🔍 Starting to load payments...');
    const paymentsListPromises: Payment[] = [];
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log('👥 Total users found:', usersSnapshot.size);
    
    let paymentCounter = 1;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`📋 Checking user ${userId}:`, {
        displayName: userData.displayName,
        email: userData.email,
        role: userData.role
      });
      
      // Get payment summary for this user
      const paymentSummaryDoc = await getDoc(
        doc(db, 'users', userId, 'payments', 'summary')
      );
      
      console.log(`💰 Payment summary exists for ${userId}:`, paymentSummaryDoc.exists());
      
      if (paymentSummaryDoc.exists()) {
        const paymentData = paymentSummaryDoc.data();
        console.log(`💵 Payment data for ${userId}:`, paymentData);
        
        // Determine status
        let status = 'pending';
        if (paymentData.remainingBalance === 0) {
          status = 'paid';
        } else if (paymentData.totalPaid > 0) {
          status = 'partial';
        }
        
        // Check if overdue
        if (paymentData.nextDueDate) {
          const dueDate = new Date(paymentData.nextDueDate);
          const now = new Date();
          if (dueDate < now && paymentData.remainingBalance > 0) {
            status = 'overdue';
          }
        }
        
        // Generate sequential payment ID
        const paymentId = paymentData.paymentId || `PAY-${String(paymentCounter).padStart(3, '0')}`;
        paymentCounter++;
        
        paymentsListPromises.push({
          id: paymentId,
          client: userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'Unknown',
          clientId: userId,
          lot: paymentData.lotNumber || 'N/A',
          amount: paymentData.totalAmount || 0,
          paid: paymentData.totalPaid || 0,
          due: paymentData.remainingBalance || 0,
          dueDate: paymentData.nextDueDate || 'N/A',
          status,
          contractId: paymentData.contractId || 'N/A',
        });
      }
    }
    
    // Sort by payment ID to maintain order
    paymentsListPromises.sort((a, b) => a.id.localeCompare(b.id));
    
    setPayments(paymentsListPromises);
  } catch (error) {
    console.error('Error loading payments:', error);
  }
};
  // Load contracts from pre-need agreements
// Load contracts from pre-need agreements
const loadContracts = async () => {
  try {
    const contractsQuery = query(
      collection(db, 'preNeedAgreements'),
      orderBy('createdAt', 'desc')
    );
    const contractsSnapshot = await getDocs(contractsQuery);
    
    const contractsList: Contract[] = [];
    let contractCounter = 1;
    
    for (const contractDoc of contractsSnapshot.docs) {
      const data = contractDoc.data();
      
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', data.userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const totalAmount = data.totalCost || 0;
      const downPayment = data.initialPayment || 0;
      const amountPaid = data.amountPaid || downPayment;
      const remainingBalance = totalAmount - amountPaid;
      
      // Generate sequential contract ID
      const contractId = data.contractId || `CON-${String(contractCounter).padStart(3, '0')}`;
      contractCounter++;
      
    contractsList.push({
  id: contractId,
  client: userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'Unknown',
  clientId: data.userId,
  lot: data.lotNumber || 'N/A',
  date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : 'N/A',
  status: remainingBalance === 0 ? 'completed' : 'active',
  type: data.planType || 'burial',
  email: userData.email || 'N/A',
  phone: userData.phoneNumber || 'N/A',
  address: userData.address || 'N/A',
  lotSize: data.lotSize || '2m x 1m',
  lotLocation: data.lotLocation || `Section ${data.section || 'A'}`,
  totalAmount,
  downPayment,
  monthlyPayment: data.monthlyPayment || 0,
  paymentTerm: data.paymentTerm || '12 months',
  amountPaid,
  remainingBalance,
  nextPaymentDate: data.nextPaymentDate || 'N/A',
  expiryDate: data.expiryDate || 'N/A',
  terms: data.terms || 'Standard contract terms and conditions apply.',
});

// 🔗 CREATE/UPDATE PAYMENT SUMMARY TO LINK WITH CONTRACT
try {
  const paymentSummaryRef = doc(db, 'users', data.userId, 'payments', 'summary');
  const paymentSummarySnap = await getDoc(paymentSummaryRef);
  
  if (!paymentSummarySnap.exists()) {
    // Create payment summary if it doesn't exist
    await setDoc(paymentSummaryRef, {
      contractId: contractId,
      paymentId: `PAY-${String(contractCounter).padStart(3, '0')}`,
      lotNumber: data.lotNumber || 'N/A',
      totalAmount: totalAmount,
      totalPaid: amountPaid,
      remainingBalance: remainingBalance,
      nextDueDate: data.nextPaymentDate || new Date().toISOString().split('T')[0],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Created payment summary for ${contractId}`);
  } else {
    // Update existing payment summary with contract ID
    await updateDoc(paymentSummaryRef, {
      contractId: contractId,
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Updated payment summary with ${contractId}`);
  }
} catch (error) {
  console.error(`❌ Error linking payment to contract ${contractId}:`, error);
}
      }
      
  // Sort by contract ID to maintain order
      contractsList.sort((a, b) => a.id.localeCompare(b.id));
      
      setContracts(contractsList);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };
  const handleUpdateDueDate = async () => {
  if (!selectedPayment || !newDueDate) {
    toast.error('Please select a valid date');
    return;
  }

  try {
    // Update in Firebase
    const paymentSummaryRef = doc(db, 'users', selectedPayment.clientId, 'payments', 'summary');
    
    await updateDoc(paymentSummaryRef, {
      nextDueDate: newDueDate,
      updatedAt: Timestamp.now(),
    });

    toast.success('Due date updated successfully', {
      description: `New due date: ${new Date(newDueDate).toLocaleDateString()}`
    });

    // Reload payments to reflect changes
    await loadPayments();

    // Close dialog
    setUpdateDueDateDialogOpen(false);
    setSelectedPayment(null);
    setNewDueDate('');
  } catch (error) {
    console.error('Error updating due date:', error);
    toast.error('Failed to update due date');
  }
};

  // Load payment history for a specific user
  const loadPaymentHistory = async (clientId: string): Promise<PaymentHistory[]> => {
    try {
      const historyQuery = query(
        collection(db, 'users', clientId, 'payments', 'transactions', 'history'),
        orderBy('paymentDate', 'desc')
      );
      const historySnapshot = await getDocs(historyQuery);
      
      const history: PaymentHistory[] = [];
      historySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          date: data.paymentDate ? new Date(data.paymentDate.toDate()).toLocaleDateString() : 'N/A',
          type: data.transactionType || 'Payment',
          amount: data.amount || 0,
          status: data.status || 'completed',
          method: data.paymentMethod || 'N/A',
          reference: data.transactionId || 'N/A',
        });
      });
      
      return history;
    } catch (error) {
      console.error('Error loading payment history:', error);
      return [];
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredInstallments = installmentPlans.filter(plan => {
    const matchesLotType = lotTypeFilter === 'all' || plan.category === lotTypeFilter;
    return matchesLotType;
  });

  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInstallments = filteredInstallments.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleViewHistory = async (payment: Payment) => {
    const history = await loadPaymentHistory(payment.clientId);
    setSelectedClient({
      name: payment.client,
      lotNumber: payment.lot,
      history,
    });
    setShowPaymentHistory(true);
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractDetails(true);
  };

  const handleDownloadContract = (contract: Contract) => {
    toast.success(`Contract ${contract.id} downloaded successfully`, {
      description: `Downloaded contract for ${contract.client}`
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

const totalRevenue = payments.reduce((sum, payment) => sum + payment.paid, 0);
const totalPending = payments.reduce((sum, payment) => sum + payment.due, 0);
const overduePayments = payments.filter(p => p.status === 'overdue').length;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading payments and contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payments & Contracts</h2>
          <p className="text-muted-foreground">Manage payment records and contracts ({payments.length} payments, {contracts.length} contracts)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-xl font-bold text-yellow-600">₱{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-red-600 rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-red-600">{overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-blue-600 rounded-full" />
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-xl font-bold text-blue-600">{contracts.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="installments">Installments</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search payments..."
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.client}</TableCell>
                        <TableCell>{payment.lot}</TableCell>
                        <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>₱{payment.paid.toLocaleString()}</TableCell>
                        <TableCell>{payment.dueDate}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                      <TableCell>
  <div className="flex items-center space-x-2">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => {
        setSelectedPayment(payment);
        setNewDueDate(payment.dueDate !== 'N/A' ? payment.dueDate : '');
        setUpdateDueDateDialogOpen(true);
      }}
      title="Update Due Date"
    >
      <Calendar className="h-4 w-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleViewHistory(payment)}
      title="View Payment History"
    >
      <History className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Records</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.id}</TableCell>
                        <TableCell>{contract.client}</TableCell>
                        <TableCell>{contract.lot}</TableCell>
                        <TableCell>{contract.date}</TableCell>
                        <TableCell className="capitalize">{contract.type}</TableCell>
                        <TableCell>
                          <Badge className={getContractStatusColor(contract.status)}>
                            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                          </Badge>
                        </TableCell>
                 <TableCell>
  <div className="flex items-center gap-2">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleViewContract(contract)}
      title="View Contract"
    >
      <Eye className="h-4 w-4" />
    </Button>
   
  </div>
</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No contracts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Installment Plans</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={lotTypeFilter} onValueChange={(value) => {
                  setLotTypeFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select Lot Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lot Types</SelectItem>
                    <SelectItem value="Lawn Area">Lawn Area</SelectItem>
                    <SelectItem value="Memorial Garden">Memorial Garden</SelectItem>
                    <SelectItem value="Garden Family Estate">Garden Family Estate</SelectItem>
                    <SelectItem value="Family Estate">Family Estate</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={termFilter} onValueChange={setTermFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Select Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot Type</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Down Payment</TableHead>
                    {(termFilter === 'all' || termFilter === '12') && (
                      <TableHead className="bg-primary/5">12 Months (Monthly)</TableHead>
                    )}
                    {(termFilter === 'all' || termFilter === '36') && (
                      <TableHead className="bg-primary/5">36 Months (Monthly)</TableHead>
                    )}
                    {(termFilter === 'all' || termFilter === '60') && (
                      <TableHead className="bg-primary/5">60 Months (Monthly)</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInstallments.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.lotType}</TableCell>
                      <TableCell>{formatCurrency(plan.totalPrice)}</TableCell>
                      <TableCell>{formatCurrency(plan.downPayment)}</TableCell>
                      {(termFilter === 'all' || termFilter === '12') && (
                        <TableCell className="bg-primary/5 font-semibold">
                          {formatCurrency(plan.monthly12)}
                        </TableCell>
                      )}
                      {(termFilter === 'all' || termFilter === '36') && (
                        <TableCell className="bg-primary/5 font-semibold">
                          {formatCurrency(plan.monthly36)}
                        </TableCell>
                      )}
                      {(termFilter === 'all' || termFilter === '60') && (
                        <TableCell className="bg-primary/5 font-semibold">
                          {formatCurrency(plan.monthly60)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInstallments.length)} of {filteredInstallments.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment History Modal */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History - {selectedClient?.name}</DialogTitle>
            <DialogDescription>Lot: {selectedClient?.lotNumber}</DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedClient.history.length > 0 ? (
                  selectedClient.history.map((item: PaymentHistory) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>₱{item.amount.toLocaleString()}</TableCell>
                      <TableCell>{item.method}</TableCell>
                      <TableCell>{item.reference}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payment history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Details Modal */}
      <Dialog open={showContractDetails} onOpenChange={setShowContractDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Details - {selectedContract?.id}</DialogTitle>
            <DialogDescription>Complete contract information and terms</DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{selectedContract.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedContract.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedContract.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedContract.address}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lot Details */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Lot Details
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Lot Number</p>
                    <p className="font-medium">{selectedContract.lot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lot Size</p>
                    <p className="font-medium">{selectedContract.lotSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedContract.lotLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{selectedContract.type}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contract Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Contract Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Date</p>
                    <p className="font-medium">{selectedContract.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{selectedContract.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getContractStatusColor(selectedContract.status)}>
                      {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payment Date</p>
                    <p className="font-medium">{selectedContract.nextPaymentDate}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-primary">₱{selectedContract.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Down Payment</p>
                      <p className="font-medium">₱{selectedContract.downPayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                      <p className="font-medium">₱{selectedContract.monthlyPayment.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Term</p>
                      <p className="font-medium">{selectedContract.paymentTerm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Paid</p>
                      <p className="font-medium text-green-600">₱{selectedContract.amountPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                      <p className="font-medium text-destructive">₱{selectedContract.remainingBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div>
                <h3 className="font-semibold mb-2">Terms and Conditions</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm">{selectedContract.terms}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContractDetails(false)}>Close</Button>
            <Button onClick={() => selectedContract && handleDownloadContract(selectedContract)}>
              <Download className="h-4 w-4 mr-2" />
              Download Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Due Date Dialog */}
<Dialog open={updateDueDateDialogOpen} onOpenChange={setUpdateDueDateDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Update Due Date</DialogTitle>
      <DialogDescription>
        Update the next payment due date for {selectedPayment?.client}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-due-date">Current Due Date</Label>
        <Input
          id="current-due-date"
          value={selectedPayment?.dueDate || 'N/A'}
          disabled
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-due-date">New Due Date *</Label>
        <Input
          id="new-due-date"
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Updating the due date will automatically recalculate the payment status (Pending, Overdue, etc.)
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={() => {
          setUpdateDueDateDialogOpen(false);
          setSelectedPayment(null);
          setNewDueDate('');
        }}
      >
        Cancel
      </Button>
      <Button onClick={handleUpdateDueDate} className="bg-blue-600 hover:bg-blue-700">
        Update Due Date
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}