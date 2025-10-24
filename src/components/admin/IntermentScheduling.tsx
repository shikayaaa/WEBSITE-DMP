import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function IntermentScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const interments = [
    {
      id: 'INT-001',
      client: 'Antonio Rivera',
      deceased: 'Roberto Rivera',
      date: '2024-12-12',
      time: '10:00 AM',
      lot: 'Section B-22',
      status: 'confirmed',
      contact: '+63 912 345 6789',
      notes: 'Family requests morning service'
    },
    {
      id: 'INT-002',
      client: 'Carmen Lopez',
      deceased: 'Elena Lopez',
      date: '2024-12-13',
      time: '2:00 PM',
      lot: 'Section C-8',
      status: 'confirmed',
      contact: '+63 923 456 7890',
      notes: 'Special arrangements for large family gathering'
    },
    {
      id: 'INT-003',
      client: 'Miguel Torres',
      deceased: 'Jose Torres',
      date: '2024-12-15',
      time: '9:00 AM',
      lot: 'Section A-31',
      status: 'pending',
      contact: '+63 934 567 8901',
      notes: 'Awaiting final confirmation'
    },
    {
      id: 'INT-004',
      client: 'Rosa Garcia',
      deceased: 'Manuel Garcia',
      date: '2024-12-16',
      time: '11:00 AM',
      lot: 'Section B-15',
      status: 'confirmed',
      contact: '+63 945 678 9012',
      notes: 'Military honors requested'
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
      notes: 'Religious ceremony included'
    },
  ];

  const filteredInterments = interments.filter(interment =>
    interment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interment.deceased.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interment.lot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingInterments = interments
    .filter(i => new Date(i.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Interments & Scheduling</h2>
          <p className="text-muted-foreground">Manage burial schedules and services</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Interment</DialogTitle>
              <DialogDescription>Schedule a new burial service</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input id="client" placeholder="Enter client name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deceased">Deceased Name</Label>
                <Input id="deceased" placeholder="Enter deceased name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lot">Lot Assignment</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A-001">Section A-001</SelectItem>
                    <SelectItem value="B-001">Section B-001</SelectItem>
                    <SelectItem value="C-001">Section C-001</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Schedule</Button>
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search interments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-3">
                  {filteredInterments.map((interment) => (
                    <Card key={interment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{interment.deceased}</h3>
                            <p className="text-sm text-muted-foreground">Client: {interment.client}</p>
                          </div>
                          <Badge className={getStatusColor(interment.status)}>
                            {interment.status.charAt(0).toUpperCase() + interment.status.slice(1)}
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
                        {interment.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">{interment.notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
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
              {upcomingInterments.map((interment) => (
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
              ))}
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
            {interments
              .filter(i => i.date === new Date().toISOString().split('T')[0])
              .map((interment) => (
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
              ))}
            {interments.filter(i => i.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No interments scheduled for today
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}