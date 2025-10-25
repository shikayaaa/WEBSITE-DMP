import React, { useState } from 'react';
import { Search, Filter, Eye, FileText, DollarSign, ChevronLeft, ChevronRight, Plus, History, User, MapPin, Calendar, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ContractGenerator } from './ContractGenerator';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

export function PaymentsContracts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lotTypeFilter, setLotTypeFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
const [showContractGenerator, setShowContractGenerator] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const payments = [
    { 
      id: 'PAY-001', 
      client: 'Maria Santos', 
      lot: 'A-002', 
      amount: 45000, 
      paid: 25000, 
      due: 20000, 
      dueDate: '2024-12-15', 
      status: 'partial',
      contractId: 'CON-001'
    },
    { 
      id: 'PAY-002', 
      client: 'Juan Cruz', 
      lot: 'A-003', 
      amount: 45000, 
      paid: 45000, 
      due: 0, 
      dueDate: '2024-11-30', 
      status: 'paid',
      contractId: 'CON-002'
    },
    { 
      id: 'PAY-003', 
      client: 'Pedro Garcia', 
      lot: 'B-002', 
      amount: 55000, 
      paid: 0, 
      due: 55000, 
      dueDate: '2024-12-20', 
      status: 'pending',
      contractId: 'CON-003'
    },
    { 
      id: 'PAY-004', 
      client: 'Ana Lopez', 
      lot: 'B-003', 
      amount: 55000, 
      paid: 55000, 
      due: 0, 
      dueDate: '2024-12-01', 
      status: 'paid',
      contractId: 'CON-004'
    },
    { 
      id: 'PAY-005', 
      client: 'Carlos Rivera', 
      lot: 'C-005', 
      amount: 35000, 
      paid: 10000, 
      due: 25000, 
      dueDate: '2024-12-25', 
      status: 'overdue',
      contractId: 'CON-005'
    },
  ];

  const contracts = [
    { 
      id: 'CON-001', 
      client: 'Maria Santos', 
      lot: 'A-002', 
      date: '2024-10-15', 
      status: 'active', 
      type: 'burial',
      email: 'maria.santos@email.com',
      phone: '+63 912 345 6789',
      address: '123 Main St, Dumaguete City',
      lotSize: '2m x 1m',
      lotLocation: 'Section A, Row 2',
      totalAmount: 45000,
      downPayment: 15000,
      monthlyPayment: 2500,
      paymentTerm: '12 months',
      amountPaid: 25000,
      remainingBalance: 20000,
      nextPaymentDate: '2024-12-15',
      expiryDate: '2025-10-15',
      terms: 'Standard burial contract with 12-month payment plan. Includes perpetual care and maintenance.'
    },
    { 
      id: 'CON-002', 
      client: 'Juan Cruz', 
      lot: 'A-003', 
      date: '2024-09-20', 
      status: 'completed', 
      type: 'burial',
      email: 'juan.cruz@email.com',
      phone: '+63 923 456 7890',
      address: '456 Oak Ave, Dumaguete City',
      lotSize: '2m x 1m',
      lotLocation: 'Section A, Row 3',
      totalAmount: 45000,
      downPayment: 15000,
      monthlyPayment: 2500,
      paymentTerm: '12 months',
      amountPaid: 45000,
      remainingBalance: 0,
      nextPaymentDate: 'N/A',
      expiryDate: '2025-09-20',
      terms: 'Standard burial contract with 12-month payment plan. Fully paid. Includes perpetual care and maintenance.'
    },
    { 
      id: 'CON-003', 
      client: 'Pedro Garcia', 
      lot: 'B-002', 
      date: '2024-11-01', 
      status: 'active', 
      type: 'burial',
      email: 'pedro.garcia@email.com',
      phone: '+63 934 567 8901',
      address: '789 Pine Rd, Dumaguete City',
      lotSize: '2.5m x 1.5m',
      lotLocation: 'Section B, Row 2',
      totalAmount: 55000,
      downPayment: 18000,
      monthlyPayment: 3000,
      paymentTerm: '12 months',
      amountPaid: 18000,
      remainingBalance: 37000,
      nextPaymentDate: '2024-12-01',
      expiryDate: '2025-11-01',
      terms: 'Premium burial contract with 12-month payment plan. Includes perpetual care and maintenance.'
    },
    { 
      id: 'CON-004', 
      client: 'Ana Lopez', 
      lot: 'B-003', 
      date: '2024-10-05', 
      status: 'completed', 
      type: 'burial',
      email: 'ana.lopez@email.com',
      phone: '+63 945 678 9012',
      address: '321 Elm St, Dumaguete City',
      lotSize: '2.5m x 1.5m',
      lotLocation: 'Section B, Row 3',
      totalAmount: 55000,
      downPayment: 18000,
      monthlyPayment: 3000,
      paymentTerm: '12 months',
      amountPaid: 55000,
      remainingBalance: 0,
      nextPaymentDate: 'N/A',
      expiryDate: '2025-10-05',
      terms: 'Premium burial contract with 12-month payment plan. Fully paid. Includes perpetual care and maintenance.'
    },
    { 
      id: 'CON-005', 
      client: 'Carlos Rivera', 
      lot: 'C-005', 
      date: '2024-09-10', 
      status: 'active', 
      type: 'memorial',
      email: 'carlos.rivera@email.com',
      phone: '+63 956 789 0123',
      address: '654 Maple Dr, Dumaguete City',
      lotSize: '1.5m x 1m',
      lotLocation: 'Section C, Row 5',
      totalAmount: 35000,
      downPayment: 12000,
      monthlyPayment: 2000,
      paymentTerm: '12 months',
      amountPaid: 16000,
      remainingBalance: 19000,
      nextPaymentDate: '2024-11-10',
      expiryDate: '2025-09-10',
      terms: 'Memorial garden contract with 12-month payment plan. Includes perpetual care and maintenance.'
    },
  ];

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

  // Mock payment history data
  const getPaymentHistory = (clientName: string) => {
    const histories: { [key: string]: any[] } = {
      'Maria Santos': [
        { id: '1', date: '2024-10-15', type: 'Down Payment', amount: 15000, status: 'paid', method: 'Bank Transfer', reference: 'BT001' },
        { id: '2', date: '2024-11-15', type: 'Monthly Payment 1', amount: 2500, status: 'paid', method: 'Cash', reference: 'CSH001' },
        { id: '3', date: '2024-12-15', type: 'Monthly Payment 2', amount: 2500, status: 'overdue', method: '', reference: '' },
        { id: '4', date: '2025-01-15', type: 'Monthly Payment 3', amount: 2500, status: 'pending', method: '', reference: '' }
      ],
      'Juan Cruz': [
        { id: '1', date: '2024-09-20', type: 'Down Payment', amount: 15000, status: 'paid', method: 'Credit Card', reference: 'CC001' },
        { id: '2', date: '2024-10-20', type: 'Monthly Payment 1', amount: 2500, status: 'paid', method: 'Bank Transfer', reference: 'BT002' },
        { id: '3', date: '2024-11-20', type: 'Monthly Payment 2', amount: 2500, status: 'paid', method: 'Cash', reference: 'CSH002' },
        { id: '4', date: '2024-12-20', type: 'Monthly Payment 3', amount: 2500, status: 'pending', method: '', reference: '' }
      ],
      'Pedro Garcia': [
        { id: '1', date: '2024-11-01', type: 'Down Payment', amount: 18000, status: 'paid', method: 'Bank Transfer', reference: 'BT003' },
        { id: '2', date: '2024-12-01', type: 'Monthly Payment 1', amount: 3000, status: 'pending', method: '', reference: '' }
      ],
      'Ana Lopez': [
        { id: '1', date: '2024-10-05', type: 'Down Payment', amount: 18000, status: 'paid', method: 'Cash', reference: 'CSH003' },
        { id: '2', date: '2024-11-05', type: 'Monthly Payment 1', amount: 3000, status: 'paid', method: 'Bank Transfer', reference: 'BT004' },
        { id: '3', date: '2024-12-05', type: 'Monthly Payment 2', amount: 3000, status: 'paid', method: 'Credit Card', reference: 'CC002' }
      ],
      'Carlos Rivera': [
        { id: '1', date: '2024-09-10', type: 'Down Payment', amount: 12000, status: 'paid', method: 'Cash', reference: 'CSH004' },
        { id: '2', date: '2024-10-10', type: 'Monthly Payment 1', amount: 2000, status: 'partial', method: 'Bank Transfer', reference: 'BT005' },
        { id: '3', date: '2024-11-10', type: 'Monthly Payment 2', amount: 2000, status: 'overdue', method: '', reference: '' }
      ]
    };
    return histories[clientName] || [];
  };

  const handleViewHistory = (payment: any) => {
    setSelectedClient({
      name: payment.client,
      lotNumber: payment.lot,
      history: getPaymentHistory(payment.client)
    });
    setShowPaymentHistory(true);
  };

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setShowContractDetails(true);
  };

  const handleDownloadContract = (contract: any) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payments & Contracts</h2>
          <p className="text-muted-foreground">Manage payment records and contracts</p>
        </div>
        <Button onClick={() => setShowContractGenerator(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Generate Contract
        </Button>
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
                  {filteredPayments.map((payment) => (
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
                            onClick={() => handleViewHistory(payment)}
                            title="View Payment History"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                         
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {filteredContracts.map((contract) => (
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
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewContract(contract)}
                            title="View Contract Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead>12 Months (Monthly)</TableHead>
                    <TableHead>36 Months (Monthly)</TableHead>
                    <TableHead>60 Months (Monthly)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInstallments.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.lotType}</TableCell>
                      <TableCell>{formatCurrency(plan.totalPrice)}</TableCell>
                      <TableCell>{formatCurrency(plan.downPayment)}</TableCell>
                      <TableCell className={termFilter === 'all' || termFilter === '12' ? 'bg-primary/5' : ''}>
                        {formatCurrency(plan.monthly12)}
                      </TableCell>
                      <TableCell className={termFilter === 'all' || termFilter === '36' ? 'bg-primary/5' : ''}>
                        {formatCurrency(plan.monthly36)}
                      </TableCell>
                      <TableCell className={termFilter === 'all' || termFilter === '60' ? 'bg-primary/5' : ''}>
                        {formatCurrency(plan.monthly60)}
                      </TableCell>
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

      {/* Contract Generator Modal */}
      <ContractGenerator
        isOpen={showContractGenerator}
        onClose={() => setShowContractGenerator(false)}
        installmentPlans={installmentPlans}
      />

      {/* Payment History Modal */}
      {selectedClient && (
        <PaymentHistoryModal
          isOpen={showPaymentHistory}
          onClose={() => {
            setShowPaymentHistory(false);
            setSelectedClient(null);
          }}
          clientName={selectedClient.name}
          lotNumber={selectedClient.lotNumber}
          paymentHistory={selectedClient.history}
        />
      )}

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
    </div>
  );
}