import React, { useState } from 'react';
import { Plus, Search, Filter, Map, Grid3X3, Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface Lot {
  id: string;
  section: string;
  status: string;
  price: number;
  size: string;
  location: string;
  client?: string;
}

export function LotsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [addLotOpen, setAddLotOpen] = useState(false);
  const [viewLotOpen, setViewLotOpen] = useState(false);
  const [editLotOpen, setEditLotOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);

  // New Lot Form State
  const [newLot, setNewLot] = useState({
    lotNumber: '',
    section: '',
    size: '',
    location: '',
    price: '',
    status: 'available',
    ownerName: ''
  });

  const [lots, setLots] = useState<Lot[]>([
    { id: 'A-001', section: 'A', status: 'available', price: 45000, size: '2x3m', location: 'Garden Section' },
    { id: 'A-002', section: 'A', status: 'reserved', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Maria Santos' },
    { id: 'A-003', section: 'A', status: 'sold', price: 45000, size: '2x3m', location: 'Garden Section', client: 'Juan Cruz' },
    { id: 'B-001', section: 'B', status: 'available', price: 55000, size: '3x3m', location: 'Premium Section' },
    { id: 'B-002', section: 'B', status: 'reserved', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Pedro Garcia' },
    { id: 'B-003', section: 'B', status: 'sold', price: 55000, size: '3x3m', location: 'Premium Section', client: 'Ana Lopez' },
    { id: 'C-001', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section' },
    { id: 'C-002', section: 'C', status: 'available', price: 35000, size: '2x2m', location: 'Standard Section' },
    { id: 'C-003', section: 'C', status: 'maintenance', price: 35000, size: '2x2m', location: 'Standard Section' },
  ]);

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

  // Handle Add New Lot
  const handleAddLot = () => {
    if (!newLot.lotNumber || !newLot.section || !newLot.size || !newLot.location || !newLot.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const lotData: Lot = {
      id: newLot.lotNumber,
      section: newLot.section,
      status: newLot.status,
      price: parseFloat(newLot.price),
      size: newLot.size,
      location: newLot.location,
      client: newLot.ownerName || undefined
    };

    setLots([...lots, lotData]);
    setAddLotOpen(false);
    setNewLot({
      lotNumber: '',
      section: '',
      size: '',
      location: '',
      price: '',
      status: 'available',
      ownerName: ''
    });
    toast.success('Lot added successfully!');
  };

  // Handle View Lot Details
  const handleViewLot = (lot: Lot) => {
    setSelectedLot(lot);
    setViewLotOpen(true);
  };

  // Handle Edit Lot
  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setEditLotOpen(true);
  };

  const handleSaveEditLot = () => {
    if (!editingLot) return;

    setLots(lots.map(l => 
      l.id === editingLot.id ? editingLot : l
    ));
    setEditLotOpen(false);
    setEditingLot(null);
    toast.success('Lot updated successfully!');
  };

  const isFormValid = newLot.lotNumber && newLot.section && newLot.size && newLot.location && newLot.price;

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredLots.map((lot) => (
        <Card key={lot.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
         <CardContent className="pt-6 px-6 pb-8">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-primary">{lot.id}</h3>
              <Badge className={getStatusColor(lot.status)}>
                {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <p className="flex items-center gap-2">
                <span className="font-medium text-foreground">Location:</span> {lot.location}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-foreground">Size:</span> {lot.size}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-primary text-base">₱{lot.price.toLocaleString()}</span>
              </p>
              {lot.client && (
                <p className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Owner:</span> {lot.client}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-primary hover:bg-primary/10"
                onClick={() => handleViewLot(lot)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-primary hover:bg-primary/10"
                onClick={() => handleEditLot(lot)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
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
        <Button 
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => setAddLotOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Lot
        </Button>
      </div>

      {/* Add New Lot Dialog */}
      <Dialog open={addLotOpen} onOpenChange={setAddLotOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Lot</DialogTitle>
            <DialogDescription>
              Enter the details for the new burial lot
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotNumber">Lot Number <span className="text-red-500">*</span></Label>
                <Input
                  id="lotNumber"
                  placeholder="e.g., A-001"
                  value={newLot.lotNumber}
                  onChange={(e) => setNewLot({ ...newLot, lotNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section <span className="text-red-500">*</span></Label>
                <Select
                  value={newLot.section}
                  onValueChange={(value) => setNewLot({ ...newLot, section: value })}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A - Garden</SelectItem>
                    <SelectItem value="B">Section B - Premium</SelectItem>
                    <SelectItem value="C">Section C - Standard</SelectItem>
                    <SelectItem value="D">Section D - Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size <span className="text-red-500">*</span></Label>
                <Input
                  id="size"
                  placeholder="e.g., 2x3m"
                  value={newLot.size}
                  onChange={(e) => setNewLot({ ...newLot, size: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 45000"
                  value={newLot.price}
                  onChange={(e) => setNewLot({ ...newLot, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                placeholder="e.g., Garden Section"
                value={newLot.location}
                onChange={(e) => setNewLot({ ...newLot, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newLot.status}
                onValueChange={(value) => setNewLot({ ...newLot, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name (Optional)</Label>
              <Input
                id="ownerName"
                placeholder="Enter owner name if applicable"
                value={newLot.ownerName}
                onChange={(e) => setNewLot({ ...newLot, ownerName: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddLotOpen(false);
                setNewLot({ lotNumber: '', section: '', size: '', location: '', price: '', status: 'available', ownerName: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleAddLot}
              disabled={!isFormValid}
            >
              Add Lot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lot Dialog */}
      <Dialog open={editLotOpen} onOpenChange={setEditLotOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Lot</DialogTitle>
            <DialogDescription>
              Update the details for this burial lot
            </DialogDescription>
          </DialogHeader>
          {editingLot && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lotNumber">Lot Number</Label>
                  <Input
                    id="edit-lotNumber"
                    value={editingLot.id}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-section">Section</Label>
                  <Select
                    value={editingLot.section}
                    onValueChange={(value) => setEditingLot({ ...editingLot, section: value })}
                  >
                    <SelectTrigger id="edit-section">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A - Garden</SelectItem>
                      <SelectItem value="B">Section B - Premium</SelectItem>
                      <SelectItem value="C">Section C - Standard</SelectItem>
                      <SelectItem value="D">Section D - Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Size</Label>
                  <Input
                    id="edit-size"
                    value={editingLot.size}
                    onChange={(e) => setEditingLot({ ...editingLot, size: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₱)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingLot.price}
                    onChange={(e) => setEditingLot({ ...editingLot, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingLot.location}
                  onChange={(e) => setEditingLot({ ...editingLot, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingLot.status}
                  onValueChange={(value) => setEditingLot({ ...editingLot, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ownerName">Owner Name (Optional)</Label>
                <Input
                  id="edit-ownerName"
                  value={editingLot.client || ''}
                  onChange={(e) => setEditingLot({ ...editingLot, client: e.target.value || undefined })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditLotOpen(false);
                setEditingLot(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleSaveEditLot}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lot Details Dialog */}
      <Dialog open={viewLotOpen} onOpenChange={setViewLotOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Lot Details</DialogTitle>
            <DialogDescription>
              Complete information about this lot
            </DialogDescription>
          </DialogHeader>
          {selectedLot && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Lot Number</Label>
                  <p className="font-medium">{selectedLot.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Section</Label>
                  <p className="font-medium">Section {selectedLot.section}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p className="font-medium">{selectedLot.size}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-medium text-primary">₱{selectedLot.price.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{selectedLot.location}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedLot.status)}>
                    {selectedLot.status.charAt(0).toUpperCase() + selectedLot.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedLot.client && (
                <div>
                  <Label className="text-muted-foreground">Owner</Label>
                  <p className="font-medium">{selectedLot.client}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewLotOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sectionStats).map(([section, stats]) => (
          <Card key={section} className="border-l-4 border-l-primary">
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

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
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
        <CardContent className="pt-6">
          {viewMode === 'grid' ? (
            <GridView />
          ) : (
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-4 text-primary" />
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
