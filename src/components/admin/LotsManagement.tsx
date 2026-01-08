import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Map, Grid3X3, Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { where, Timestamp } from 'firebase/firestore';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';

interface Lot {
  id: string;
  section: string;
  status: string;
  price: number;
  size: string;
  location: string;
  client?: string;
  firebaseId?: string;
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
  const [loading, setLoading] = useState(true);

  const [newLot, setNewLot] = useState({
    lotNumber: '',
    section: '',
    size: '',
    location: '',
    price: '',
    status: 'available',
    ownerName: '',
    row: '',
    column: ''
  });
  const [contacts, setContacts] = useState<any[]>([]);

// Load contacts from Firebase
useEffect(() => {
  const contactsRef = collection(db, 'contacts');
  const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
    const contactsData: any[] = [];
    snapshot.forEach((doc) => {
      contactsData.push({ id: doc.id, ...doc.data() });
    });
    setContacts(contactsData);
  });
  return () => unsubscribe();
}, []);

  const [lots, setLots] = useState<Lot[]>([]);

  // Load lots from Firebase on component mount
  useEffect(() => {
    const lotsRef = collection(db, 'lots');
    const q = query(lotsRef, orderBy('id'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lotsData: Lot[] = [];
      snapshot.forEach((doc) => {
        lotsData.push({
          firebaseId: doc.id,
          ...doc.data()
        } as Lot);
      });
      setLots(lotsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching lots:', error);
      toast.error('Failed to load lots');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const handleAddLot = async () => {
    if (!newLot.lotNumber || !newLot.section || !newLot.size || !newLot.location || !newLot.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
 const lotData = {
  id: newLot.lotNumber,
  section: newLot.section,
  status: newLot.status,
  price: parseFloat(newLot.price),
  size: newLot.size,
  location: newLot.location,
  client: (newLot.ownerName && newLot.ownerName !== 'none') ? newLot.ownerName : null,
  createdAt: new Date().toISOString()
};

      await addDoc(collection(db, 'lots'), lotData);
      
      setAddLotOpen(false);
      setNewLot({
        lotNumber: '',
        section: '',
        size: '',
        location: '',
        price: '',
        status: 'available',
        ownerName: '',
        row: '',
        column: ''
      });
      toast.success('Lot added successfully!');
    } catch (error) {
      console.error('Error adding lot:', error);
      toast.error('Failed to add lot');
    }
  };

  const handleViewLot = (lot: Lot) => {
    setSelectedLot(lot);
    setViewLotOpen(true);
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setEditLotOpen(true);
  };

  const handleSaveEditLot = async () => {
    if (!editingLot || !editingLot.firebaseId) return;

    try {
      const lotRef = doc(db, 'lots', editingLot.firebaseId);
      const updateData = {
        section: editingLot.section,
        status: editingLot.status,
        price: editingLot.price,
        size: editingLot.size,
        location: editingLot.location,
        client: editingLot.client || null,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(lotRef, updateData);
      // Update contact's relatedLots if client is assigned
    if (editingLot.client) {
      try {
        const contactsQuery = query(
          collection(db, 'contacts'),
          where('name', '==', editingLot.client)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        
        if (!contactsSnapshot.empty) {
          const contactDoc = contactsSnapshot.docs[0];
          const contactData = contactDoc.data();
          const currentLots = contactData.relatedLots || [];
          
          // Add lot ID if not already in the array
          if (!currentLots.includes(editingLot.id)) {
            await updateDoc(doc(db, 'contacts', contactDoc.id), {
              relatedLots: [...currentLots, editingLot.id],
              updatedAt: Timestamp.now()
            });
          }
        }
      } catch (contactUpdateError) {
        console.error('Failed to update contact lots:', contactUpdateError);
      }
    }
      
      setEditLotOpen(false);
      setEditingLot(null);
      toast.success('Lot updated successfully!');
    } catch (error) {
      console.error('Error updating lot:', error);
      toast.error('Failed to update lot');
    }
  };

  const handleDeleteLot = async (lot: Lot) => {
    if (!lot.firebaseId) return;
    
    if (window.confirm(`Are you sure you want to delete lot ${lot.id}?`)) {
      try {
        await deleteDoc(doc(db, 'lots', lot.firebaseId));
        toast.success('Lot deleted successfully!');
      } catch (error) {
        console.error('Error deleting lot:', error);
        toast.error('Failed to delete lot');
      }
    }
  };

  const isFormValid = newLot.lotNumber && newLot.section && newLot.size && newLot.location && newLot.price;

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredLots.map((lot) => (
        <Card key={lot.firebaseId} className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-base text-primary">{lot.id}</h3>
              <Badge className={getStatusColor(lot.status)}>
                {lot.status.charAt(0).toUpperCase() + lot.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
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
            <div className="flex items-center gap-2 pt-2 border-t">
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

  const MapView = () => {
    const lotsBySection: Record<string, Lot[]> = {};
    lots.forEach(lot => {
      if (!lotsBySection[lot.section]) {
        lotsBySection[lot.section] = [];
      }
      lotsBySection[lot.section].push(lot);
    });

    const getLotBgColor = (status: string) => {
      switch (status) {
        case 'available': return { backgroundColor: '#10b981', color: '#ffffff' };
        case 'reserved': return { backgroundColor: '#f59e0b', color: '#ffffff' };
        case 'sold': return { backgroundColor: '#ef4444', color: '#ffffff' };
        case 'maintenance': return { backgroundColor: '#94a3b8', color: '#ffffff' };
        default: return { backgroundColor: '#cbd5e1', color: '#1e293b' };
      }
    };

    const getLotHoverColor = (status: string) => {
      switch (status) {
        case 'available': return '#059669';
        case 'reserved': return '#d97706';
        case 'sold': return '#dc2626';
        case 'maintenance': return '#64748b';
        default: return '#94a3b8';
      }
    };

    return (
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-xl text-slate-800">Cemetery Plot Map</h3>
          <div className="flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-slate-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="text-slate-700">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-slate-700">Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#94a3b8' }}></div>
              <span className="text-slate-700">Maintenance</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(lotsBySection).map(([section, sectionLots]) => {
            const gridCols = Math.min(Math.ceil(Math.sqrt(sectionLots.length * 1.5)), 4);
            const gridClass = `grid gap-4 ${
              gridCols === 1 ? 'grid-cols-1' :
              gridCols === 2 ? 'grid-cols-2' :
              gridCols === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`;

            return (
              <div key={section} className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                <h4 className="font-semibold mb-5 text-center bg-gradient-to-r from-blue-100 to-blue-200 py-3 rounded-lg text-slate-800 text-base">
                  {section}
                </h4>
                
                <div className={gridClass}>
                  {sectionLots.map((lot) => (
                    <button
                      key={lot.firebaseId}
                      style={getLotBgColor(lot.status)}
                      className="rounded-2xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl cursor-pointer shadow-md min-h-[120px] flex flex-col items-center justify-center active:scale-95"
                      onClick={() => handleViewLot(lot)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = getLotHoverColor(lot.status);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = getLotBgColor(lot.status).backgroundColor;
                      }}
                      title={`${lot.id} - ${lot.status} - ₱${lot.price.toLocaleString()}`}
                    >
                      <div className="text-center w-full px-3 py-4">
                        <div className="font-bold text-lg mb-1">{lot.id}</div>
                        <div className="text-xs opacity-90 mb-1">{lot.size}</div>
                        {lot.client && (
                          <div className="text-xs mt-2 font-medium truncate w-full px-2" title={lot.client}>
                            {lot.client}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 text-center text-sm text-slate-500 border-t border-dashed border-slate-300 pt-3 font-medium tracking-wider">
                  WALK WAY
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(lotsBySection).length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">No lots added yet. Click "Add New Lot" to get started.</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading lots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lots Management</h2>
          <p className="text-muted-foreground">Manage burial lots and their status</p>
        </div>
    <Button 
  className="bg-primary hover:bg-primary/90 text-white relative z-50 cursor-pointer"
  onClick={() => {
    console.log('Button clicked!');
    setAddLotOpen(true);
  }}
  type="button"
>
  <Plus className="h-4 w-4 mr-2" />
  Add New Lot
</Button>
      </div>

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
                    <SelectItem value="Lawn Area">Lawn Area</SelectItem>
                    <SelectItem value="Memorial Garden">Memorial Garden</SelectItem>
                    <SelectItem value="Garden Family Estate">Garden Family Estate</SelectItem>
                    <SelectItem value="Family Estate">Family Estate (Mausoleum)</SelectItem>
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
  <Label htmlFor="ownerName">Owner (Optional)</Label>
  <Select
    value={newLot.ownerName}
    onValueChange={(value) => setNewLot({ ...newLot, ownerName: value })}
  >
    <SelectTrigger id="ownerName">
      <SelectValue placeholder="Select contact or leave empty" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">No Owner</SelectItem>  {/* ✅ CHANGED "" to "none" */}
      {contacts.map((contact) => (
        <SelectItem key={contact.id} value={contact.name}>
          {contact.name} - {contact.email}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddLotOpen(false);
                setNewLot({ lotNumber: '', section: '', size: '', location: '', price: '', status: 'available', ownerName: '', row: '', column: '' });
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
                      <SelectItem value="Lawn Area">Lawn Area</SelectItem>
                      <SelectItem value="Memorial Garden">Memorial Garden</SelectItem>
                      <SelectItem value="Garden Family Estate">Garden Family Estate</SelectItem>
                      <SelectItem value="Family Estate">Family Estate (Mausoleum)</SelectItem>
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
                  <p className="font-medium">{selectedLot.section}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(sectionStats).map(([section, stats]) => (
          <Card key={section} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{section}</h3>
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
          {viewMode === 'grid' ? <GridView /> : <MapView />}
        </CardContent>
      </Card>
    </div>
  );
}