import React, { useState } from 'react';
import { Search, Eye, Mail, Phone, MapPin, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'client' | 'lead' | 'beneficiary';
  status: 'active' | 'inactive';
  relatedLots?: string[];
  joinedDate: string;
  notes?: string;
}

export function ContactsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewContactOpen, setViewContactOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [contacts] = useState<Contact[]>([
    {
      id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 912 345 6789',
      address: 'Dumaguete City, Negros Oriental',
      type: 'client',
      status: 'active',
      relatedLots: ['A-002', 'B-005'],
      joinedDate: '2024-01-15',
      notes: 'Regular client, purchased 2 lots for family'
    },
    {
      id: 2,
      name: 'Juan Cruz',
      email: 'juan.cruz@email.com',
      phone: '+63 923 456 7890',
      address: 'Valencia, Negros Oriental',
      type: 'client',
      status: 'active',
      relatedLots: ['A-003'],
      joinedDate: '2024-02-20',
      notes: 'Pre-need purchase plan, monthly installment'
    },
    {
      id: 3,
      name: 'Pedro Garcia',
      email: 'pedro.garcia@email.com',
      phone: '+63 934 567 8901',
      address: 'Sibulan, Negros Oriental',
      type: 'client',
      status: 'active',
      relatedLots: ['B-002'],
      joinedDate: '2024-03-10',
      notes: 'Premium section lot owner'
    },
    {
      id: 4,
      name: 'Ana Lopez',
      email: 'ana.lopez@email.com',
      phone: '+63 945 678 9012',
      address: 'Bacong, Negros Oriental',
      type: 'client',
      status: 'active',
      relatedLots: ['B-003', 'C-001'],
      joinedDate: '2024-04-05',
      notes: 'Multiple lot purchases, referred by Maria Santos'
    },
    {
      id: 5,
      name: 'Roberto Fernandez',
      email: 'roberto.f@email.com',
      phone: '+63 956 789 0123',
      address: 'Dumaguete City, Negros Oriental',
      type: 'lead',
      status: 'active',
      joinedDate: '2024-05-12',
      notes: 'Interested in premium section, follow up scheduled'
    },
    {
      id: 6,
      name: 'Carmen Reyes',
      email: 'carmen.reyes@email.com',
      phone: '+63 967 890 1234',
      address: 'Zamboanguita, Negros Oriental',
      type: 'beneficiary',
      status: 'active',
      relatedLots: ['A-002'],
      joinedDate: '2024-06-01',
      notes: 'Beneficiary for Maria Santos lot A-002'
    },
  ]);

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

  const handleEditContact = (contact: Contact) => {
    toast.info(`Editing contact: ${contact.name}`);
    setViewContactOpen(false);
  };

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
        </div>
      </div>

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
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContactOpen(false)}>
              Close
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
              <p className="text-sm">Try adjusting your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
