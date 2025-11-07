import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Download, FileText, Stamp, Calendar, CheckCircle } from 'lucide-react';
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

export function DeedOfSales() {
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
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Full Payment',
      notes: 'Clean transfer, all documents complete'
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
      witness2: 'Maria Staff',
      notarizedBy: null,
      registrationNumber: null,
      titleNumber: null,
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Installment',
      notes: 'Awaiting final payment confirmation for notarization'
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
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Full Payment',
      notes: 'Premium lot transfer completed'
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
      witness2: 'Maria Staff',
      notarizedBy: null,
      registrationNumber: null,
      titleNumber: null,
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Installment',
      notes: 'Missing client identification documents'
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
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Full Payment',
      notes: 'Memorial garden lot, premium location'
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
      previousOwner: 'Dumaguete Memorial Park',
      paymentMethod: 'Full Payment',
      notes: 'Document preparation in progress'
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

  const completedDeeds = deedOfSales.filter(d => d.status === 'completed').length;
  const pendingDeeds = deedOfSales.filter(d => d.status === 'pending-notarization' || d.status === 'pending-documents').length;
  const totalValue = deedOfSales.reduce((sum, deed) => sum + deed.purchasePrice, 0);
  const monthlyDeeds = deedOfSales.filter(d => d.saleDate.startsWith('2024-12')).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deed of Sale</h2>
          <p className="text-muted-foreground">Manage property transfer documents and ownership records</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Deed of Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Deed of Sale</DialogTitle>
              <DialogDescription>Generate a new property transfer document</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input id="client-name" placeholder="Enter client name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot-number">Lot Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A-001">A-001 (2x3m)</SelectItem>
                      <SelectItem value="B-001">B-001 (3x3m)</SelectItem>
                      <SelectItem value="C-001">C-001 (2x2m)</SelectItem>
                      <SelectItem value="D-001">D-001 (3x4m)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-price">Purchase Price</Label>
                  <Input id="purchase-price" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-date">Sale Date</Label>
                  <Input id="sale-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Payment</SelectItem>
                      <SelectItem value="installment">Installment</SelectItem>
                      <SelectItem value="preneed">Pre-Need Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witness1">Witness 1</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select witness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Admin">John Admin</SelectItem>
                      <SelectItem value="Maria Staff">Maria Staff</SelectItem>
                      <SelectItem value="Lisa Lopez">Lisa Lopez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="witness2">Witness 2</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select witness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="John Admin">John Admin</SelectItem>
                      <SelectItem value="Maria Staff">Maria Staff</SelectItem>
                      <SelectItem value="Lisa Lopez">Lisa Lopez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notary">Notary Public</Label>
                  <Input id="notary" placeholder="Enter notary name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any special conditions or notes..." rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Save as Draft</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Create Deed</Button>
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
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Deeds</p>
                <p className="text-xl font-bold text-green-600">{completedDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Process</p>
                <p className="text-xl font-bold text-yellow-600">{pendingDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold text-blue-600">₱{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Stamp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold text-purple-600">{monthlyDeeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deeds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deeds">Deed of Sales</TabsTrigger>
          <TabsTrigger value="templates">Document Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="deeds" className="space-y-4">
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
                            <p className="text-sm text-muted-foreground">{deed.id}</p>
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
                          <div className="flex items-center space-x-2">
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
                                      <p className="text-sm text-muted-foreground">Payment Method</p>
                                      <p className="font-medium">{deed.paymentMethod}</p>
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
                                  {deed.notes && (
                                    <div>
                                      <p className="text-sm text-muted-foreground">Notes</p>
                                      <p className="font-medium">{deed.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
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

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <p className="text-sm text-muted-foreground">Manage deed of sale document templates and formats</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h3 className="font-semibold">Standard Deed Template</h3>
                      <p className="text-sm text-muted-foreground">Standard format for regular lot transfers</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <h3 className="font-semibold">Pre-Need Transfer Template</h3>
                      <p className="text-sm text-muted-foreground">Specialized template for pre-need plan transfers</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <h3 className="font-semibold">Family Plot Template</h3>
                      <p className="text-sm text-muted-foreground">Template for large family plot transfers</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-orange-600" />
                      <h3 className="font-semibold">Transfer of Rights Template</h3>
                      <p className="text-sm text-muted-foreground">Template for transferring existing rights</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}