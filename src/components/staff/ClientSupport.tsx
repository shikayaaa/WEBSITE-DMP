import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MessageCircle, AlertTriangle, CheckCircle, Clock, User, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/dialog';
import { Label } from '../ui/label';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

type InquiryStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type InquiryPriority = 'low' | 'medium' | 'high';
type InquiryCategory = 'payment' | 'scheduling' | 'maintenance' | 'documentation' | 'general';

type Response = {
  from: string;
  fromId?: string;
  message: string;
  timestamp: string;
};

type Inquiry = {
  id: string;
  inquiryId: string;
  client: string;
  clientId?: string;
  email?: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  category: InquiryCategory;
  date: string;
  assignedTo: string | null;
  assignedToId?: string;
  responses: Response[];
  createdAt?: Date;
  updatedAt?: Date;
};

export function ClientSupport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState<InquiryStatus>('in-progress');
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Issue reporting states
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [submittingIssue, setSubmittingIssue] = useState(false);
  
  const { userData } = useAuth();
  const currentStaffName = userData?.displayName || userData?.name || 'Staff';
  const currentStaffId = userData?.uid || '';
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchInquiries();
    }
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [SUPPORT] Loading inquiries...');
      
      const inquiriesRef = collection(db, 'support_inquiries');
      const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
      const inquiriesSnapshot = await getDocs(q);
      
      console.log('📋 [SUPPORT] Total inquiries found:', inquiriesSnapshot.size);
      
      const inquiriesList: Inquiry[] = [];
      let inquiryCounter = 1;
      
      for (const inquiryDoc of inquiriesSnapshot.docs) {
        const data = inquiryDoc.data();
        
        inquiriesList.push({
          id: inquiryDoc.id,
          inquiryId: data.inquiryId || `INQ-${String(inquiryCounter).padStart(3, '0')}`,
          client: data.clientName || data.client || 'Unknown Client',
          clientId: data.clientId || data.userId || undefined,
          email: data.email || undefined,
          subject: data.subject || 'No Subject',
          message: data.message || '',
          status: data.status || 'open',
          priority: data.priority || 'medium',
          category: data.category || 'general',
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : new Date().toLocaleString(),
          assignedTo: data.assignedTo || null,
          assignedToId: data.assignedToId || undefined,
          responses: data.responses || [],
          createdAt: data.createdAt?.toDate() || undefined,
          updatedAt: data.updatedAt?.toDate() || undefined,
        });
        
        inquiryCounter++;
      }
      
      console.log('✅ [SUPPORT] Inquiries loaded:', inquiriesList.length);
      setInquiries(inquiriesList);
      setLoading(false);
    } catch (error) {
      console.error('❌ [SUPPORT] Error fetching inquiries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inquiries');
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSendingReply(true);
      
      const inquiryRef = doc(db, 'support_inquiries', selectedInquiry.id);
      
      const newResponse: Response = {
        from: currentStaffName,
        fromId: currentStaffId,
        message: replyMessage,
        timestamp: new Date().toLocaleString(),
      };
      
      const updatedResponses = [...selectedInquiry.responses, newResponse];
      
      await updateDoc(inquiryRef, {
        responses: updatedResponses,
        status: replyStatus,
        assignedTo: currentStaffName,
        assignedToId: currentStaffId,
        updatedAt: Timestamp.now(),
      });
      
      toast.success('Reply sent successfully');
      
      // Update local state
      const updatedInquiry = {
        ...selectedInquiry,
        responses: updatedResponses,
        status: replyStatus,
        assignedTo: currentStaffName,
        assignedToId: currentStaffId,
      };
      
      setSelectedInquiry(updatedInquiry);
      setInquiries(prev => prev.map(inq => 
        inq.id === selectedInquiry.id ? updatedInquiry : inq
      ));
      
      setReplyMessage('');
      setSendingReply(false);
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply', {
        description: error.message,
      });
      setSendingReply(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueType || !issueDescription.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmittingIssue(true);
      
      const issueData = {
        inquiryId: `ISS-${Date.now()}`,
        clientName: currentStaffName,
        clientId: currentStaffId,
        email: userData?.email || '',
        subject: `Internal Issue: ${issueType}`,
        message: issueDescription,
        status: 'open',
        priority: 'high',
        category: 'general',
        assignedTo: null,
        responses: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await addDoc(collection(db, 'support_inquiries'), issueData);
      
      toast.success('Issue reported successfully');
      setIssueType('');
      setIssueDescription('');
      setSubmittingIssue(false);
      
      // Refresh inquiries
      fetchInquiries();
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast.error('Failed to submit issue', {
        description: error.message,
      });
      setSubmittingIssue(false);
    }
  };

  const handleDeleteInquiry = (inquiry: Inquiry) => {
    setInquiryToDelete(inquiry);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    
    try {
      setIsDeleting(true);
      
      console.log('Attempting to delete inquiry:', inquiryToDelete.id);
      
      const inquiryRef = doc(db, 'support_inquiries', inquiryToDelete.id);
      await deleteDoc(inquiryRef);
      
      console.log('Inquiry deleted successfully');
      
      toast.success('Inquiry deleted successfully', {
        description: `Inquiry ${inquiryToDelete.inquiryId} has been removed.`,
        duration: 3000,
      });
      
      setDeleteDialogOpen(false);
      setInquiryToDelete(null);
      
      // Remove from local state
      setInquiries(prev => prev.filter(i => i.id !== inquiryToDelete.id));
      
      // Clear selection if deleted inquiry was selected
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }
      
      setIsDeleting(false);
    } catch (error: any) {
      console.error('Error deleting inquiry:', error);
      
      let errorMessage = 'An error occurred while deleting the inquiry.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to delete this inquiry.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Inquiry not found. It may have already been deleted.';
      }
      
      toast.error('Failed to delete inquiry', {
        description: errorMessage,
        duration: 5000,
      });
      
      setIsDeleting(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.inquiryId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return '💳';
      case 'scheduling': return '📅';
      case 'maintenance': return '🔧';
      case 'documentation': return '📄';
      case 'general': return '💬';
      default: return '❓';
    }
  };

  const openInquiries = inquiries.filter(i => i.status === 'open').length;
  const inProgressInquiries = inquiries.filter(i => i.status === 'in-progress').length;
  const resolvedToday = inquiries.filter(i => {
    if (i.status !== 'resolved') return false;
    const today = new Date().toDateString();
    const inquiryDate = i.updatedAt ? new Date(i.updatedAt).toDateString() : '';
    return today === inquiryDate;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading support inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">Error loading inquiries: {error}</p>
          <Button onClick={() => {
            hasFetched.current = false;
            fetchInquiries();
          }}>
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
          <h2 className="text-2xl font-bold">Client Support</h2>
          <p className="text-muted-foreground">Manage client inquiries and support requests</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Internal Issue</DialogTitle>
              <DialogDescription>Report a system or operational issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-type">Issue Type</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Issue</SelectItem>
                    <SelectItem value="equipment">Equipment Problem</SelectItem>
                    <SelectItem value="maintenance">Maintenance Required</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-description">Description</Label>
                <Textarea 
                  id="issue-description" 
                  placeholder="Describe the issue..." 
                  rows={4}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleSubmitIssue}
                  disabled={submittingIssue}
                >
                  {submittingIssue ? 'Submitting...' : 'Submit Report'}
                </Button>
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
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open Inquiries</p>
                <p className="text-xl font-bold text-blue-600">{openInquiries}</p>
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
                <p className="text-xl font-bold text-yellow-600">{inProgressInquiries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-xl font-bold text-green-600">{resolvedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Inquiries</p>
                <p className="text-xl font-bold text-purple-600">{inquiries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Inquiries</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredInquiries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No inquiries found</p>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <Card 
                    key={inquiry.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-lg">{getCategoryIcon(inquiry.category)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{inquiry.subject}</h3>
                            <p className="text-xs text-muted-foreground truncate">{inquiry.client}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                          <Badge className={getStatusColor(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                          <Badge className={getPriorityColor(inquiry.priority)}>
                            {inquiry.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 truncate">{inquiry.message}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{inquiry.date}</span>
                        <span>{inquiry.assignedTo || 'Unassigned'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Details */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInquiry ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{selectedInquiry.subject}</h3>
                    <Badge className={getStatusColor(selectedInquiry.status)}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>ID: {selectedInquiry.inquiryId}</p>
                    <p>Client: {selectedInquiry.client}</p>
                    {selectedInquiry.email && <p>Email: {selectedInquiry.email}</p>}
                    <p>Category: {selectedInquiry.category}</p>
                    <p>Priority: {selectedInquiry.priority}</p>
                    <p>Date: {selectedInquiry.date}</p>
                    <p>Assigned to: {selectedInquiry.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Original Message</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{selectedInquiry.message}</p>
                  </div>
                </div>

                {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Responses</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedInquiry.responses.map((response, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-md">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{response.from}</span>
                            <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                          </div>
                          <p className="text-sm">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedInquiry.status !== 'resolved' && selectedInquiry.status !== 'closed' && (
                  <div>
                    <h4 className="font-medium mb-2">Reply</h4>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Type your response..." 
                        rows={3}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <Select value={replyStatus} onValueChange={(value) => setReplyStatus(value as InquiryStatus)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm"
                          onClick={handleSendReply}
                          disabled={sendingReply || !replyMessage.trim()}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {sendingReply ? 'Sending...' : 'Send Reply'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button 
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeleteInquiry(selectedInquiry)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                <p>Select an inquiry to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inquiry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {inquiryToDelete && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Inquiry ID:</span>
                <span className="text-sm font-medium">{inquiryToDelete.inquiryId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{inquiryToDelete.client}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Subject:</span>
                <span className="text-sm font-medium">{inquiryToDelete.subject}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(inquiryToDelete.status)}>
                  {inquiryToDelete.status}
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
                  Delete Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}