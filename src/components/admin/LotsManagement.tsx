import React, { useState } from 'react';
import { Plus, Search, Filter, Map, Grid3X3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function LotsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const lots = [
    { id: 'A-001', section: 'A', status: 'available', price: 45000, size: '2x3m', location: 'Garden Section' },
    { id: 'A-002', section: 'A', status: 'reserved', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Maria Santos' },
    { id: 'A-003', section: 'A', status: 'sold', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Juan Cruz' },
    { id: 'B-001', section: 'B', status: 'available', price: 55000, size: '3x3m', location: 'Premium Section' },
    { id: 'B-002', section: 'B', status: 'reserved', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Pedro Garcia' },
    { id: 'B-003', section: 'B', status: 'sold', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Ana Lopez' },
    { id: 'C-001', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section' },
    { id: 'C-002', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section' },
    { id: 'C-003', section: 'C', status: 'maintenance', price: 35000, size: '2x2m', location: 'Standard Section' },
  ];

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lot.client && lot.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSectionStats = () => {
    const stats = lots.reduce((acc, lot) => {
      if (!acc[lot.section]) {
        acc[lot.section] = { total: 0, available: 0, reserved: 0, sold: 0 };
      }
      acc[lot.section].total++;
      acc[lot.section][lot.status as keyof typeof acc[string]]++;
      return acc;
    }, {} as Record<string, any>);
    return stats;
  };

  const sectionStats = getSectionStats();

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredLots.map((lot) => (
        <Card key={lot.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{lot.id}</h3>
              <Badge className={getStatusColor(lot.status)}>
                {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>{lot.location}</p>
              <p>Size: {lot.size}</p>
              <p className="font-semibold text-foreground">₱{lot.price.toLocaleString()}</p>
              {lot.client && <p>Client: {lot.client}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lots Management</h2>
          <p className="text-muted-foreground">Manage burial lots and their status</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Lot
        </Button>
      </div>

      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sectionStats).map(([section, stats]) => (
          <Card key={section}>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Section {section}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: <span className="font-semibold">{stats.total}</span></div>
                <div>Available: <span className="font-semibold text-green-600">{stats.available || 0}</span></div>
                <div>Reserved: <span className="font-semibold text-yellow-600">{stats.reserved || 0}</span></div>
                <div>Sold: <span className="font-semibold text-red-600">{stats.sold || 0}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Lots</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <GridView />
          ) : (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-4" />
                <p>Interactive map view would be displayed here</p>
                <p className="text-sm">Integration with mapping service required</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}