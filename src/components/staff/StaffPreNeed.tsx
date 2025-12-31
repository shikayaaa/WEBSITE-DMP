import React, { useState } from 'react';
import { Search, Eye, Calendar, DollarSign, Users, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Import Firebase hooks
import { usePreNeedContracts, usePackageTypes, useStaffStats } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';

export function StaffPreNeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get current user from auth context
  const { userData } = useAuth();
  const staffName = userData?.name || 'Jean';
  
  // Fetch ALL contracts from Firebase (not filtered by staff)
  const { contracts: allContracts, loading: contractsLoading, error: contractsError } = usePreNeedContracts();
  const { packages: firebasePackages, loading: packagesLoading } = usePackageTypes();
  const { stats, loading: statsLoading } = useStaffStats(staffName);

  // Log for debugging
  React.useEffect(() => {
    console.log('Staff Pre-Need Component Loaded');
    console.log('Current Staff:', staffName);
    console.log('All Contracts:', allContracts);
    console.log('Contracts Loading:', contractsLoading);
    console.log('Contracts Error:', contractsError);
  }, [staffName, allContracts, contractsLoading, contractsError]);

  // Hardcoded package data as fallback
  const hardcodedPackageTypes = [
    { name: 'Basic Package', price: 65000, description: '2x2m lot, basic services', features: ['Burial services', 'Basic marker', '1-year maintenance'] },
    { name: 'Standard Package', price: 85000, description: '2x3m lot, standard services', features: ['Burial services', 'Standard marker', '2-year maintenance', 'Flower arrangement'] },
    { name: 'Deluxe Memorial Package', price: 95000, description: '3x3m lot, enhanced services', features: ['Premium burial services', 'Deluxe marker', '3-year maintenance', 'Memorial garden access'] },
    { name: 'Premium Memorial Package', price: 120000, description: '3x4m lot, premium services', features: ['Full service burial', 'Premium memorial', '5-year maintenance', 'Priority scheduling'] },
    { name: 'Family Package', price: 150000, description: '4x4m lot, comprehensive services', features: ['Multiple burial capacity', 'Family memorial', 'Lifetime maintenance', 'Exclusive access'] },
  ];

  // Use Firebase packages if available, otherwise use hardcoded data
  const packageTypes = firebasePackages.length > 0 ? firebasePackages : hardcodedPackageTypes;
  
  // ALL contracts for the contracts tab
  const preNeedPlans = allContracts;

  // Filter contracts based on search and status
  const filteredPlans = preNeedPlans.filter(plan => {
    const matchesSearch = 
      plan.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.contractId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper functions
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
    if (!termMonths || termMonths === 0) return 0;
    return Math.round((paidMonths / termMonths) * 100);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toISOString().split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Loading state
  if (contractsLoading || packagesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading pre-need contracts...</div>
      </div>
    );
  }

  // Error state
  if (contractsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-destructive">
          Error loading contracts: {contractsError}
          <br />
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
                <p className="text-xl font-bold text-primary">{stats.myActiveContracts}</p>
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
                <p className="text-xl font-bold text-secondary">₱{stats.myTotalRevenue.toLocaleString()}</p>
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
                <p className="text-xl font-bold text-accent-foreground">{stats.myUpcomingPayments}</p>
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
                <p className="text-xl font-bold text-destructive">{stats.myOverdueAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

   <Tabs defaultValue="contracts" className="space-y-4">
  <TabsList>
    <TabsTrigger value="contracts">All Pre-Need Contracts ({allContracts.length})</TabsTrigger>
    <TabsTrigger value="packages">Package Information</TabsTrigger>
  </TabsList>
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Pre-Need Contracts</CardTitle>
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
                    {filteredPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {preNeedPlans.length === 0 
                            ? 'No pre-need contracts found in the system' 
                            : 'No contracts match your search criteria'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.contractId || plan.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{plan.client || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{plan.contact || plan.email || 'No contact'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{plan.planType || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{plan.lotSize || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{plan.paidMonths || 0}/{plan.termMonths || 0} months</span>
                                <span>{calculateProgress(plan.paidMonths || 0, plan.termMonths || 0)}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${calculateProgress(plan.paidMonths || 0, plan.termMonths || 0)}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{plan.nextPaymentDue ? formatDate(plan.nextPaymentDue) : 'Completed'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(plan.status || 'active')}>
                              {(plan.status || 'active').charAt(0).toUpperCase() + (plan.status || 'active').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Pre-Need Contract Details - {plan.contractId || plan.id}</DialogTitle>
                                  <DialogDescription>Complete contract information</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contract ID</p>
                                      <p className="font-medium">{plan.contractId || plan.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Client</p>
                                      <p className="font-medium">{plan.client || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Email</p>
                                      <p className="font-medium">{plan.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contact</p>
                                      <p className="font-medium">{plan.contact || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Beneficiary</p>
                                      <p className="font-medium">{plan.beneficiary || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Package Type</p>
                                      <p className="font-medium">{plan.planType || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Lot Size</p>
                                      <p className="font-medium">{plan.lotSize || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Total Amount</p>
                                      <p className="font-medium">₱{(plan.totalAmount || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Down Payment</p>
                                      <p className="font-medium">₱{(plan.downPayment || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Monthly Payment</p>
                                      <p className="font-medium">₱{(plan.monthlyPayment || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Remaining Balance</p>
                                      <p className="font-medium">₱{(plan.remainingBalance || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Payment Progress</p>
                                      <p className="font-medium">{plan.paidMonths || 0}/{plan.termMonths || 0} months</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contract Period</p>
                                      <p className="font-medium">{formatDate(plan.startDate)} to {formatDate(plan.endDate)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Assigned Staff</p>
                                      <p className="font-medium">{plan.assignedStaff || 'Unassigned'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={getStatusColor(plan.status || 'active')}>
                                        {(plan.status || 'active').charAt(0).toUpperCase() + (plan.status || 'active').slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
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
              <CardTitle>Available Pre-Need Packages</CardTitle>
              <p className="text-sm text-muted-foreground">Information about available memorial packages for client inquiries</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTypes.map((pkg, index) => (
                  <Card key={pkg.id || index} className="border-2">
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

   
      </Tabs>
    </div>
  );
}