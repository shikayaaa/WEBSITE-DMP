import React from 'react';
import { Calendar, CheckSquare, Bell, Clock, MapPin, User, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StaffDashboardOverview() {
  const todaySchedule = [
    { id: 1, time: '10:00 AM', client: 'Antonio Rivera', service: 'Burial Service', lot: 'Section B-22', status: 'confirmed' },
    { id: 2, time: '2:00 PM', client: 'Carmen Lopez', service: 'Memorial Service', lot: 'Section C-8', status: 'confirmed' },
    { id: 3, time: '4:00 PM', client: 'Maria Santos', service: 'Site Visit', lot: 'Section A-15', status: 'pending' },
  ];

  const assignedTasks = [
    { id: 1, task: 'Prepare burial site for Antonio Rivera', priority: 'high', due: '9:30 AM', status: 'in-progress' },
    { id: 2, task: 'Update payment records for Contract PAY-003', priority: 'medium', due: '11:00 AM', status: 'pending' },
    { id: 3, task: 'Respond to client inquiry from Rosa Garcia', priority: 'medium', due: '3:00 PM', status: 'pending' },
    { id: 4, task: 'Complete maintenance report for Section A', priority: 'low', due: 'End of day', status: 'pending' },
  ];

  // Performance Data
  const performanceData = [
    { week: 'Week 1', completed: 12, pending: 8 },
    { week: 'Week 2', completed: 15, pending: 5 },
    { week: 'Week 3', completed: 18, pending: 7 },
    { week: 'Week 4', completed: 22, pending: 4 },
  ];

  // Task Distribution
  const taskDistribution = [
    { name: 'Completed', value: 67, color: '#2DF2A3' },
    { name: 'In Progress', value: 23, color: '#00B8F4' },
    { name: 'Pending', value: 10, color: '#FF7E47' },
  ];

  // Client Interactions
  const clientInteractions = [
    { day: 'Mon', interactions: 5 },
    { day: 'Tue', interactions: 8 },
    { day: 'Wed', interactions: 12 },
    { day: 'Thu', interactions: 10 },
    { day: 'Fri', interactions: 15 },
    { day: 'Sat', interactions: 7 },
    { day: 'Sun', interactions: 4 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'low': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/20 text-accent border-accent/30';
      case 'pending': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'in-progress': return 'bg-primary/20 text-primary border-primary/30';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="card-3d relative overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-accent/20 text-accent border-accent/30">Today</Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Today's Schedule</h3>
            <p className="text-3xl font-bold heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {todaySchedule.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{todaySchedule.length} appointments</p>
          </div>
        </div>

        {/* Assigned Tasks Card */}
        <div className="card-3d relative overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-secondary/20 text-secondary border-secondary/30">Active</Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Assigned Tasks</h3>
            <p className="text-3xl font-bold heading bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {assignedTasks.filter(t => t.status !== 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">4 pending tasks</p>
          </div>
        </div>

        {/* Performance Score Card */}
        <div className="card-3d relative overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <Badge className="bg-accent/20 text-accent border-accent/30">Excellent</Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Performance Score</h3>
            <p className="text-3xl font-bold heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              92%
            </p>
            <p className="text-sm text-muted-foreground mt-2">Above target</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule - Detailed */}
        <div className="lg:col-span-2 card-3d-lg">
          <h2 className="text-xl font-bold heading text-primary mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            {todaySchedule.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 border-l-4 border-primary"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">{item.time}</span>
                    <Badge className={getStatusColor(item.status)} variant="outline">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-lg mb-1">{item.service}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{item.client}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.lot}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Distribution Pie Chart */}
        <div className="card-3d-lg flex flex-col">
          <h2 className="text-xl font-bold heading text-primary mb-4">Task Status</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {taskDistribution.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                </div>
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="text-sm font-semibold">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Tasks & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Tasks List */}
        <div className="card-3d-lg">
          <h2 className="text-xl font-bold heading text-primary mb-6">Assigned Tasks</h2>
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-start justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-1">{task.task}</p>
                  <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Performance Chart */}
        <div className="card-3d-lg">
          <h2 className="text-xl font-bold heading text-primary mb-6">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performanceData}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DF2A3" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#00E09C" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B8F4" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#C9DCE0" opacity={0.3} />
              <XAxis dataKey="week" stroke="#005B73" fontSize={12} />
              <YAxis stroke="#005B73" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #C9DCE0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 91, 115, 0.15)'
                }}
              />
              <Bar dataKey="completed" fill="url(#completedGradient)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="url(#pendingGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Interactions Chart */}
      <div className="card-3d-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold heading text-primary">Client Interactions This Week</h2>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold text-accent">+23% from last week</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={clientInteractions}>
            <defs>
              <linearGradient id="interactionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B8F4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00B8F4" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#C9DCE0" opacity={0.3} />
            <XAxis dataKey="day" stroke="#005B73" fontSize={12} />
            <YAxis stroke="#005B73" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #C9DCE0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 91, 115, 0.15)'
              }}
            />
            <Area type="monotone" dataKey="interactions" stroke="#00B8F4" strokeWidth={3} fill="url(#interactionsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
