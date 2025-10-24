import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, MapPin, Download, Filter, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

export function ReportsAnalytics() {
  const [installmentFilter, setInstallmentFilter] = useState('all');
  const [lotTypeFilter, setLotTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('2024');
  const monthlyRevenue = [
    { month: 'Jan', revenue: 1800000, lots: 35 },
    { month: 'Feb', revenue: 2100000, lots: 42 },
    { month: 'Mar', revenue: 1950000, lots: 38 },
    { month: 'Apr', revenue: 2250000, lots: 45 },
    { month: 'May', revenue: 2400000, lots: 48 },
    { month: 'Jun', revenue: 2150000, lots: 43 },
    { month: 'Jul', revenue: 2300000, lots: 46 },
    { month: 'Aug', revenue: 2100000, lots: 42 },
    { month: 'Sep', revenue: 2450000, lots: 49 },
    { month: 'Oct', revenue: 2600000, lots: 52 },
    { month: 'Nov', revenue: 2350000, lots: 47 },
    { month: 'Dec', revenue: 2100000, lots: 42 },
  ];

  const lotStatusData = [
    { name: 'Available', value: 391, color: '#22c55e' },
    { name: 'Reserved', value: 125, color: '#eab308' },
    { name: 'Sold', value: 731, color: '#ef4444' },
  ];

  const paymentTrends = [
    { month: 'Jan', paid: 85, pending: 15 },
    { month: 'Feb', paid: 88, pending: 12 },
    { month: 'Mar', paid: 82, pending: 18 },
    { month: 'Apr', paid: 90, pending: 10 },
    { month: 'May', paid: 92, pending: 8 },
    { month: 'Jun', paid: 87, pending: 13 },
    { month: 'Jul', paid: 89, pending: 11 },
    { month: 'Aug', paid: 91, pending: 9 },
    { month: 'Sep', paid: 86, pending: 14 },
    { month: 'Oct', paid: 93, pending: 7 },
    { month: 'Nov', paid: 88, pending: 12 },
    { month: 'Dec', paid: 85, pending: 15 },
  ];

  const intermentData = [
    { month: 'Jan', interments: 28 },
    { month: 'Feb', interments: 32 },
    { month: 'Mar', interments: 25 },
    { month: 'Apr', interments: 35 },
    { month: 'May', interments: 38 },
    { month: 'Jun', interments: 31 },
    { month: 'Jul', interments: 34 },
    { month: 'Aug', interments: 29 },
    { month: 'Sep', interments: 37 },
    { month: 'Oct', interments: 41 },
    { month: 'Nov', interments: 33 },
    { month: 'Dec', interments: 30 },
  ];

  const installmentData = [
    { plan: '12 months', contracts: 85, revenue: 15200000 },
    { plan: '36 months', contracts: 142, revenue: 28400000 },
    { plan: '60 months', contracts: 97, revenue: 24100000 },
  ];

  const lotTypeRevenue = [
    { type: 'Lawn Area', sold: 245, revenue: 17500000 },
    { type: 'Memorial Garden', sold: 89, revenue: 34800000 },
    { type: 'Garden Family Estate', sold: 34, revenue: 28900000 },
    { type: 'Family Estate', sold: 12, revenue: 23100000 },
  ];

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (installmentFilter !== 'all') count++;
    if (lotTypeFilter !== 'all') count++;
    if (paymentStatusFilter !== 'all') count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Financial and operational insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setInstallmentFilter('all');
                setLotTypeFilter('all');
                setPaymentStatusFilter('all');
              }}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Installment Plan</label>
              <Select value={installmentFilter} onValueChange={setInstallmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                  <SelectItem value="60">60 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Lot Type</label>
              <Select value={lotTypeFilter} onValueChange={setLotTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Lot Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lot Types</SelectItem>
                  <SelectItem value="lawn">Lawn Area</SelectItem>
                  <SelectItem value="memorial">Memorial Garden</SelectItem>
                  <SelectItem value="garden_family">Garden Family Estate</SelectItem>
                  <SelectItem value="family">Family Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Annual Revenue</p>
                <p className="text-2xl font-bold text-green-600">₱27.1M</p>
                <p className="text-xs text-green-600">+12% from last year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Lots Sold</p>
                <p className="text-2xl font-bold text-blue-600">731</p>
                <p className="text-xs text-blue-600">58% occupancy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">856</p>
                <p className="text-xs text-purple-600">+5% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Monthly Revenue</p>
                <p className="text-2xl font-bold text-orange-600">₱2.26M</p>
                <p className="text-xs text-orange-600">+8% trend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="lots">Lots</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="installments">Installments</TabsTrigger>
          <TabsTrigger value="interments">Interments</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`₱${(Number(value) / 1000000).toFixed(2)}M`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Lots Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="lots" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lots" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lot Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={lotStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {lotStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Lot Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="lots" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="paid" stackId="a" fill="#10b981" name="Paid %" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Installment Plan Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={installmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plan" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₱${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'contracts' ? value : `₱${(Number(value) / 1000000).toFixed(2)}M`,
                        name === 'contracts' ? 'Contracts' : 'Revenue'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="contracts" fill="#3b82f6" name="contracts" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lot Type Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={lotTypeRevenue}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {lotTypeRevenue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₱${(Number(value) / 1000000).toFixed(2)}M`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Installment Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Installment Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Plan</th>
                      <th className="text-right p-2">Contracts</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Avg. Contract Value</th>
                      <th className="text-right p-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installmentData.map((plan, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{plan.plan}</td>
                        <td className="p-2 text-right">{plan.contracts}</td>
                        <td className="p-2 text-right">₱{(plan.revenue / 1000000).toFixed(2)}M</td>
                        <td className="p-2 text-right">₱{(plan.revenue / plan.contracts / 1000).toFixed(0)}K</td>
                        <td className="p-2 text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {Math.floor(Math.random() * 15) + 85}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Interments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={intermentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="interments" stroke="#8b5cf6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}