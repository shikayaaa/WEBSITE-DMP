import React from 'react';
import { MapPin, TrendingUp, DollarSign, ArrowUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboardOverview() {
  // Data for Sales Volume Mini Chart
  const salesVolumeData = [
    { month: 'JAN', sales: 45.2 },
    { month: 'FEB', sales: 52.8 },
    { month: 'MAR', sales: 48.9 },
    { month: 'APR', sales: 61.3 },
    { month: 'MAY', sales: 58.7 },
    { month: 'JUN', sales: 65.4 },
  ];

  // Data for Visitors & Buyers Chart
  const visitorsBuyersData = [
    { month: 'JAN', visitors: 120, buyers: 45, returns: 32 },
    { month: 'FEB', visitors: 135, buyers: 52, returns: 38 },
    { month: 'MAR', visitors: 145, buyers: 58, returns: 42 },
    { month: 'APR', visitors: 165, buyers: 62, returns: 45 },
    { month: 'MAY', visitors: 152, buyers: 68, returns: 48 },
    { month: 'JUN', visitors: 178, buyers: 72, returns: 52 },
    { month: 'JUL', visitors: 185, buyers: 78, returns: 58 },
    { month: 'AUG', visitors: 195, buyers: 82, returns: 62 },
    { month: 'SEP', visitors: 205, buyers: 88, returns: 65 },
    { month: 'OCT', visitors: 225, buyers: 95, returns: 72 },
    { month: 'NOV', visitors: 215, buyers: 92, returns: 68 },
    { month: 'DEC', visitors: 210, buyers: 85, returns: 58 },
  ];

  // Data for Conversion Donut Chart
  const conversionData = [
    { name: 'Buyers', value: 48, color: '#0D6F73' },
    { name: 'New', value: 19, color: '#FF8C42' },
    { name: 'Other', value: 33, color: '#00B8F4' },
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: 'New client registration', 
      client: 'Maria Santos', 
      time: '2 hours ago', 
      type: 'user',
      color: 'bg-secondary'
    },
    { 
      id: 2, 
      action: 'Payment received', 
      client: 'Juan Dela Cruz', 
      amount: '₱25,000', 
      time: '4 hours ago', 
      type: 'payment',
      color: 'bg-accent'
    },
    { 
      id: 3, 
      action: 'Interment scheduled', 
      client: 'Rosa Garcia', 
      date: 'Dec 15, 2024', 
      time: '6 hours ago', 
      type: 'interment',
      color: 'bg-primary'
    },
    { 
      id: 4, 
      action: 'Lot reserved', 
      client: 'Pedro Rodriguez', 
      lot: 'Section A-15', 
      time: '1 day ago', 
      type: 'lot',
      color: 'bg-destructive'
    },
    { 
      id: 5, 
      action: 'Contract generated', 
      client: 'Carmen Lopez', 
      time: '1 day ago', 
      type: 'contract',
      color: 'bg-secondary'
    },
  ];

  const upcomingInterments = [
    { 
      id: 1, 
      client: 'Antonio Rivera', 
      date: 'Dec 12, 2024', 
      time: '10:00 AM', 
      lot: 'Section B-22' 
    },
    { 
      id: 2, 
      client: 'Carmen Lopez', 
      date: 'Dec 13, 2024', 
      time: '2:00 PM', 
      lot: 'Section C-8' 
    },
    { 
      id: 3, 
      client: 'Miguel Torres', 
      date: 'Dec 15, 2024', 
      time: '9:00 AM', 
      lot: 'Section A-31' 
    },
    { 
      id: 4, 
      client: 'Sofia Martinez', 
      date: 'Dec 16, 2024', 
      time: '11:30 AM', 
      lot: 'Section D-12' 
    },
    { 
      id: 5, 
      client: 'Luis Fernandez', 
      date: 'Dec 18, 2024', 
      time: '3:00 PM', 
      lot: 'Section B-45' 
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Lots Card */}
        <div className="card-3d relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm subheading">12%</span>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Total Lots</h3>
            <p className="text-3xl heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              1,247
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '68%' }}></div>
              </div>
              <span className="text-xs text-muted-foreground">68%</span>
            </div>
          </div>
        </div>

        {/* Sales Funnel Card */}
        <div className="card-3d relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm subheading">8%</span>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Sales Funnel</h3>
            <p className="text-3xl heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              48%
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Conversion</span>
              <span className="subheading text-accent">Active</span>
            </div>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="card-3d relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-destructive/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-10 h-10 rounded-full border-4 border-destructive/20 flex items-center justify-center">
                  <span className="text-xs heading text-destructive">12</span>
                </div>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Pending Payments</h3>
            <p className="text-3xl heading text-primary">
              ₱124,500
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overdue</span>
              <span className="subheading text-destructive">Action Required</span>
            </div>
          </div>
        </div>

        {/* Sales Volume Card */}
        <div className="card-3d relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-accent shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm subheading">15%</span>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Sales Volume</h3>
            <p className="text-3xl heading bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              ₱562,570
            </p>
            <div className="mt-3">
              <ResponsiveContainer width="100%" height={30}>
                <AreaChart data={salesVolumeData}>
                  <defs>
                    <linearGradient id="miniSalesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="sales" stroke="#2196F3" strokeWidth={2} fill="url(#miniSalesGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Visitors & Buyers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors & Buyers Chart - Takes 2 columns */}
        <Card className="lg:col-span-2 card-3d border-0 bg-gradient-to-br from-white to-gray-50/30" style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}>
          <CardContent className="p-6">
            {/* Header with Title and Legend */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl heading text-primary">Visitors & Buyers</h2>
              
              {/* Legend */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                  <span className="text-xs subheading text-primary">Visitors</span>
                  <span className="text-xs text-muted-foreground">59,156</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-secondary"></div>
                  <span className="text-xs subheading text-primary">Buyers</span>
                  <span className="text-xs text-muted-foreground">28,287</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3" style={{ width: '12px', height: '2px', backgroundColor: '#FF8C42' }}></div>
                  <span className="text-xs subheading text-primary">Returns</span>
                  <span className="text-xs text-muted-foreground">11,073</span>
                </div>
              </div>
            </div>

            {/* Combined Bar and Line Chart */}
            <div className="w-full" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={visitorsBuyersData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="visitorsBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1976D2" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#1976D2" stopOpacity={0.7}/>
                    </linearGradient>
                    
                    <linearGradient id="buyersBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2196F3" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2196F3" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#E6F2F1" 
                    vertical={false}
                  />
                  
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    axisLine={{ stroke: '#E6F2F1' }}
                    tickLine={false}
                    dy={5}
                  />
                  
                  <YAxis 
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 250]}
                    ticks={[0, 50, 100, 150, 200, 250]}
                  />
                  
                  <Bar 
                    dataKey="visitors" 
                    fill="url(#visitorsBarGradient)" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={16}
                  />
                  
                  <Bar 
                    dataKey="buyers" 
                    fill="url(#buyersBarGradient)" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={16}
                  />
                  
                  <Line 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="#FF8C42" 
                    strokeWidth={3}
                    dot={{ fill: '#FF8C42', r: 4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Donut Chart - Takes 1 column */}
        <Card className="card-3d border-0 bg-gradient-to-br from-white to-gray-50/30" style={{ boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl heading text-primary">Conversion</h2>
            </div>

            <div className="flex items-center justify-center" style={{ height: '280px' }}>
              <div className="relative">
                <ResponsiveContainer width={240} height={240}>
                  <PieChart>
                    <defs>
                      <linearGradient id="buyersGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1976D2" />
                        <stop offset="100%" stopColor="#0D47A1" />
                      </linearGradient>
                      <linearGradient id="newGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="otherGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2196F3" />
                        <stop offset="100%" stopColor="#1976D2" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={conversionData}
                      cx={120}
                      cy={120}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="url(#buyersGradient)" />
                      <Cell fill="url(#newGradient)" />
                      <Cell fill="url(#otherGradient)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Buyers</p>
                    <p className="text-4xl heading text-primary">48%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                <span className="text-xs subheading text-primary">New</span>
                <span className="text-xs text-muted-foreground">19%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Recent Activities & Upcoming Interments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="card-3d border-0">
          <CardContent className="p-6">
            <h2 className="text-xl heading text-primary mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-3 h-3 rounded-full ${activity.color} shadow-md`} />
                    <div className="flex-1">
                      <p className="subheading text-sm text-foreground">{activity.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.client}
                        {activity.amount && ` • ${activity.amount}`}
                        {activity.lot && ` • ${activity.lot}`}
                        {activity.date && ` • ${activity.date}`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interments */}
        <Card className="card-3d border-0">
          <CardContent className="p-6">
            <h2 className="text-xl heading text-primary mb-6">Upcoming Interments</h2>
            <div className="space-y-4">
              {upcomingInterments.map((interment) => (
                <div 
                  key={interment.id} 
                  className="flex items-center justify-between py-3 px-4 border-l-4 border-primary/40 rounded-r-xl hover:bg-primary/5 transition-all duration-200"
                >
                  <div className="flex-1">
                    <p className="subheading text-sm text-foreground">{interment.client}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{interment.lot}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm subheading text-primary">{interment.date}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{interment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Three Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Revenue */}
        <Card className="card-3d border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/5"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="subheading text-sm text-muted-foreground">Monthly Revenue</h3>
                <p className="text-2xl heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">₱2.1M</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-accent" />
                  <p className="text-xs subheading text-accent">+15% from last month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Lots */}
        <Card className="card-3d border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-primary/5"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="subheading text-sm text-muted-foreground">Available Lots</h3>
                <p className="text-2xl heading bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">391</p>
                <p className="text-xs subheading text-secondary mt-1">31% occupancy rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="card-3d border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-destructive/5"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-destructive to-destructive/80 shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="subheading text-sm text-muted-foreground">Pending Actions</h3>
                <p className="text-2xl heading text-destructive">12</p>
                <p className="text-xs subheading text-destructive mt-1">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}