import React, { useState } from 'react';
import { Search, Download, Eye, FileText, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function StaffPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const payments = [
    { 
      id: 'PAY-001', 
      client: 'Maria Santos', 
      lot: 'A-002', 
      amount: 45000, 
      paid: 25000, 
      balance: 20000, 
      dueDate: '2024-12-15', 
      status: 'partial',
      paymentDate: '2024-10-15',
      method: 'Bank Transfer',
      reference: 'BT-001-2024'
    },
    { 
      id: 'PAY-002', 
      client: 'Juan Cruz', 
      lot: 'A-003', 
      amount: 45000, 
      paid: 45000, 
      balance: 0, 
      dueDate: '2024-11-30', 
      status: 'paid',
      paymentDate: '2024-11-28',
      method: 'Cash',
      reference: 'CSH-002-2024'
    },
    { 
      id: 'PAY-003', 
      client: 'Pedro Garcia', 
      lot: 'B-002', 
      amount: 55000, 
      paid: 0, 
      balance: 55000, 
      dueDate: '2024-12-20', 
      status: 'pending',
      paymentDate: null,
      method: null,
      reference: null
    },
    { 
      id: 'PAY-004', 
      client: 'Ana Lopez', 
      lot: 'B-003', 
      amount: 55000, 
      paid: 55000, 
      balance: 0, 
      dueDate: '2024-12-01', 
      status: 'paid',
      paymentDate: '2024-11-25',
      method: 'Installment',
      reference: 'INS-004-2024'
    },
    { 
      id: 'PAY-005', 
      client: 'Carlos Rivera', 
      lot: 'C-005', 
      amount: 35000, 
      paid: 10000, 
      balance: 25000, 
      dueDate: '2024-12-25', 
      status: 'overdue',
      paymentDate: '2024-11-01',
      method: 'Cash',
      reference: 'CSH-005-2024'
    },
    { 
      id: 'PAY-006', 
      client: 'Rosa Garcia', 
      lot: 'D-002', 
      amount: 65000, 
      paid: 65000, 
      balance: 0, 
      dueDate: '2024-11-15', 
      status: 'paid',
      paymentDate: '2024-11-10',
      method: 'Check',
      reference: 'CHK-006-2024'
    },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReceipt = (paymentId: string) => {
    // Mock receipt generation
    alert(`Generating receipt for ${paymentId}...`);
  };

  const totalCollected = payments.reduce((sum, payment) => sum + payment.paid, 0);
  const totalPending = payments.reduce((sum, payment) => sum + payment.balance, 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;

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
                <p className="text-xl font-bold text-red-600">{payments.filter(p => p.status === 'overdue').length}</p>
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
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
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
                              <DialogTitle>Payment Details - {payment.id}</DialogTitle>
                              <DialogDescription>Complete payment information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
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
                        {payment.status === 'paid' || payment.paid > 0 ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => generateReceipt(payment.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              .filter(p => p.paymentDate)
              .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())
              .slice(0, 5)
              .map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-l-4 border-green-200 pl-4">
                  <div>
                    <p className="font-medium">{payment.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.id} • {payment.method} • {payment.paymentDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₱{payment.paid.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{payment.lot}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}