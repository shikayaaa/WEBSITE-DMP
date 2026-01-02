// src/components/admin/IntermentScheduling.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  Timestamp,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface Interment {
  id: string;
   userId: string;  // ADD THIS
  client: string;
  deceased: string;
  date: string;
  time: string;
  lot: string;
  status: string;
  contact: string;
  notes?: string;
  createdAt?: any;
}

export function IntermentScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [interments, setInterments] = useState<Interment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingInterment, setEditingInterment] = useState<Interment | null>(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [intermentToDelete, setIntermentToDelete] = useState<Interment | null>(null);
const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    client: '',
    deceased: '',
    lot: '',
    date: '',
    time: '',
    contact: '',
    notes: '',
    status: 'pending',
  });

  useEffect(() => {
    // Set up real-time listener only
    const unsubscribe = setupIntermentListener();
    return () => unsubscribe();
  }, []);

  // Real-time listener for interments
  const setupIntermentListener = () => {
    const intermentQuery = query(
      collection(db, 'interments'),
      orderBy('date', 'asc')
    );
    
   return onSnapshot(intermentQuery, (snapshot) => {
  const intermentsList: Interment[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    intermentsList.push({
      id: doc.id,
      userId: data.userId || '',  // ADD THIS LINE
      client: data.client || '',
          deceased: data.deceased || '',
          date: data.date || '',
          time: data.time || '',
          lot: data.lot || '',
          status: data.status || 'pending',
          contact: data.contact || '',
          notes: data.notes || '',
          createdAt: data.createdAt,
        });
      });
      setInterments(intermentsList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to interments:', error);
      setLoading(false);
    });
  };

  // Load all interments from Firebase
  const loadInterments = async () => {
    try {
      setLoading(true);
      const intermentQuery = query(
        collection(db, 'interments'),
        orderBy('date', 'asc')
      );
      const intermentSnapshot = await getDocs(intermentQuery);
      const intermentsList: Interment[] = [];

      intermentSnapshot.forEach((doc) => {
        const data = doc.data();
     intermentsList.push({
  id: doc.id,
  userId: data.userId || '',  // ADD THIS LINE
  client: data.client || '',
          deceased: data.deceased || '',
          date: data.date || '',
          time: data.time || '',
          lot: data.lot || '',
          status: data.status || 'pending',
          contact: data.contact || '',
          notes: data.notes || '',
          createdAt: data.createdAt,
        });
      });
      setInterments(intermentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading interments:', error);
      toast.error('Failed to load interments');
      setLoading(false);
    }
  };
// Handle form submission
const handleScheduleInterment = async () => {
  // Validate form
  if (!formData.client || !formData.deceased || !formData.lot || !formData.date || !formData.time || !formData.contact) {
    toast.error('Please fill in all required fields');
    return;
  }
  setSubmitting(true);
  try {
    // Add to Firebase FIRST
 const docRef = await addDoc(collection(db, 'interments'), {
  userId: auth.currentUser?.uid,  // ADD THIS LINE
  client: formData.client,
  deceased: formData.deceased,
      lot: formData.lot,
      date: formData.date,
      time: formData.time,
      contact: formData.contact,
      notes: formData.notes,
      status: formData.status,
      createdAt: Timestamp.now(),
    });

    console.log('Successfully added interment with ID:', docRef.id);
    
    // Wait a brief moment for Firebase to sync
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show success message
    toast.success('Interment scheduled successfully!');
    
    // Reset submitting state
    setSubmitting(false);
    
    // Close dialog
    setDialogOpen(false);
    
    // Reset form after a small delay
    setTimeout(() => {
      setFormData({
        client: '',
        deceased: '',
        lot: '',
        date: '',
        time: '',
        contact: '',
        notes: '',
        status: 'pending',
      });
    }, 100);

  } catch (error: any) {
    console.error('Error scheduling interment:', error);
    toast.error('Failed to schedule interment: ' + error.message);
    setSubmitting(false);
  }
};
 // Handle update interment
const handleUpdateInterment = async () => {
  if (!editingInterment) return;

  // Validate form
  if (!formData.client || !formData.deceased || !formData.lot || !formData.date || !formData.time || !formData.contact) {
    toast.error('Please fill in all required fields');
    return;
  }

  setSubmitting(true);

  try {
    // Update in Firebase
    const intermentRef = doc(db, 'interments', editingInterment.id);
    await updateDoc(intermentRef, {
      client: formData.client,
      deceased: formData.deceased,
      lot: formData.lot,
      date: formData.date,
      time: formData.time,
      contact: formData.contact,
      notes: formData.notes,
      status: formData.status,
      updatedAt: Timestamp.now(),
    });

    console.log('Successfully updated interment with ID:', editingInterment.id);
    
    // Show success message
    toast.success('Interment updated successfully!');
    
    // Reset states
    setSubmitting(false);
    setDialogOpen(false);
    setEditingInterment(null);
    
    // Reset form after a small delay
    setTimeout(() => {
      setFormData({
        client: '',
        deceased: '',
        lot: '',
        date: '',
        time: '',
        contact: '',
        notes: '',
        status: 'pending',
      });
    }, 100);

  } catch (error: any) {
    console.error('Error updating interment:', error);
    toast.error('Failed to update interment: ' + error.message);
    setSubmitting(false);
  }
};
// Handle delete interment
  const handleDeleteInterment = async () => {
    if (!intermentToDelete) return;
    setDeleting(true);
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, 'interments', intermentToDelete.id));
      console.log('Successfully deleted interment with ID:', intermentToDelete.id);
      
      // Show success message
      toast.success('Interment deleted successfully!');
      
      // Reset states
      setDeleting(false);
      setDeleteDialogOpen(false);
      setIntermentToDelete(null);
    } catch (error: any) {
      console.error('Error deleting interment:', error);
      toast.error('Failed to delete interment: ' + error.message);
      setDeleting(false);
    }
  };
  // Handle edit button click
