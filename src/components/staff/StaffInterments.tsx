import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function StaffInterments() {
  const [statusFilter, setStatusFilter] = useState('all');

  const interments = [
    {
      id: 'INT-001',
      client: 'Antonio Rivera',
      deceased: 'Roberto Rivera',
      date: '2024-12-12',
      time: '10:00 AM',
      lot: 'Section B-22',
      status: 'scheduled',
      contact: '+63 912 345 6789',
      notes: 'Family requests morning service',
      assignedStaff: 'Maria Staff',
      services: ['Burial Service', 'Flower Arrangement'],
      progress: 0
    },
    {
      id: 'INT-002',
      client: 'Carmen Lopez',
      deceased: 'Elena Lopez',
      date: '2024-12-13',
      time: '2:00 PM',
      lot: 'Section C-8',
      status: 'in-progress',
      contact: '+63 923 456 7890',
      notes: 'Special arrangements for large family gathering',
      assignedStaff: 'Maria Staff',
      services: ['Memorial Service', 'Catering', 'Security'],
      progress: 50
    },
    {
      id: 'INT-003',
      client: 'Miguel Torres',
      deceased: 'Jose Torres',
      date: '2024-12-15',
      time: '9:00 AM',
      lot: 'Section A-31',
      status: 'scheduled',
      contact: '+63 934 567 8901',
      notes: 'Awaiting final confirmation',
      assignedStaff: 'Lisa Lopez',
      services: ['Burial Service'],
      progress: 0
    },
    {
      id: 'INT-004',
      client: 'Rosa Garcia',
      deceased: 'Manuel Garcia',
      date: '2024-12-16',
      time: '11:00 AM',
      lot: 'Section B-15',
      status: 'scheduled',
      contact: '+63 945 678 9012',
      notes: 'Military honors requested',
      assignedStaff: 'Maria Staff',
      services: ['Military Honors', 'Burial Service'],
      progress: 0
    },
    {
      id: 'INT-005',
      client: 'Luis Santos',
      deceased: 'Maria Santos',
      date: '2024-12-18',
      time: '3:00 PM',
      lot: 'Section A-45',
      status: 'scheduled',
      contact: '+63 956 789 0123',
      notes: 'Religious ceremony included',
      assignedStaff: 'Lisa Lopez',
      services: ['Religious Ceremony', 'Burial Service'],
      progress: 0
    },
    {
      id: 'INT-006',
      client: 'Pedro Martinez',
      deceased: 'Ana Martinez',
      date: '2024-12-10',
      time: '2:00 PM',
      lot: 'Section D-10',
      status: 'completed',
      contact: '+63 967 890 1234',
      notes: 'Service completed successfully',
      assignedStaff: 'Maria Staff',
      services: ['Burial Service'],
      progress: 100
    },
  ];

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

  const updateStatus = (id: string, newStatus: string) => {
    // Mock status update
    alert(`Updated ${id} status to ${newStatus}`);
  };

  const todayInterments = interments.filter(i => i.date === new Date().toISOString().split('T')[0]);
  const upcomingInterments = interments.filter(i => new Date(i.date) > new Date() && i.status !== 'completed');

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
                  .filter(i => i.assignedStaff === 'Maria Staff')
                  .map((interment) => (
                    <Card key={interment.id} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{interment.deceased}</h3>
                            <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
                          </div>
                          <Badge className={getStatusColor(interment.status)}>
                            {interment.status.charAt(0).toUpperCase() + interment.status.slice(1)}
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

                        {interment.status !== 'completed' && (
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
                            <Button variant="outline" size="sm">
                              <User className="h-4 w-4 mr-1" />
                              Contact Client
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
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
                {filteredInterments.map((interment) => (
                  <Card key={interment.id} className="border-l-4 border-gray-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{interment.deceased}</h3>
                          <p className="text-sm text-muted-foreground">
                            Client: {interment.client} • Assigned: {interment.assignedStaff}
                          </p>
                        </div>
                        <Badge className={getStatusColor(interment.status)}>
                          {interment.status}
                        </Badge>
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
                ))}
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
                            {interment.status}
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
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                              Start Service
                            </Button>
                          )}
                          {interment.status === 'in-progress' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Mark Complete
                            </Button>
                          )}
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
    </div>
  );
}