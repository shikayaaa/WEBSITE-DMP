import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, Phone, Mail, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { db } from '../../firebase';
import { collection, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

type IntermentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

type Interment = {
  id: string;
  client: string;
  clientId?: string;
  deceased: string;
  date: string;
  time: string;
  lot: string;
  lotId?: string;
  status: IntermentStatus;
  contact: string;
  email?: string;
  notes: string;
  assignedStaff: string;
  assignedStaffId?: string;
  services: string[];
  progress: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export function StaffInterments() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [interments, setInterments] = useState<Interment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [intermentToDelete, setIntermentToDelete] = useState<Interment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { userData } = useAuth();
  const currentStaffName = userData?.displayName || userData?.name || 'Unknown Staff';


useEffect(() => {
  const fetchInterments = () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [STAFF] Loading interments with real-time updates...');
      
      // Fetch from interment_requests collection with real-time updates
      const intermentsRef = collection(db, 'interment_requests');
      const q = query(intermentsRef, orderBy('preferredDate', 'asc'));
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(q, (intermentsSnapshot) => {
        console.log('📋 [STAFF] Total interments found:', intermentsSnapshot.size);
        
        const intermentsList: Interment[] = [];
        
        intermentsSnapshot.forEach((intermentDoc) => {
          const data = intermentDoc.data();
          
          // Parse date from MM/DD/YYYY format
          let formattedDate = data.preferredDate || 'N/A';
          if (data.preferredDate && typeof data.preferredDate === 'string') {
            const dateParts = data.preferredDate.split('/');
            if (dateParts.length === 3) {
              formattedDate = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
            }
          }
          
          // Determine status based on Firebase status field
          let status: IntermentStatus = 'scheduled';
          if (data.status) {
            const statusLower = data.status.toLowerCase();
            if (statusLower === 'approved') status = 'scheduled';
            else if (statusLower === 'in-progress' || statusLower === 'in progress') status = 'in-progress';
            else if (statusLower === 'completed') status = 'completed';
            else if (statusLower === 'cancelled' || statusLower === 'rejected') status = 'cancelled';
          }
          
          // Calculate progress based on status
          let progress = 0;
          if (status === 'in-progress') progress = 50;
          if (status === 'completed') progress = 100;
          
          intermentsList.push({
            id: intermentDoc.id,
            client: data.clientName || data.fullName || 'Unknown',
            clientId: data.userId || undefined,
            deceased: data.deceasedName || 'Unknown',
            date: formattedDate,
            time: data.preferredTime || '10:00 AM',
            lot: `Section ${data.section || 'N/A'} - Block ${data.block || 'N/A'}, Lot ${data.lotNumber || 'N/A'}`,
            lotId: data.lotId || undefined,
            status,
            contact: data.contactNumber || data.phoneNumber || 'N/A',
            email: data.email || undefined,
            notes: data.specialRequests || data.notes || '',
            assignedStaff: data.assignedStaff || 'Unassigned',
            assignedStaffId: data.assignedStaffId || undefined,
            services: data.services || ['Burial Service'],
            progress,
            createdAt: data.createdAt?.toDate() || undefined,
            updatedAt: data.updatedAt?.toDate() || undefined,
          });
        });
        
        // Sort by date
        intermentsList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setInterments(intermentsList);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching interments:', error);
        setError(error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up interments listener:', error);
      setError(error instanceof Error ? error.message : 'Failed to load interments');
      setLoading(false);
    }
  };

  const unsubscribe = fetchInterments();
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
      


  const filteredInterments = interments.filter(interment => 
    statusFilter === 'all' || interment.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStatus = async (id: string, newStatus: IntermentStatus) => {
    try {
      console.log(`Updating interment ${id} status to ${newStatus}`);
      
      const interment = interments.find(i => i.id === id);
      if (!interment) {
        throw new Error('Interment not found');
      }
      
      const intermentRef = doc(db, 'interment_requests', id);
      
      // Map our internal status to Firebase status
      let firebaseStatus = newStatus;
      if (newStatus === 'scheduled') firebaseStatus = 'Approved' as any;
      
      await updateDoc(intermentRef, {
        status: firebaseStatus,
        updatedAt: new Date(),
      });
      
      // Create notification for client when marking as complete
      if (newStatus === 'completed' && interment.clientId) {
        try {
          const notificationsRef = collection(db, 'notifications');
          await addDoc(notificationsRef, {
            userId: interment.clientId,
            type: 'interment_completed',
            title: 'Interment Service Completed',
            message: `The interment service for ${interment.deceased} has been completed successfully.`,
            intermentId: id,
            deceasedName: interment.deceased,
            serviceDate: interment.date,
            serviceTime: interment.time,
            location: interment.lot,
            read: false,
            createdAt: serverTimestamp(),
          });
          
          console.log('✅ Notification created for client:', interment.clientId);
        } catch (notifError) {
          console.error('⚠️ Failed to create notification:', notifError);
          // Don't fail the whole operation if notification fails
        }
      }
      
      toast.success('Status updated successfully', {
        description: newStatus === 'completed' 
          ? `Interment completed and client has been notified`
          : `Interment status changed to ${newStatus}`,
      });
      
      // Update local state
      setInterments(prev => prev.map(interment => 
        interment.id === id 
          ? { ...interment, status: newStatus, progress: newStatus === 'completed' ? 100 : newStatus === 'in-progress' ? 50 : 0 }
          : interment
      ));
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      
      let errorMessage = 'Failed to update status';
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to update this interment.';
      }
      
      toast.error('Update failed', {
        description: errorMessage,
      });
    }
  };

  const handleDeleteInterment = (interment: Interment) => {
    setIntermentToDelete(interment);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!intermentToDelete) return;
    
    try {
      setIsDeleting(true);
      
      console.log('Attempting to delete interment:', intermentToDelete.id);
      
      const intermentRef = doc(db, 'interment_requests', intermentToDelete.id);
      await deleteDoc(intermentRef);
      
      console.log('Interment deleted successfully');
      
      toast.success('Interment deleted successfully', {
        description: `Interment for ${intermentToDelete.deceased} has been removed.`,
        duration: 3000,
      });
      
      setDeleteDialogOpen(false);
      setIntermentToDelete(null);
      
      // Remove from local state
      setInterments(prev => prev.filter(i => i.id !== intermentToDelete.id));
      
    } catch (error: any) {
      console.error('Error deleting interment:', error);
      
      let errorMessage = 'An error occurred while deleting the interment.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to delete this interment. Please contact an administrator.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Interment not found. It may have already been deleted.';
      }
      
      toast.error('Failed to delete interment', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const todayInterments = interments.filter(i => {
    const today = new Date().toISOString().split('T')[0];
    return i.date === today;
  });
  
  const upcomingInterments = interments.filter(i => {
    const intermentDate = new Date(i.date);
    const now = new Date();
    return intermentDate > now && i.status !== 'completed';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading interment services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">Error loading interments: {error}</p>
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
          <h2 className="text-2xl font-bold">Interment Services</h2>
          <p className="text-muted-foreground">Manage and track burial services</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Services</p>
                <p className="text-xl font-bold text-blue-600">{todayInterments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold text-yellow-600">{interments.filter(i => i.status === 'in-progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-green-600">{interments.filter(i => i.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-xl font-bold text-purple-600">{upcomingInterments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Services</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInterments
                  .filter(i => i.assignedStaff === currentStaffName || i.assignedStaff === 'Unassigned')
                  .length > 0 ? (
                  filteredInterments
                    .filter(i => i.assignedStaff === currentStaffName || i.assignedStaff === 'Unassigned')
                    .map((interment) => (
                      <Card key={interment.id} className="border-l-4 border-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{interment.deceased}</h3>
                              <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
                            </div>
                            <Badge className={getStatusColor(interment.status)}>
                              {interment.status.charAt(0).toUpperCase() + interment.status.slice(1).replace('-', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{interment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{interment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{interment.lot}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Services:</p>
                            <div className="flex flex-wrap gap-1">
                              {interment.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {interment.notes && (
                            <div className="mb-3">
                              <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                              <p className="text-sm italic">{interment.notes}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {interment.status === 'scheduled' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateStatus(interment.id, 'in-progress')}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Start Service
                              </Button>
                            )}
                            {interment.status === 'in-progress' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateStatus(interment.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <User className="h-4 w-4 mr-1" />
                                  Client Information
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Client Information - {interment.id}</DialogTitle>
                                  <DialogDescription>Contact details and service information</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Client Name</p>
                                      <p className="font-medium">{interment.client}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Deceased</p>
                                      <p className="font-medium">{interment.deceased}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Contact Number</p>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <p className="font-medium">{interment.contact}</p>
                                      </div>
                                    </div>
                                    {interment.email && (
                                      <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <p className="font-medium">{interment.email}</p>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm text-muted-foreground">Service Date</p>
                                      <p className="font-medium">{interment.date}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Service Time</p>
                                      <p className="font-medium">{interment.time}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Location</p>
                                      <p className="font-medium">{interment.lot}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={getStatusColor(interment.status)}>
                                        {interment.status.charAt(0).toUpperCase() + interment.status.slice(1).replace('-', ' ')}
                                      </Badge>
                                    </div>
                                
                                  </div>

                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Services Included</p>
                                    <div className="flex flex-wrap gap-2">
                                      {interment.services.map((service, index) => (
                                        <Badge key={index} variant="outline">
                                          {service}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {interment.notes && (
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Special Notes</p>
                                      <p className="text-sm p-3 bg-muted rounded-md italic">{interment.notes}</p>
                                    </div>
                                  )}

                                  <div className="flex justify-center pt-4 border-t">
                                    <Button variant="outline">
                                      <Mail className="h-4 w-4 mr-2" />
                                     Done
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteInterment(interment)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No assigned services found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Interment Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInterments.length > 0 ? (
                  filteredInterments.map((interment) => (
                    <Card key={interment.id} className="border-l-4 border-gray-300">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{interment.deceased}</h3>
                            <p className="text-sm text-muted-foreground">
                              Client: {interment.client} • Assigned: {interment.assignedStaff}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(interment.status)}>
                              {interment.status.replace('-', ' ')}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteInterment(interment)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{interment.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{interment.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{interment.lot}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No interment services found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">Services scheduled for today</p>
            </CardHeader>
            <CardContent>
              {todayInterments.length > 0 ? (
                <div className="space-y-4">
                  {todayInterments.map((interment) => (
                    <Card key={interment.id} className="border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{interment.time}</h3>
                            <p className="font-medium">{interment.deceased}</p>
                            <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
                          </div>
                          <Badge className={getStatusColor(interment.status)}>
                            {interment.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{interment.lot}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{interment.assignedStaff}</span>
                          </div>
                        </div>

                        {interment.notes && (
                          <p className="text-sm italic text-muted-foreground mb-3">{interment.notes}</p>
                        )}

                        <div className="flex gap-2">
                          {interment.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateStatus(interment.id, 'in-progress')}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              Start Service
                            </Button>
                          )}
                          {interment.status === 'in-progress' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateStatus(interment.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Complete
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteInterment(interment)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p>No services scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interment Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interment service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {intermentToDelete && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Service ID:</span>
                <span className="text-sm font-medium">{intermentToDelete.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{intermentToDelete.client}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Deceased:</span>
                <span className="text-sm font-medium">{intermentToDelete.deceased}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Date & Time:</span>
                <span className="text-sm font-medium">{intermentToDelete.date} at {intermentToDelete.time}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(intermentToDelete.status)}>
                  {intermentToDelete.status.charAt(0).toUpperCase() + intermentToDelete.status.slice(1).replace('-', ' ')}
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
                  Delete Interment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}