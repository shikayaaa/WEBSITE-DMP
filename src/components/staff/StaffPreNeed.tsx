import React, { useState } from 'react';
import { Search, Eye, Calendar, DollarSign, Users, Package, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'sonner';

// Import Firebase hooks
import { usePreNeedContracts, usePackageTypes, useStaffStats } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';

export function StaffPreNeed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    console.log('Firebase Packages:', firebasePackages);
    console.log('Contracts Loading:', contractsLoading);
    console.log('Contracts Error:', contractsError);
  }, [staffName, allContracts, firebasePackages, contractsLoading, contractsError]);

  // Hardcoded package data as fallback
  const hardcodedPackageTypes = [
    { 
      id: 'basic-1',
      name: 'Basic Package', 
      price: 65000, 
      description: '2x2m lot, basic services', 
      features: ['Burial services', 'Basic marker', '1-year maintenance'] 
    },
    { 
      id: 'standard-1',
      name: 'Standard Package', 
      price: 85000, 
      description: '2x3m lot, standard services', 
      features: ['Burial services', 'Standard marker', '2-year maintenance', 'Flower arrangement'] 
    },
    { 
      id: 'deluxe-1',
      name: 'Deluxe Memorial Package', 
      price: 95000, 
      description: '3x3m lot, enhanced services', 
      features: ['Premium burial services', 'Deluxe marker', '3-year maintenance', 'Memorial garden access'] 
    },
    { 
      id: 'premium-1',
      name: 'Premium Memorial Package', 
      price: 120000, 
      description: '3x4m lot, premium services', 
      features: ['Full service burial', 'Premium memorial', '5-year maintenance', 'Priority scheduling'] 
    },
    { 
      id: 'family-1',
      name: 'Family Package', 
      price: 150000, 
      description: '4x4m lot, comprehensive services', 
      features: ['Multiple burial capacity', 'Family memorial', 'Lifetime maintenance', 'Exclusive access'] 
    },
  ];

  // Use Firebase packages if available, otherwise use hardcoded data
  // Add safety checks to ensure packageTypes is always an array
  const packageTypes = React.useMemo(() => {
    if (Array.isArray(firebasePackages) && firebasePackages.length > 0) {
      return firebasePackages;
    }
    return hardcodedPackageTypes;
  }, [firebasePackages]);
  
  // ALL contracts for the contracts tab - ensure it's always an array
  const preNeedPlans = React.useMemo(() => {
    if (Array.isArray(allContracts)) {
      return allContracts;
    }
    return [];
  }, [allContracts]);

  // Filter contracts based on search and status
  const filteredPlans = React.useMemo(() => {
    return preNeedPlans.filter(plan => {
      const matchesSearch = 
        plan.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.planType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.contractId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [preNeedPlans, searchTerm, statusFilter]);

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

  // Delete handler
  const handleDeleteContract = async (contract: any) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contractToDelete) return;
    
    try {
      setIsDeleting(true);
      
      // Delete from preNeedAgreements collection
      await deleteDoc(doc(db, 'preNeedAgreements', contractToDelete.id));
      
      // Show success message
      toast.success('Contract deleted successfully', {
        description: `Contract ${contractToDelete.contractId || contractToDelete.id} has been removed.`
      });
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      
      // Reload the page to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract', {
        description: 'An error occurred while deleting the contract. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe stats object with defaults
  const safeStats = React.useMemo(() => {
    return {
      myActiveContracts: stats?.myActiveContracts || 0,
      myTotalRevenue: stats?.myTotalRevenue || 0,
      myUpcomingPayments: stats?.myUpcomingPayments || 0,
      myOverdueAccounts: stats?.myOverdueAccounts || 0,
    };
  }, [stats]);

  // Loading state
  if (contractsLoading || packagesLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading pre-need contracts...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (contractsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-destructive mb-4">
            Error loading contracts: {contractsError}
          </div>
          <Button onClick={() => window.location.reload()}>
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
                <p className="text-xl font-bold text-primary">{safeStats.myActiveContracts}</p>
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
                <p className="text-xl font-bold text-secondary">₱{safeStats.myTotalRevenue.toLocaleString()}</p>
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
                <p className="text-xl font-bold text-accent-foreground">{safeStats.myUpcomingPayments}</p>
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
                <p className="text-xl font-bold text-destructive">{safeStats.myOverdueAccounts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">All Pre-Need Contracts ({preNeedPlans.length})</TabsTrigger>
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
                            <div className="flex items-center gap-2">
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
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteContract(plan)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
              <CardTitle>Available Pre-Need Packages</CardTitle>
              <p className="text-sm text-muted-foreground">Information about available memorial packages for client inquiries</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packageTypes && packageTypes.length > 0 ? (
                  packageTypes.map((pkg, index) => (
                    <Card key={pkg.id || `pkg-${index}`} className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">{pkg.name || 'Unnamed Package'}</h3>
                          <p className="text-2xl font-bold text-primary">₱{(pkg.price || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{pkg.description || 'No description available'}</p>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">Features:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {(pkg.features || []).map((feature, idx) => (
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
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No packages available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pre-Need Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {contractToDelete && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Contract ID:</span>
                <span className="text-sm font-medium">{contractToDelete.contractId || contractToDelete.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{contractToDelete.client || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Package:</span>
                <span className="text-sm font-medium">{contractToDelete.planType || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(contractToDelete.status || 'active')}>
                  {(contractToDelete.status || 'active').charAt(0).toUpperCase() + (contractToDelete.status || 'active').slice(1)}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contract
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}