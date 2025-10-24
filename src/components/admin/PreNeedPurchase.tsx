import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Download, Calendar, DollarSign, Users, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function PreNeedPurchase() {
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
      notes: 'Client prefers garden section'
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
      notes: 'Plan completed successfully'
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
      notes: 'Family prefers premium location'
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
      notes: 'Payment reminder sent'
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
      notes: 'Large family plot for multiple burials'
    },
  ];

  const packageTypes = [
    { name: 'Basic Package', price: 65000, description: '2x2m lot, basic services' },
    { name: 'Standard Package', price: 85000, description: '2x3m lot, standard services' },
    { name: 'Deluxe Memorial Package', price: 95000, description: '3x3m lot, enhanced services' },
    { name: 'Premium Memorial Package', price: 120000, description: '3x4m lot, premium services' },
    { name: 'Family Package', price: 150000, description: '4x4m lot, comprehensive services' },
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

  const totalActiveContracts = preNeedPlans.filter(p => p.status === 'active').length;
  const totalRevenue = preNeedPlans.reduce((sum, plan) => sum + (plan.totalAmount - plan.remainingBalance), 0);
  const totalOutstanding = preNeedPlans.reduce((sum, plan) => sum + plan.remainingBalance, 0);
  const overdueContracts = preNeedPlans.filter(p => p.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pre-Need Purchase</h2>
          <p className="text-muted-foreground">Manage pre-need memorial plans and contracts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Pre-Need Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Pre-Need Plan</DialogTitle>
              <DialogDescription>Set up a new pre-need memorial plan for a client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" placeholder="Enter client name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input id="contact" placeholder="Enter contact number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiary</Label>
                  <Input id="beneficiary" placeholder="Enter beneficiary name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="package">Package Type</Label>
                <Select>
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
                  <Label htmlFor="down-payment">Down Payment</Label>
                  <Input id="down-payment" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Payment Term (months)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="18">18 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any special requirements or notes..." rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90">Create Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-xl font-bold text-primary">{totalActiveContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-secondary">₱{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-accent-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-accent-foreground">₱{totalOutstanding.toLocaleString()}</p>
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
                <p className="text-xl font-bold text-destructive">{overdueContracts}</p>
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
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.client}</p>
                            <p className="text-sm text-muted-foreground">{plan.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.planType}</p>
                            <p className="text-sm text-muted-foreground">{plan.lotSize}</p>
                          </div>
                        </TableCell>
                        <TableCell>₱{plan.totalAmount.toLocaleString()}</TableCell>
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
                        <TableCell>₱{plan.remainingBalance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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
              <CardTitle>Available Package Types</CardTitle>
              <p className="text-sm text-muted-foreground">Manage pre-need package offerings</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTypes.map((pkg, index) => (
                  <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <p className="text-2xl font-bold text-primary">₱{pkg.price.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
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
    </div>
  );
}