const handleEditClick = (interment: Interment) => {
  setEditingInterment(interment);
  setFormData({
    client: interment.client,
    deceased: interment.deceased,
    lot: interment.lot,
    date: interment.date,
    time: interment.time,
    contact: interment.contact,
    notes: interment.notes || '',
    status: interment.status,
  });
  setDialogOpen(true);
};

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to check if a date is in the past
  const isPastDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Helper function to check if a date is today
  const isToday = (dateString: string) => {
    return dateString === getTodayDate();
  };

  // Helper function to check if a date is in the future
  const isFutureDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

 // Filter interments based on search only
const getFilteredInterments = () => {
  return interments.filter(interment =>
    interment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interment.deceased.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interment.lot.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

  const filteredInterments = getFilteredInterments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get upcoming interments (future dates, not completed) - SORTED BY DATE
  const upcomingInterments = interments
    .filter(i => isFutureDate(i.date) && i.status !== 'completed')
    .sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // If dates are the same, sort by time
      return a.time.localeCompare(b.time);
    })
    .slice(0, 5);

  // Get today's interments - SORTED BY TIME
  const todayInterments = interments
    .filter(i => isToday(i.date))
    .sort((a, b) => a.time.localeCompare(b.time));

  const isFormValid = formData.client && formData.deceased && formData.lot && formData.date && formData.time && formData.contact;

  // Handle dialog close with form reset
 const handleDialogClose = (open: boolean) => {
  setDialogOpen(open);
  if (!open && !submitting) {
    // Reset form and editing state when manually closing dialog
    setTimeout(() => {
      setFormData({
        client: '',
        deceased: '',
        lot: '',
        date: '',
        time: '',
        contact: '',
        notes: '',
        status: 'pending',
      });
      setEditingInterment(null);
    }, 200);
  }
};
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading interments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Interments & Scheduling</h2>
          <p className="text-muted-foreground">Manage burial schedules and services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
            <DialogTitle>
  {editingInterment ? 'Edit Interment' : 'Schedule New Interment'}
</DialogTitle>
<DialogDescription>
  {editingInterment ? 'Update burial service details' : 'Schedule a new burial service'}
</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="client" 
                  placeholder="Enter client name" 
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deceased">Deceased Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="deceased" 
                  placeholder="Enter deceased name" 
                  value={formData.deceased}
                  onChange={(e) => setFormData({ ...formData, deceased: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot">Lot Assignment <span className="text-red-500">*</span></Label>
                <Input 
                  id="lot" 
                  placeholder="e.g., Section A-001" 
                  value={formData.lot}
                  onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="contact" 
                  placeholder="+63 912 345 6789" 
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input 
                  id="notes" 
                  placeholder="Additional notes..." 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
               <Button 
  className="bg-blue-600 hover:bg-blue-700"
  onClick={editingInterment ? handleUpdateInterment : handleScheduleInterment}
  disabled={!isFormValid || submitting}
>
  {submitting ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      {editingInterment ? 'Updating...' : 'Scheduling...'}
    </>
  ) : (
    editingInterment ? 'Update' : 'Schedule'
  )}
</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </TabsContent>
              
              <TabsContent value="list" className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search interments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
      </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredInterments.length > 0 ? (
                    filteredInterments.map((interment) => (
                      <Card key={interment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
  <div className="flex justify-between items-start mb-2">
    <div className="flex-1">
      <h3 className="font-semibold">{interment.deceased}</h3>
      <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
    </div>
    <div className="flex items-center gap-2">
      <Badge className={getStatusColor(interment.status)}>
        {interment.status.charAt(0).toUpperCase() + interment.status.slice(1)}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleEditClick(interment)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => {
          setIntermentToDelete(interment);
          setDeleteDialogOpen(true);
        }}
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
  {interment.notes && (
    <p className="text-sm text-muted-foreground mt-2 italic">{interment.notes}</p>
  )}
  <p className="text-xs text-muted-foreground mt-1">Contact: {interment.contact}</p>
</CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
<p>No interments found</p>                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Upcoming Interments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterments.length > 0 ? (
                upcomingInterments.map((interment) => (
                  <div key={interment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{interment.deceased}</h4>
                      <Badge variant="outline" className="text-xs">
                        {interment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{interment.client}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{interment.date}</span>
                      <span>{interment.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{interment.lot}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No upcoming services</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayInterments.length > 0 ? (
              todayInterments.map((interment) => (
                <Card key={interment.id} className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{interment.time}</h3>
                      <Badge className={getStatusColor(interment.status)}>
                        {interment.status}
                      </Badge>
                    </div>
                    <p className="font-medium">{interment.deceased}</p>
                    <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
                    <p className="text-sm text-muted-foreground">Location: {interment.lot}</p>
                    <p className="text-sm text-muted-foreground">Contact: {interment.contact}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No interments scheduled for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the interment for{' '}
              <strong>{intermentToDelete?.deceased}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInterment}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
 