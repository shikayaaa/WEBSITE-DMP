import React, { useState } from 'react';
import { Search, Eye, FileText, Calendar, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
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
import { useDeedOfSales, useStaffDeedStats } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';

export function StaffDeedOfSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deedToDelete, setDeedToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get current user from auth context
  const { userData } = useAuth();
  const staffName = userData?.name || userData?.displayName || 'Staff';
  
  // Fetch deeds from Firebase
  const { deeds: deedOfSales, loading, error } = useDeedOfSales();
  const { stats, loading: statsLoading } = useStaffDeedStats(staffName);

  const filteredDeeds = deedOfSales.filter(deed => {
    const matchesSearch = deed.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.lot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.deedNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deed.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending-notarization': return 'bg-yellow-100 text-yellow-800';
      case 'pending-documents': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending-notarization': return Clock;
      case 'pending-documents': return AlertCircle;
      case 'draft': return FileText;
      default: return FileText;
    }
  };

  // Delete handlers
  const handleDeleteDeed = (deed: any) => {
    setDeedToDelete(deed);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deedToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await deleteDoc(doc(db, 'deedOfSales', deedToDelete.id));
      
      toast.success('Deed of Sale deleted successfully', {
        description: `Deed ${deedToDelete.deedNumber} has been removed.`
      });
      
      setDeleteDialogOpen(false);
      setDeedToDelete(null);
    } catch (error) {
      console.error('Error deleting deed:', error);
      toast.error('Failed to delete deed', {
        description: 'An error occurred while deleting the deed. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Loading deed of sales...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg text-destructive mb-4">
            Error loading deeds: {error}
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
          <h2 className="text-2xl font-bold">Deed of Sale</h2>
          <p className="text-muted-foreground">View property transfer documents and assist clients</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">My Completed Deeds</p>
                <p className="text-xl font-bold text-green-600">{stats.myCompletedDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Process</p>
                <p className="text-xl font-bold text-yellow-600">{stats.myPendingDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">My Total Value</p>
                <p className="text-xl font-bold text-blue-600">₱{stats.myTotalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-purple-600">{stats.thisMonthDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-deeds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-deeds">All Deeds ({deedOfSales.length})</TabsTrigger>
          <TabsTrigger value="my-deeds">My Assisted Deeds</TabsTrigger>
          <TabsTrigger value="pending">Pending Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="all-deeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deed of Sales Records</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search deeds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending-notarization">Pending Notarization</SelectItem>
                    <SelectItem value="pending-documents">Pending Documents</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deed Number</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Lot</TableHead>
                      <TableHead>Purchase Price</TableHead>
                      <TableHead>Sale Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeeds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {deedOfSales.length === 0 
                            ? 'No deeds of sale found in the system' 
                            : 'No deeds match your search criteria'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeeds.map((deed) => (
                        <TableRow key={deed.id}>
                          <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deed.client || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{deed.clientContact || 'No contact'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{deed.lot || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{deed.lotSize || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>₱{(deed.purchasePrice || 0).toLocaleString()}</TableCell>
                          <TableCell>{deed.saleDate || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(deed.status || 'draft')}>
                              {(deed.status || 'draft').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                                    <DialogTitle>Deed of Sale Details - {deed.deedNumber}</DialogTitle>
                                    <DialogDescription>Complete deed information and transfer details</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Client</p>
                                        <p className="font-medium">{deed.client || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Contact</p>
                                        <p className="font-medium">{deed.clientContact || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{deed.clientEmail || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Lot</p>
                                        <p className="font-medium">{deed.lot} ({deed.lotSize})</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                                        <p className="font-medium">₱{(deed.purchasePrice || 0).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Sale Date</p>
                                        <p className="font-medium">{deed.saleDate || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Transfer Date</p>
                                        <p className="font-medium">{deed.transferDate || 'Pending'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Assisted By</p>
                                        <p className="font-medium">{deed.assistedBy || 'Unassigned'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Witness 1</p>
                                        <p className="font-medium">{deed.witness1 || 'Not assigned'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Witness 2</p>
                                        <p className="font-medium">{deed.witness2 || 'Not assigned'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Notarized By</p>
                                        <p className="font-medium">{deed.notarizedBy || 'Pending'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Registration Number</p>
                                        <p className="font-medium">{deed.registrationNumber || 'Pending'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Title Number</p>
                                        <p className="font-medium">{deed.titleNumber || 'Pending'}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <Badge className={getStatusColor(deed.status || 'draft')}>
                                          {(deed.status || 'draft').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteDeed(deed)}
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

        <TabsContent value="my-deeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assisted Deeds</CardTitle>
              <p className="text-sm text-muted-foreground">Deeds that you have assisted clients with</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deedOfSales
                  .filter(deed => deed.assistedBy === staffName)
                  .map((deed) => {
                    const StatusIcon = getStatusIcon(deed.status);
                    return (
                      <Card key={deed.id} className="border-l-4 border-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{deed.client}</h3>
                              <p className="text-sm text-muted-foreground">{deed.deedNumber}</p>
                            </div>
                            <Badge className={getStatusColor(deed.status)}>
                              {deed.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Lot</p>
                                <p className="font-medium">{deed.lot} ({deed.lotSize})</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Value</p>
                              <p className="font-medium">₱{deed.purchasePrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Sale Date</p>
                              <p className="font-medium">{deed.saleDate}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Deed Details - {deed.deedNumber}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Client</p>
                                      <p className="font-medium">{deed.client}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contact</p>
                                      <p className="font-medium">{deed.clientContact}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={getStatusColor(deed.status)}>
                                        {deed.status.replace('-', ' ')}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Transfer Date</p>
                                      <p className="font-medium">{deed.transferDate || 'Pending'}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {deedOfSales.filter(deed => deed.assistedBy === staffName).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No deeds assigned to you yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <p className="text-sm text-muted-foreground">Deeds requiring attention or follow-up</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deedOfSales
                  .filter(deed => deed.status === 'pending-notarization' || deed.status === 'pending-documents')
                  .map((deed) => {
                    const StatusIcon = getStatusIcon(deed.status);
                    return (
                      <Card key={deed.id} className="border-l-4 border-yellow-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{deed.client}</h3>
                              <p className="text-sm text-muted-foreground">{deed.deedNumber} • {deed.lot}</p>
                            </div>
                            <Badge className={getStatusColor(deed.status)}>
                              {deed.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-3">
                            <StatusIcon className="h-4 w-4 text-yellow-600" />
                            <p className="text-sm text-muted-foreground">
                              {deed.status === 'pending-notarization' ? 'Awaiting notarization appointment' : 'Missing required documents'}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Deed Details - {deed.deedNumber}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Client</p>
                                      <p className="font-medium">{deed.client}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contact</p>
                                      <p className="font-medium">{deed.clientContact}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={getStatusColor(deed.status)}>
                                        {deed.status.replace('-', ' ')}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {deedOfSales.filter(deed => deed.status === 'pending-notarization' || deed.status === 'pending-documents').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>No pending actions at this time</p>
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
            <DialogTitle>Delete Deed of Sale</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deed? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deedToDelete && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Deed Number:</span>
                <span className="text-sm font-medium">{deedToDelete.deedNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{deedToDelete.client}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Lot:</span>
                <span className="text-sm font-medium">{deedToDelete.lot}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(deedToDelete.status)}>
                  {deedToDelete.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                  Delete Deed
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}