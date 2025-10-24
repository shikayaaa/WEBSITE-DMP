import React, { useState } from 'react';
import { Search, Eye, Calendar, DollarSign, Users, Package, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function StaffPreNeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const preNeedPlans = [
    {
      id: 'PN-001',
      client: 'Maria Gonzalez',
      planType: 'Premium Memorial Package',
      lotSize: '3x4m',
      totalAmount: 120000,
      downPayment: 30000,
      monthlyPayment: 7500,
      termMonths: 12,
      paidMonths: 8,
      remainingBalance: 30000,
      status: 'active',
      startDate: '2024-04-15',
      endDate: '2025-04-15',
      contact: '+63 912 345 6789',
      email: 'maria.gonzalez@email.com',
      beneficiary: 'Miguel Gonzalez',
      nextPaymentDue: '2024-12-15',
      assignedStaff: 'Jean'
    },
    {
      id: 'PN-002',
      client: 'Roberto Santos',
      planType: 'Standard Package',
      lotSize: '2x3m',
      totalAmount: 85000,
      downPayment: 20000,
      monthlyPayment: 5416,
      termMonths: 12,
      paidMonths: 12,
      remainingBalance: 0,
      status: 'completed',
      startDate: '2023-12-01',
      endDate: '2024-12-01',
      contact: '+63 923 456 7890',
      email: 'roberto.santos@email.com',
      beneficiary: 'Carmen Santos',
      nextPaymentDue: null,
      assignedStaff: 'Jean'
    },
    {
      id: 'PN-003',
      client: 'Ana Rivera',
      planType: 'Deluxe Memorial Package',
      lotSize: '3x3m',
      totalAmount: 95000,
      downPayment: 25000,
      monthlyPayment: 5833,
      termMonths: 12,
      paidMonths: 5,
      remainingBalance: 29167,
      status: 'active',
      startDate: '2024-07-10',
      endDate: '2025-07-10',
      contact: '+63 934 567 8901',
      email: 'ana.rivera@email.com',
      beneficiary: 'Luis Rivera',
      nextPaymentDue: '2024-12-10',
      assignedStaff: 'Lisa Lopez'
    },
    {
      id: 'PN-004',
      client: 'Carlos Martinez',
      planType: 'Basic Package',
      lotSize: '2x2m',
      totalAmount: 65000,
      downPayment: 15000,
      monthlyPayment: 4166,
      termMonths: 12,
      paidMonths: 2,
      remainingBalance: 41664,
      status: 'overdue',
      startDate: '2024-09-01',
      endDate: '2025-09-01',
      contact: '+63 945 678 9012',
      email: 'carlos.martinez@email.com',
      beneficiary: 'Elena Martinez',
      nextPaymentDue: '2024-11-01',
      assignedStaff: 'Jean'
    },
    {
      id: 'PN-005',
      client: 'Rosa Garcia',
      planType: 'Family Package',
      lotSize: '4x4m',
      totalAmount: 150000,
      downPayment: 40000,
      monthlyPayment: 9166,
      termMonths: 12,
      paidMonths: 10,
      remainingBalance: 18332,
      status: 'active',
      startDate: '2024-02-20',
      endDate: '2025-02-20',
      contact: '+63 956 789 0123',
      email: 'rosa.garcia@email.com',
      beneficiary: 'Multiple Family Members',
      nextPaymentDue: '2024-12-20',
      assignedStaff: 'Lisa Lopez'
    },
  ];

  const packageTypes = [
    { name: 'Basic Package', price: 65000, description: '2x2m lot, basic services', features: ['Burial services', 'Basic marker', '1-year maintenance'] },
    { name: 'Standard Package', price: 85000, description: '2x3m lot, standard services', features: ['Burial services', 'Standard marker', '2-year maintenance', 'Flower arrangement'] },
    { name: 'Deluxe Memorial Package', price: 95000, description: '3x3m lot, enhanced services', features: ['Premium burial services', 'Deluxe marker', '3-year maintenance', 'Memorial garden access'] },
    { name: 'Premium Memorial Package', price: 120000, description: '3x4m lot, premium services', features: ['Full service burial', 'Premium memorial', '5-year maintenance', 'Priority scheduling'] },
    { name: 'Family Package', price: 150000, description: '4x4m lot, comprehensive services', features: ['Multiple burial capacity', 'Family memorial', 'Lifetime maintenance', 'Exclusive access'] },
  ];

  const filteredPlans = preNeedPlans.filter(plan => {
    const matchesSearch = plan.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-secondary/20 text-secondary';
      case 'overdue': return 'bg-destructive/10 text-destructive';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const calculateProgress = (paidMonths: number, termMonths: number) => {
    return Math.round((paidMonths / termMonths) * 100);
  };

  const myActiveContracts = preNeedPlans.filter(p => p.assignedStaff === 'Jean' && p.status === 'active').length;
  const myTotalRevenue = preNeedPlans
    .filter(p => p.assignedStaff === 'Jean')
    .reduce((sum, plan) => sum + (plan.totalAmount - plan.remainingBalance), 0);
  const upcomingPayments = preNeedPlans.filter(p => p.nextPaymentDue && new Date(p.nextPaymentDue) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
  const overdueAccounts = preNeedPlans.filter(p => p.status === 'overdue' && p.assignedStaff === 'Jean').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pre-Need Purchase</h2>
          <p className="text-muted-foreground">View and assist with pre-need memorial plans</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">My Active Contracts</p>
                <p className="text-xl font-bold text-primary">{myActiveContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">My Total Collections</p>
                <p className="text-xl font-bold text-secondary">₱{myTotalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-xl font-bold text-accent-foreground">{upcomingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-destructive">{overdueAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Pre-Need Contracts</TabsTrigger>
          <TabsTrigger value="packages">Package Information</TabsTrigger>
          <TabsTrigger value="my-clients">My Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Need Contracts</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                      <TableHead>Progress</TableHead>
                      <TableHead>Next Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.client}</p>
                            <p className="text-sm text-muted-foreground">{plan.contact}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.planType}</p>
                            <p className="text-sm text-muted-foreground">{plan.lotSize}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{plan.paidMonths}/{plan.termMonths} months</span>
                              <span>{calculateProgress(plan.paidMonths, plan.termMonths)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${calculateProgress(plan.paidMonths, plan.termMonths)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{plan.nextPaymentDue || 'Completed'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
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
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Pre-Need Contract Details - {plan.id}</DialogTitle>
                                  <DialogDescription>Complete contract information and payment history</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Client</p>
                                      <p className="font-medium">{plan.client}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Beneficiary</p>
                                      <p className="font-medium">{plan.beneficiary}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Package Type</p>
                                      <p className="font-medium">{plan.planType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Lot Size</p>
                                      <p className="font-medium">{plan.lotSize}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Total Amount</p>
                                      <p className="font-medium">₱{plan.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Down Payment</p>
                                      <p className="font-medium">₱{plan.downPayment.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                                      <p className="font-medium">₱{plan.monthlyPayment.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                                      <p className="font-medium">₱{plan.remainingBalance.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contract Period</p>
                                      <p className="font-medium">{plan.startDate} to {plan.endDate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Assigned Staff</p>
                                      <p className="font-medium">{plan.assignedStaff}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 pt-4 border-t">
                                    <Button variant="outline" size="sm">
                                      <Phone className="h-4 w-4 mr-1" />
                                      Call Client
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Mail className="h-4 w-4 mr-1" />
                                      Send Email
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Pre-Need Packages</CardTitle>
              <p className="text-sm text-muted-foreground">Information about available memorial packages for client inquiries</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTypes.map((pkg, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-primary">₱{pkg.price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Features:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <div className="w-1 h-1 bg-primary rounded-full"></div>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Clients</CardTitle>
              <p className="text-sm text-muted-foreground">Pre-need contracts assigned to you</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preNeedPlans
                  .filter(plan => plan.assignedStaff === 'Jean')
                  .map((plan) => (
                    <Card key={plan.id} className="border-l-4 border-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{plan.client}</h3>
                            <p className="text-sm text-muted-foreground">{plan.planType}</p>
                          </div>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Progress</p>
                            <p className="font-medium">{plan.paidMonths}/{plan.termMonths} months ({calculateProgress(plan.paidMonths, plan.termMonths)}%)</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <p className="font-medium">₱{plan.remainingBalance.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Next Payment</p>
                            <p className="font-medium">{plan.nextPaymentDue || 'Completed'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}