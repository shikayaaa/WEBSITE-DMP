import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, FileText, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, Timestamp, getDocs, getDoc, doc } from 'firebase/firestore';

type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

type Payment = {
  id: string;
  paymentId: string;  // ADDED: Human-readable payment ID
  client: string;
  clientId?: string;
  lot: string;
  lotId?: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: PaymentStatus;
  paymentDate: string | null;
  method: string | null;
  reference: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function StaffPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [STAFF] Starting to load payments...');
      const paymentsListPromises: Payment[] = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log('👥 [STAFF] Total users found:', usersSnapshot.size);
      
      let paymentCounter = 1;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        console.log(`📋 [STAFF] Checking user ${userId}:`, {
          displayName: userData.displayName,
          email: userData.email,
          role: userData.role
        });
        
        // Get payment summary for this user
        const paymentSummaryDoc = await getDoc(
          doc(db, 'users', userId, 'payments', 'summary')
        );
        
        console.log(`💰 [STAFF] Payment summary exists for ${userId}:`, paymentSummaryDoc.exists());
        
        if (paymentSummaryDoc.exists()) {
          const paymentData = paymentSummaryDoc.data();
          console.log(`💵 [STAFF] Payment data for ${userId}:`, paymentData);
          
          // Determine status
          let status: PaymentStatus = 'pending';
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
            id: userId,
            paymentId: paymentId,
            client: userData.displayName || userData.fullName || userData.email?.split('@')[0] || 'Unknown',
            clientId: userId,
            lot: paymentData.lotNumber || 'N/A',
            lotId: paymentData.lotId || undefined,
            amount: paymentData.totalAmount || 0,
            paid: paymentData.totalPaid || 0,
            balance: paymentData.remainingBalance || 0,
            dueDate: paymentData.nextDueDate || 'N/A',
            status,
            paymentDate: paymentData.lastPaymentDate || null,
            method: paymentData.lastPaymentMethod || null,
            reference: paymentData.lastTransactionId || null,
            createdAt: paymentData.createdAt?.toDate() || undefined,
            updatedAt: paymentData.updatedAt?.toDate() || undefined,
          });
        }
      }
      
      // Sort by payment ID to maintain order
      paymentsListPromises.sort((a, b) => a.paymentId.localeCompare(b.paymentId));
      
      setPayments(paymentsListPromises);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payments');
      setLoading(false);
    }
  };

  fetchPayments();
}, []);
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());  // FIXED: Search by paymentId
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReceipt = (paymentId: string) => {
    // Mock receipt generation
    alert(`Generating receipt for ${paymentId}...`);
  };

  const totalCollected = payments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalPending = payments.reduce((sum, payment) => sum + payment.balance, 0);
  const paidCount = payments.filter((p) => p.status === 'paid').length;

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading payment records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">Error loading payments: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Records</h2>
          <p className="text-muted-foreground">View payment history and generate receipts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-xl font-bold text-green-600">₱{totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-yellow-600">₱{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-blue-600">{paidCount}</p>
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
                <p className="text-xl font-bold text-red-600">
                  {payments.filter((p) => p.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Lot</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.paymentId}</TableCell>  {/* FIXED: Display paymentId */}
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{payment.lot}</TableCell>
                      <TableCell>₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>₱{payment.paid.toLocaleString()}</TableCell>
                      <TableCell>₱{payment.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Payment Details - {payment.paymentId}</DialogTitle>  {/* FIXED */}
                                <DialogDescription>Complete payment information</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Payment ID</p>
                                    <p className="font-medium">{payment.paymentId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Client</p>
                                    <p className="font-medium">{payment.client}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Lot</p>
                                    <p className="font-medium">{payment.lot}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                                    <p className="font-medium">₱{payment.paid.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="font-medium">₱{payment.balance.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Due Date</p>
                                    <p className="font-medium">{payment.dueDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={getStatusColor(payment.status)}>
                                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                    </Badge>
                                  </div>
                                  {payment.paymentDate && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">Payment Date</p>
                                      <p className="font-medium">{payment.paymentDate}</p>
                                    </div>
                                  )}
                                  {payment.method && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">Payment Method</p>
                                      <p className="font-medium">{payment.method}</p>
                                    </div>
                                  )}
                                  {payment.reference && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">Reference</p>
                                      <p className="font-medium">{payment.reference}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments
              .filter((p) => p.paymentDate)
              .sort((a, b) => {
                const dateA = new Date(a.paymentDate!).getTime();
                const dateB = new Date(b.paymentDate!).getTime();
                return dateB - dateA;
              })
              .slice(0, 5)
              .map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-2 border-l-4 border-green-200 pl-4"
                >
                  <div>
                    <p className="font-medium">{payment.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.paymentId} • {payment.method} • {payment.paymentDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₱{payment.paid.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{payment.lot}</p>
                  </div>
                </div>
              ))}
            {payments.filter((p) => p.paymentDate).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}