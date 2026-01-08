import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, MapPin, Download, Filter, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';


interface MonthlyData {
  month: string;
  revenue: number;
  lots: number;
}

interface LotStatusData {
  name: string;
  value: number;
  color: string;
}

interface PaymentTrend {
  month: string;
  paid: number;
  pending: number;
}

interface IntermentData {
  month: string;
  interments: number;
}

interface InstallmentData {
  plan: string;
  contracts: number;
  revenue: number;
}

interface LotTypeRevenue {
  type: string;
  sold: number;
  revenue: number;
}
export function ReportsAnalytics() {
const { currentUser, userRole } = useAuth();

  useEffect(() => {
    console.log('==========================================');
    console.log('🔍 Current User Email:', currentUser?.email);
    console.log('🔍 Current User UID:', currentUser?.uid);
    console.log('🔍 User Role:', userRole);
    console.log('🔍 Is Staff?', userRole === 'staff');
    console.log('🔍 Is Admin?', userRole === 'admin');
    console.log('🔍 Can Access?', userRole === 'staff' || userRole === 'admin');
    console.log('==========================================');
  }, [currentUser, userRole]);
  
  const [installmentFilter, setInstallmentFilter] = useState('all');
  const [lotTypeFilter, setLotTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('2025');
  const [isLoading, setIsLoading] = useState(true);

  // State for data
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyData[]>([]);
  const [lotStatusData, setLotStatusData] = useState<LotStatusData[]>([]);
  const [paymentTrends, setPaymentTrends] = useState<PaymentTrend[]>([]);
  const [intermentData, setIntermentData] = useState<IntermentData[]>([]);
  const [installmentData, setInstallmentData] = useState<InstallmentData[]>([]);
  const [lotTypeRevenue, setLotTypeRevenue] = useState<LotTypeRevenue[]>([]);

  // KPI Stats
  const [annualRevenue, setAnnualRevenue] = useState(0);
  const [lotsSold, setLotsSold] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [avgMonthlyRevenue, setAvgMonthlyRevenue] = useState(0);
useEffect(() => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    
    if (userRole !== 'staff' && userRole !== 'admin') {
      alert('⛔ Access Denied: This page is only accessible to staff members');
      window.location.href = '/dashboard';
      return;
    }
  }, [currentUser, userRole]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, installmentFilter, lotTypeFilter, paymentStatusFilter]);
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Load Pre-Need Agreements
      const preNeedQuery = query(collection(db, 'preNeedAgreements'));
      const preNeedSnapshot = await getDocs(preNeedQuery);

      // Load Payments
      const paymentsQuery = query(collection(db, 'payments'));
      const paymentsSnapshot = await getDocs(paymentsQuery);

      // Load Interment Requests
      const intermentQuery = query(collection(db, 'interment_requests'));
      const intermentSnapshot = await getDocs(intermentQuery);

      // Process Pre-Need Data with filters
      let preNeedPlans = preNeedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by selected year
      const selectedYear = parseInt(dateRange);
      preNeedPlans = preNeedPlans.filter((plan: any) => {
        if (!plan.startDate) return false;
        const planDate = plan.startDate.toDate ? plan.startDate.toDate() : new Date(plan.startDate);
        return planDate.getFullYear() === selectedYear;
      });

      // Apply installment filter
      if (installmentFilter !== 'all') {
        const filterMonths = parseInt(installmentFilter);
        preNeedPlans = preNeedPlans.filter((plan: any) => plan.termMonths === filterMonths);
      }

      // Apply lot type filter
      if (lotTypeFilter !== 'all') {
        preNeedPlans = preNeedPlans.filter((plan: any) => {
          const lotType = plan.lotType?.toLowerCase() || '';
          return lotType.includes(lotTypeFilter);
        });
      }

      // Apply payment status filter
      if (paymentStatusFilter !== 'all') {
        preNeedPlans = preNeedPlans.filter((plan: any) => {
          if (paymentStatusFilter === 'paid') {
            return plan.remainingBalance === 0;
          } else if (paymentStatusFilter === 'partial') {
            return plan.remainingBalance > 0 && plan.remainingBalance < plan.totalAmount;
          } else if (paymentStatusFilter === 'pending') {
            return plan.remainingBalance === plan.totalAmount;
          } else if (paymentStatusFilter === 'overdue') {
            return plan.status === 'overdue';
          }
          return true;
        });
      }
      
      // Calculate KPIs
      const totalRevenue = preNeedPlans.reduce((sum: number, plan: any) => 
        sum + ((plan.totalAmount || 0) - (plan.remainingBalance || 0)), 0
      );
      const totalSold = preNeedPlans.filter((plan: any) => 
        plan.status === 'completed' || plan.status === 'active'
      ).length;
      const totalActive = preNeedPlans.filter((plan: any) => plan.status === 'active').length;
      
      setAnnualRevenue(totalRevenue);
      setLotsSold(totalSold);
      setActiveClients(totalActive);
      setAvgMonthlyRevenue(totalRevenue / 12);

      // Process Monthly Revenue
      const monthlyData = processMonthlyRevenue(preNeedPlans, selectedYear);
      setMonthlyRevenue(monthlyData);

      // Process Lot Status
      const lotStatus = processLotStatus(preNeedPlans);
      setLotStatusData(lotStatus);

      // Process Payment Trends
      const paymentData = processPaymentTrends(paymentsSnapshot.docs, selectedYear);
      setPaymentTrends(paymentData);

      // Process Interment Data
      const intermentInfo = processIntermentData(intermentSnapshot.docs, selectedYear);
      setIntermentData(intermentInfo);

      // Process Installment Data
      const installmentInfo = processInstallmentData(preNeedPlans);
      setInstallmentData(installmentInfo);

      // Process Lot Type Revenue
      const lotTypeInfo = processLotTypeRevenue(preNeedPlans);
      setLotTypeRevenue(lotTypeInfo);

    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('❌ Error loading analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyRevenue = (plans: any[], year: number): MonthlyData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: MonthlyData[] = [];

    months.forEach((month, index) => {
      const monthPlans = plans.filter((plan: any) => {
        if (!plan.startDate) return false;
        const planDate = plan.startDate.toDate ? plan.startDate.toDate() : new Date(plan.startDate);
        return planDate.getMonth() === index && planDate.getFullYear() === year;
      });

      const revenue = monthPlans.reduce((sum: number, plan: any) => 
        sum + ((plan.totalAmount || 0) - (plan.remainingBalance || 0)), 0
      );

      monthlyData.push({
        month,
        revenue,
        lots: monthPlans.length
      });
    });

    return monthlyData;
  };

  const processLotStatus = (plans: any[]): LotStatusData[] => {
    const active = plans.filter((p: any) => p.status === 'active').length;
    const completed = plans.filter((p: any) => p.status === 'completed').length;
    const pending = plans.filter((p: any) => 
      p.status === 'overdue' || p.status === 'cancelled' || p.status === 'pending'
    ).length;

    return [
      { name: 'Active', value: active, color: '#22c55e' },
      { name: 'Completed', value: completed, color: '#3b82f6' },
      { name: 'Pending/Overdue', value: pending, color: '#eab308' },
    ];
  };

  const processPaymentTrends = (payments: any[], year: number): PaymentTrend[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: PaymentTrend[] = [];

    months.forEach((month, index) => {
      const monthPayments = payments.filter((payment: any) => {
        const doc = payment.data();
        if (!doc.date && !doc.createdAt) return false;
        const paymentDate = doc.date?.toDate ? doc.date.toDate() : 
                           doc.createdAt?.toDate ? doc.createdAt.toDate() : 
                           new Date(doc.date || doc.createdAt);
        return paymentDate.getMonth() === index && paymentDate.getFullYear() === year;
      });

      const totalPayments = monthPayments.length;
      const paidPayments = monthPayments.filter((p: any) => {
        const data = p.data();
        return data.status === 'paid' || data.status === 'completed';
      }).length;
      const pendingPayments = totalPayments - paidPayments;

      trends.push({
        month,
        paid: totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0,
        pending: totalPayments > 0 ? Math.round((pendingPayments / totalPayments) * 100) : 0
      });
    });

    return trends;
  };

  const processIntermentData = (interments: any[], year: number): IntermentData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: IntermentData[] = [];

    months.forEach((month, index) => {
const monthInterments = interments.filter((interment: any) => {
        const doc = interment.data();
        
        // Try to parse preferredDate first (format: MM/DD/YYYY)
        if (doc.preferredDate && typeof doc.preferredDate === 'string') {
          const dateParts = doc.preferredDate.split('/');
          if (dateParts.length === 3) {
            const month = parseInt(dateParts[0]) - 1; // Convert to 0-indexed
            const yearVal = parseInt(dateParts[2]);
            return month === index && yearVal === year;
          }
        }
        
        // Fallback to timestamp fields
        if (!doc.submittedAt && !doc.createdAt) return false;
        const intermentDate = doc.submittedAt?.toDate ? doc.submittedAt.toDate() : 
                             doc.createdAt?.toDate ? doc.createdAt.toDate() : 
                             new Date(doc.submittedAt || doc.createdAt);
        return intermentDate.getMonth() === index && intermentDate.getFullYear() === year;
      });

      data.push({
        month,
        interments: monthInterments.length
      });
    });

    return data;
  };

  const processInstallmentData = (plans: any[]): InstallmentData[] => {
    const installmentPlans = ['12 months', '36 months', '60 months'];
    const data: InstallmentData[] = [];

    installmentPlans.forEach(plan => {
      const planMonths = parseInt(plan);
      const planContracts = plans.filter((p: any) => p.termMonths === planMonths);
      const revenue = planContracts.reduce((sum: number, p: any) => 
        sum + (p.totalAmount || 0), 0
      );

      data.push({
        plan,
        contracts: planContracts.length,
        revenue
      });
    });

    return data;
  };

  const processLotTypeRevenue = (plans: any[]): LotTypeRevenue[] => {
    const lotTypes = [
      'Basic Package', 
      'Standard Package', 
      'Deluxe Memorial Package', 
      'Premium Memorial Package', 
      'Family Package'
    ];
    const data: LotTypeRevenue[] = [];

    lotTypes.forEach(type => {
      const typePlans = plans.filter((p: any) => p.planType === type);
      const revenue = typePlans.reduce((sum: number, p: any) => 
        sum + ((p.totalAmount || 0) - (p.remainingBalance || 0)), 0
      );

      if (typePlans.length > 0) {
        data.push({
          type,
          sold: typePlans.length,
          revenue
        });
      }
    });

    return data;
  };

  const handleExportPDF = () => {
    alert('✅ Exporting report as PDF...');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (installmentFilter !== 'all') count++;
    if (lotTypeFilter !== 'all') count++;
    if (paymentStatusFilter !== 'all') count++;
    return count;
  };
