import React, { useState } from 'react';
import { Search, Send, MessageCircle, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';

export function ClientSupport() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const inquiries = [
    {
      id: 'INQ-001',
      client: 'Maria Santos',
      subject: 'Payment Plan Inquiry',
      message: 'I would like to know about installment payment options for lot A-002.',
      status: 'open',
      priority: 'medium',
      category: 'payment',
      date: '2024-12-10 09:30',
      assignedTo: 'Maria Staff',
      responses: []
    },
    {
      id: 'INQ-002',
      client: 'Pedro Garcia',
      subject: 'Service Scheduling',
      message: 'Need to reschedule the burial service from Dec 20 to Dec 22 due to family circumstances.',
      status: 'in-progress',
      priority: 'high',
      category: 'scheduling',
      date: '2024-12-10 11:15',
      assignedTo: 'Lisa Lopez',
      responses: [
        { from: 'Lisa Lopez', message: 'I understand your situation. Let me check the availability for Dec 22.', timestamp: '2024-12-10 11:30' }
      ]
    },
    {
      id: 'INQ-003',
      client: 'Rosa Garcia',
      subject: 'Maintenance Request',
      message: 'The memorial plaque for lot B-15 has some damage and needs repair.',
      status: 'resolved',
      priority: 'low',
      category: 'maintenance',
      date: '2024-12-09 14:22',
      assignedTo: 'Maria Staff',
      responses: [
        { from: 'Maria Staff', message: 'Thank you for reporting this. Our maintenance team will inspect and repair the plaque within 3 business days.', timestamp: '2024-12-09 15:00' },
        { from: 'Maria Staff', message: 'The plaque has been successfully repaired. Please let us know if you need anything else.', timestamp: '2024-12-10 10:00' }
      ]
    },
    {
      id: 'INQ-004',
      client: 'Carlos Rivera',
      subject: 'Document Request',
      message: 'Please provide a copy of the contract and payment receipts for lot C-005.',
      status: 'open',
      priority: 'medium',
      category: 'documentation',
      date: '2024-12-10 16:45',
      assignedTo: 'Maria Staff',
      responses: []
    },
    {
      id: 'INQ-005',
      client: 'Ana Lopez',
      subject: 'General Inquiry',
      message: 'What are the visiting hours for the memorial park?',
      status: 'open',
      priority: 'low',
      category: 'general',
      date: '2024-12-10 13:20',
      assignedTo: null,
      responses: []
    },
  ];

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
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
  const resolvedToday = inquiries.filter(i => i.status === 'resolved' && i.date.startsWith('2024-12-10')).length;

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
                <Select>
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
                <Textarea id="issue-description" placeholder="Describe the issue..." rows={4} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-orange-600 hover:bg-orange-700">Submit Report</Button>
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
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-xl font-bold text-purple-600">15 min</p>
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
              {filteredInquiries.map((inquiry) => (
                <Card 
                  key={inquiry.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(inquiry.category)}</span>
                        <div>
                          <h3 className="font-semibold text-sm">{inquiry.subject}</h3>
                          <p className="text-xs text-muted-foreground">{inquiry.client}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
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
              ))}
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
                    <p>Client: {selectedInquiry.client}</p>
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
                    <div className="space-y-2">
                      {selectedInquiry.responses.map((response: any, index: number) => (
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
                      <Textarea placeholder="Type your response..." rows={3} />
                      <div className="flex justify-between items-center">
                        <Select defaultValue="in-progress">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <MessageCircle className="h-6 w-6 mb-2" />
              <span>Create New Inquiry</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span>Escalate Issue</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Mark as Resolved</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}