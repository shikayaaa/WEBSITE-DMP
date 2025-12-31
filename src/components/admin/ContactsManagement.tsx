import React, { useState, useEffect } from 'react';
import { Search, Eye, Mail, Phone, MapPin, User, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'client' | 'lead' | 'beneficiary';
  status: 'active' | 'inactive';
  relatedLots?: string[];
  joinedDate: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function ContactsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewContactOpen, setViewContactOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [editContactOpen, setEditContactOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [contacts, setContacts] = useState<Contact[]>([]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'client' as 'client' | 'lead' | 'beneficiary',
    status: 'active' as 'active' | 'inactive',
    relatedLots: '',
    notes: ''
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const contactsQuery = query(
        collection(db, 'contacts'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(contactsQuery);
      
      const contactsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          type: data.type || 'client',
          status: data.status || 'active',
          relatedLots: data.relatedLots || [],
          joinedDate: data.joinedDate || data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          notes: data.notes || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Contact;
      });

      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const relatedLotsArray = formData.relatedLots
        ? formData.relatedLots.split(',').map(lot => lot.trim()).filter(lot => lot)
        : [];

      const newContact = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: formData.type,
        status: formData.status,
        relatedLots: relatedLotsArray,
        joinedDate: new Date().toISOString(),
        notes: formData.notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'contacts'), newContact);
      
      toast.success('Contact added successfully');
      setAddContactOpen(false);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditContact = async () => {
    if (!selectedContact || !formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const relatedLotsArray = formData.relatedLots
        ? formData.relatedLots.split(',').map(lot => lot.trim()).filter(lot => lot)
        : [];

      const updatedContact = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: formData.type,
        status: formData.status,
        relatedLots: relatedLotsArray,
        notes: formData.notes,
        updatedAt: Timestamp.now()
      };

      await updateDoc(doc(db, 'contacts', selectedContact.id), updatedContact);
      
      toast.success('Contact updated successfully');
      setEditContactOpen(false);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      setIsSaving(true);
      await deleteDoc(doc(db, 'contacts', selectedContact.id));
      
      toast.success('Contact deleted successfully');
      setDeleteConfirmOpen(false);
      setViewContactOpen(false);
      setSelectedContact(null);
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setAddContactOpen(true);
  };

  const openEditDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      type: contact.type,
      status: contact.status,
      relatedLots: contact.relatedLots?.join(', ') || '',
      notes: contact.notes || ''
    });
    setViewContactOpen(false);
    setEditContactOpen(true);
  };

  const openDeleteDialog = (contact: Contact) => {
    setSelectedContact(contact);
    setViewContactOpen(false);
    setDeleteConfirmOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'client',
      status: 'active',
      relatedLots: '',
      notes: ''
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    return matchesSearch;
  });

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setViewContactOpen(true);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'beneficiary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contacts</h2>
          <p className="text-muted-foreground">Manage client and beneficiary contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {contacts.length} Total Contacts
          </Badge>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact in your system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Contact Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="relatedLots">Related Lots (comma-separated)</Label>
                <Input
                  id="relatedLots"
                  value={formData.relatedLots}
                  onChange={(e) => setFormData({ ...formData, relatedLots: e.target.value })}
                  placeholder="A-001, B-002"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this contact"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? 'Saving...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+63 912 345 6789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Contact Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-relatedLots">Related Lots (comma-separated)</Label>
                <Input
                  id="edit-relatedLots"
                  value={formData.relatedLots}
                  onChange={(e) => setFormData({ ...formData, relatedLots: e.target.value })}
                  placeholder="A-001, B-002"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this contact"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleEditContact} disabled={isSaving} className="bg-primary hover:bg-primary/90">
              {isSaving ? 'Saving...' : 'Update Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedContact?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContact} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Contact Details Dialog */}
      <Dialog open={viewContactOpen} onOpenChange={setViewContactOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              Complete information about this contact
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6 py-4">
              {/* Header with Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeBadgeColor(selectedContact.type)}>
                      {selectedContact.type.charAt(0).toUpperCase() + selectedContact.type.slice(1)}
                    </Badge>
                    <Badge className={getStatusBadgeColor(selectedContact.status)}>
                      {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Contact Information</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-xs">Email Address</Label>
                      <p className="font-medium">{selectedContact.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-xs">Phone Number</Label>
                      <p className="font-medium">{selectedContact.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-xs">Address</Label>
                      <p className="font-medium">{selectedContact.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-muted-foreground text-xs">Member Since</Label>
                      <p className="font-medium">
                        {new Date(selectedContact.joinedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedContact.relatedLots && selectedContact.relatedLots.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Related Lots</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.relatedLots.map((lot) => (
                        <Badge key={lot} variant="outline" className="text-primary border-primary">
                          Lot {lot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedContact.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Notes</h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedContact.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setViewContactOpen(false)}>
              Close
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => selectedContact && openDeleteDialog(selectedContact)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              onClick={() => selectedContact && openEditDialog(selectedContact)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contacts List */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle>All Contacts</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate mb-2">{contact.name}</h3>
                      <div className="flex items-center gap-1">
                        <Badge className={getTypeBadgeColor(contact.type)} variant="secondary">
                          {contact.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground mb-5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.relatedLots && contact.relatedLots.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{contact.relatedLots.length} lot(s)</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-primary hover:bg-primary/10 h-9"
                      onClick={() => handleViewContact(contact)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contacts found</p>
              <p className="text-sm">Try adjusting your search or add a new contact</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}