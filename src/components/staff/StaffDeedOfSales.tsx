import React, { useState } from 'react';
import { Search, Eye, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function StaffDeedOfSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const deedOfSales = [
    {
      id: 'DOS-001',
      deedNumber: 'DMD-2024-001',
      client: 'Maria Santos',
      lot: 'A-002',
      lotSize: '2x3m',
      purchasePrice: 45000,
      saleDate: '2024-10-15',
      transferDate: '2024-10-20',
      status: 'completed',
      witness1: 'John Admin',
      witness2: 'Lisa Lopez',
      notarizedBy: 'Atty. Carlos Mendoza',
      registrationNumber: 'REG-2024-045',
      titleNumber: 'TCT-001-2024',
      assistedBy: 'Jean',
      clientContact: '+63 912 345 6789',
      clientEmail: 'maria.santos@email.com'
    },
    {
      id: 'DOS-002',
      deedNumber: 'DMD-2024-002',
      client: 'Pedro Garcia',
      lot: 'B-002',
      lotSize: '3x3m',
      purchasePrice: 55000,
      saleDate: '2024-11-01',
      transferDate: null,
      status: 'pending-notarization',
      witness1: 'John Admin',
      witness2: 'Jean',
      notarizedBy: null,
      registrationNumber: null,
      titleNumber: null,
      assistedBy: 'Lisa Lopez',
      clientContact: '+63 923 456 7890',
      clientEmail: 'pedro.garcia@email.com'
    },
    {
      id: 'DOS-003',
      deedNumber: 'DMD-2024-003',
      client: 'Ana Lopez',
      lot: 'B-003',
      lotSize: '3x3m',
      purchasePrice: 55000,
      saleDate: '2024-10-05',
      transferDate: '2024-10-12',
      status: 'completed',
      witness1: 'John Admin',
      witness2: 'Lisa Lopez',
      notarizedBy: 'Atty. Rosa Villanueva',
      registrationNumber: 'REG-2024-038',
      titleNumber: 'TCT-002-2024',
      assistedBy: 'Jean',
      clientContact: '+63 934 567 8901',
      clientEmail: 'ana.lopez@email.com'
    },
    {
      id: 'DOS-004',
      deedNumber: 'DMD-2024-004',
      client: 'Carlos Rivera',
      lot: 'C-005',
      lotSize: '2x2m',
      purchasePrice: 35000,
      saleDate: '2024-09-10',
      transferDate: null,
      status: 'pending-documents',
      witness1: 'John Admin',
      witness2: 'Jean',
      notarizedBy: null,
      registrationNumber: null,
      titleNumber: null,
      assistedBy: 'Jean',
      clientContact: '+63 945 678 9012',
      clientEmail: 'carlos.rivera@email.com'
    },
    {
      id: 'DOS-005',
      deedNumber: 'DMD-2024-005',
      client: 'Rosa Garcia',
      lot: 'D-002',
      lotSize: '3x4m',
      purchasePrice: 65000,
      saleDate: '2024-11-10',
      transferDate: '2024-11-15',
      status: 'completed',
      witness1: 'John Admin',
      witness2: 'Lisa Lopez',
      notarizedBy: 'Atty. Miguel Torres',
      registrationNumber: 'REG-2024-052',
      titleNumber: 'TCT-003-2024',
      assistedBy: 'Lisa Lopez',
      clientContact: '+63 956 789 0123',
      clientEmail: 'rosa.garcia@email.com'
    },
    {
      id: 'DOS-006',
      deedNumber: 'DMD-2024-006',
      client: 'Juan Dela Cruz',
      lot: 'A-003',
      lotSize: '2x3m',
      purchasePrice: 45000,
      saleDate: '2024-11-28',
      transferDate: null,
      status: 'draft',
      witness1: null,
      witness2: null,
      notarizedBy: null,
      registrationNumber: null,
      titleNumber: null,
      assistedBy: 'Jean',
      clientContact: '+63 967 890 1234',
      clientEmail: 'juan.delacruz@email.com'
    },
  ];

  const filteredDeeds = deedOfSales.filter(deed => {
    const matchesSearch = deed.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.deedNumber.toLowerCase().includes(searchTerm.toLowerCase());
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

  const myCompletedDeeds = deedOfSales.filter(d => d.assistedBy === 'Jean' && d.status === 'completed').length;
  const myPendingDeeds = deedOfSales.filter(d => d.assistedBy === 'Jean' && (d.status === 'pending-notarization' || d.status === 'pending-documents')).length;
  const myTotalValue = deedOfSales.filter(d => d.assistedBy === 'Jean').reduce((sum, deed) => sum + deed.purchasePrice, 0);
  const thisMonthDeeds = deedOfSales.filter(d => d.assistedBy === 'Jean' && d.saleDate.startsWith('2024-12')).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deed of Sales</h2>
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
                <p className="text-xl font-bold text-green-600">{myCompletedDeeds}</p>
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
                <p className="text-xl font-bold text-yellow-600">{myPendingDeeds}</p>
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
                <p className="text-xl font-bold text-blue-600">₱{myTotalValue.toLocaleString()}</p>
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
                <p className="text-xl font-bold text-purple-600">{thisMonthDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-deeds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-deeds">All Deeds</TabsTrigger>
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
                    {filteredDeeds.map((deed) => (
                      <TableRow key={deed.id}>
                        <TableCell className="font-medium">{deed.deedNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{deed.client}</p>
                            <p className="text-sm text-muted-foreground">{deed.clientContact}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{deed.lot}</p>
                            <p className="text-sm text-muted-foreground">{deed.lotSize}</p>
                          </div>
                        </TableCell>
                        <TableCell>₱{deed.purchasePrice.toLocaleString()}</TableCell>
                        <TableCell>{deed.saleDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(deed.status)}>
                            {deed.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                                <DialogTitle>Deed of Sale Details - {deed.deedNumber}</DialogTitle>
                                <DialogDescription>Complete deed information and transfer details</DialogDescription>
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
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{deed.clientEmail}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Lot</p>
                                    <p className="font-medium">{deed.lot} ({deed.lotSize})</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Purchase Price</p>
                                    <p className="font-medium">₱{deed.purchasePrice.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Sale Date</p>
                                    <p className="font-medium">{deed.saleDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Transfer Date</p>
                                    <p className="font-medium">{deed.transferDate || 'Pending'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Assisted By</p>
                                    <p className="font-medium">{deed.assistedBy}</p>
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
                                    <Badge className={getStatusColor(deed.status)}>
                                      {deed.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
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
                  .filter(deed => deed.assistedBy === 'Jean')
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
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Contact Client
                            </Button>
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
    </div>
  );
}