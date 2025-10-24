import React, { useState } from 'react';
import { Search, Filter, MapPin, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export function StaffLots() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');

  const lots = [
    { id: 'A-001', section: 'A', status: 'available', price: 45000, size: '2x3m', location: 'Garden Section', description: 'Peaceful garden setting with mature trees' },
    { id: 'A-002', section: 'A', status: 'assigned', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Maria Santos', description: 'Peaceful garden setting with mature trees' },
    { id: 'A-003', section: 'A', status: 'occupied', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Juan Cruz', description: 'Peaceful garden setting with mature trees' },
    { id: 'B-001', section: 'B', status: 'available', price: 55000, size: '3x3m', location: 'Premium Section', description: 'Premium location with excellent accessibility' },
    { id: 'B-002', section: 'B', status: 'assigned', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Pedro Garcia', description: 'Premium location with excellent accessibility' },
    { id: 'B-003', section: 'B', status: 'occupied', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Ana Lopez', description: 'Premium location with excellent accessibility' },
    { id: 'C-001', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section', description: 'Well-maintained standard burial plot' },
    { id: 'C-002', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section', description: 'Well-maintained standard burial plot' },
    { id: 'C-003', section: 'C', status: 'maintenance', price: 35000, size: '2x2m', location: 'Standard Section', description: 'Well-maintained standard burial plot' },
    { id: 'D-001', section: 'D', status: 'available', price: 65000, size: '3x4m', location: 'Memorial Garden', description: 'Exclusive memorial garden with water features' },
    { id: 'D-002', section: 'D', status: 'assigned', price: 65000, size: '3x4m', location: 'Memorial Garden', client: 'Rosa Garcia', description: 'Exclusive memorial garden with water features' },
  ];

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lot.client && lot.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    const matchesSection = sectionFilter === 'all' || lot.section === sectionFilter;
    return matchesSearch && matchesStatus && matchesSection;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSectionStats = () => {
    const stats = lots.reduce((acc, lot) => {
      if (!acc[lot.section]) {
        acc[lot.section] = { total: 0, available: 0, assigned: 0, occupied: 0 };
      }
      acc[lot.section].total++;
      if (lot.status === 'available') acc[lot.section].available++;
      if (lot.status === 'assigned') acc[lot.section].assigned++;
      if (lot.status === 'occupied') acc[lot.section].occupied++;
      return acc;
    }, {} as Record<string, any>);
    return stats;
  };

  const sectionStats = getSectionStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lots Information</h2>
          <p className="text-muted-foreground">View burial lots and their availability</p>
        </div>
      </div>

      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(sectionStats).map(([section, stats]) => (
          <Card key={section}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Section {section}
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-semibold text-green-600">{stats.available || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned:</span>
                  <span className="font-semibold text-yellow-600">{stats.assigned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied:</span>
                  <span className="font-semibold text-red-600">{stats.occupied || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lot Directory</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search lots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                <SelectItem value="A">Section A</SelectItem>
                <SelectItem value="B">Section B</SelectItem>
                <SelectItem value="C">Section C</SelectItem>
                <SelectItem value="D">Section D</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.id}</TableCell>
                    <TableCell>{lot.location}</TableCell>
                    <TableCell>{lot.size}</TableCell>
                    <TableCell>₱{lot.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lot.status)}>
                        {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{lot.client || '-'}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Lot Details - {lot.id}</DialogTitle>
                            <DialogDescription>Detailed information for this burial lot</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium">{lot.location}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Section</p>
                                <p className="font-medium">Section {lot.section}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Size</p>
                                <p className="font-medium">{lot.size}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-medium">₱{lot.price.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={getStatusColor(lot.status)}>
                                  {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
                                </Badge>
                              </div>
                              {lot.client && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Assigned to</p>
                                  <p className="font-medium">{lot.client}</p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Description</p>
                              <p className="font-medium">{lot.description}</p>
                            </div>
                            
                            {lot.status === 'available' && (
                              <div className="mt-4 p-3 bg-green-50 rounded-md">
                                <p className="text-sm text-green-800">
                                  This lot is available for reservation. Contact admin for booking procedures.
                                </p>
                              </div>
                            )}
                            
                            {lot.status === 'maintenance' && (
                              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                                <p className="text-sm text-yellow-800">
                                  This lot is currently under maintenance. Expected completion: TBD
                                </p>
                              </div>
                            )}
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
    </div>
  );
}