if (!currentUser || !userRole) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">Financial and operational insights for {dateRange}</p>
        </div>
    
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2030">2030</SelectItem>
              <SelectItem value="2029">2029</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
         
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
                <p className="text-sm text-gray-600">Annual Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{annualRevenue >= 1000000 
                    ? (annualRevenue / 1000000).toFixed(1) + 'M' 
                    : (annualRevenue / 1000).toFixed(0) + 'K'}
                </p>
                <p className="text-xs text-green-600">From pre-need plans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Lots Sold</p>
                <p className="text-2xl font-bold text-blue-600">{lotsSold}</p>
                <p className="text-xs text-blue-600">Active & completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-purple-600">{activeClients}</p>
                <p className="text-xs text-purple-600">Current contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Monthly Revenue</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₱{avgMonthlyRevenue >= 1000000 
                    ? (avgMonthlyRevenue / 1000000).toFixed(2) + 'M' 
                    : (avgMonthlyRevenue / 1000).toFixed(0) + 'K'}
                </p>
                <p className="text-xs text-orange-600">Estimated average</p>
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
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]} />
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
                    </tr>
                  </thead>
                  <tbody>
                    {installmentData.map((plan, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{plan.plan}</td>
                        <td className="p-2 text-right">{plan.contracts}</td>
                        <td className="p-2 text-right">₱{(plan.revenue / 1000000).toFixed(2)}M</td>
                        <td className="p-2 text-right">
                          {plan.contracts > 0 ? `₱${(plan.revenue / plan.contracts / 1000).toFixed(0)}K` : 'N/A'}
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