import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { collection, query, getDocs, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export function AdminDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalLots: 1569,
    occupiedLots: 0,
    availableLots: 1569,
    salesFunnel: 0,
    pendingPayments: 0,
    pendingPaymentsAmount: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingInterments, setUpcomingInterments] = useState([]);
  const [visitorsBuyersData, setVisitorsBuyersData] = useState([]);
  const [salesVolumeData, setSalesVolumeData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        loadStatistics(),
        loadRecentActivities(),
        loadUpcomingInterments(),
        loadChartData(),
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get all active agreements
      const agreementsQuery = query(
        collection(db, 'preNeedAgreements'),
        where('status', '==', 'active')
      );
      const agreementsSnapshot = await getDocs(agreementsQuery);

      // Get all completed payments
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('status', '==', 'completed')
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      // Calculate total revenue
      let totalRevenue = 0;
      let pendingCount = 0;
      let pendingAmount = 0;

      paymentsSnapshot.forEach(doc => {
        const amount = doc.data().amount || 0;
        totalRevenue += amount;
      });

      // Calculate pending payments from agreements
      agreementsSnapshot.forEach(doc => {
        const data = doc.data();
        const remaining = parseCurrency(data.remainingBalance || '₱0');
        const nextAmount = parseCurrency(data.nextPaymentAmount || '₱0');
        
        if (remaining > 0 && nextAmount > 0) {
          pendingCount++;
          pendingAmount += nextAmount;
        }
      });

      // Get current month revenue
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthlyPaymentsQuery = query(
        collection(db, 'payments'),
        where('paidAt', '>=', Timestamp.fromDate(startOfMonth)),
        where('status', '==', 'completed')
      );
      const monthlySnapshot = await getDocs(monthlyPaymentsQuery);
      
      let monthlyRevenue = 0;
      monthlySnapshot.forEach(doc => {
        monthlyRevenue += doc.data().amount || 0;
      });

      // Get last month revenue for growth calculation
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      const lastMonthQuery = query(
        collection(db, 'payments'),
        where('paidAt', '>=', Timestamp.fromDate(startOfLastMonth)),
        where('paidAt', '<=', Timestamp.fromDate(endOfLastMonth)),
        where('status', '==', 'completed')
      );
      const lastMonthSnapshot = await getDocs(lastMonthQuery);
      
      let lastMonthRevenue = 0;
      lastMonthSnapshot.forEach(doc => {
        lastMonthRevenue += doc.data().amount || 0;
      });

      // Calculate growth percentage
      const revenueGrowth = lastMonthRevenue > 0 
        ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      // Get interment requests for occupied lots
      const intermentQuery = query(collection(db, 'interment_requests'));
      const intermentSnapshot = await getDocs(intermentQuery);
      
      let occupiedLots = 0;
      intermentSnapshot.forEach(doc => {
        const status = doc.data().status?.toLowerCase();
        if (status === 'approved' || status === 'completed') {
          occupiedLots++;
        }
      });

      const totalRequests = intermentSnapshot.size;
      const salesFunnel = totalRequests > 0 
        ? Math.round((occupiedLots / totalRequests) * 100)
        : 0;

      setDashboardData({
        totalLots: 1247,
        occupiedLots,
        availableLots: 1247 - occupiedLots,
        salesFunnel,
        pendingPayments: pendingCount,
        pendingPaymentsAmount: pendingAmount,
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = [];

      // Get recent payments
      const paymentsQuery = query(
        collection(db, 'payments'),
        orderBy('paidAt', 'desc'),
        limit(5)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);

      for (const doc of paymentsSnapshot.docs) {
        const data = doc.data();
        
        // Get user name from users collection
        let userName = data.userEmail || 'Unknown User';
        try {
          const userQuery = query(
            collection(db, 'users'),
            where('email', '==', data.userEmail),
            limit(1)
          );
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            userName = userData.displayName || userData.fullName || userName;
          }
        } catch (e) {
          console.log('User not found:', e);
        }

        activities.push({
          id: doc.id,
          action: `Payment received - ${data.paymentType || 'Payment'}`,
          client: userName,
          amount: `₱${formatNumber(data.amount || 0)}`,
          time: getTimeAgo(data.paidAt),
          type: 'payment',
          color: 'bg-green-500',
          timestamp: data.paidAt,
        });
      }

      // Get recent agreements
      const agreementsQuery = query(
        collection(db, 'preNeedAgreements'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const agreementsSnapshot = await getDocs(agreementsQuery);

      for (const doc of agreementsSnapshot.docs) {
        const data = doc.data();
        
        activities.push({
          id: doc.id,
          action: 'New plan purchased',
          client: data.fullName || data.userEmail || 'Unknown',
          amount: data.totalPrice || '₱0',
          time: getTimeAgo(data.createdAt),
          type: 'agreement',
          color: 'bg-blue-500',
          timestamp: data.createdAt,
        });
      }

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || 0;
        const timeB = b.timestamp?.toMillis?.() || 0;
        return timeB - timeA;
      });

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setRecentActivities([]);
    }
  };

  const loadUpcomingInterments = async () => {
    try {
      const interments = [];
      const now = new Date();

      const intermentQuery = query(
        collection(db, 'interment_requests'),
        where('status', '==', 'Approved'),
        orderBy('preferredDate', 'asc'),
        limit(10)
      );
      const snapshot = await getDocs(intermentQuery);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Parse date from MM/DD/YYYY format
        const dateParts = data.preferredDate?.split('/');
        if (dateParts && dateParts.length === 3) {
          const intermentDate = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[0]) - 1,
            parseInt(dateParts[1])
          );

          // Only include future dates
          if (intermentDate >= now) {
            interments.push({
              id: doc.id,
              client: data.deceasedName || 'Unknown',
              date: formatDate(intermentDate),
              time: data.preferredTime || '10:00 AM',
              lot: `${data.section || 'N/A'} - Block ${data.block || 'N/A'}, Lot ${data.lotNumber || 'N/A'}`,
            });
          }
        }
      }

      // Limit to 5 upcoming interments
      setUpcomingInterments(interments.slice(0, 5));
    } catch (error) {
      console.error('Error loading upcoming interments:', error);
      setUpcomingInterments([]);
    }
  };

  const loadChartData = async () => {
    try {
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
      const salesVolume = [];
      const visitorsData = [];
      const now = new Date();

      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        
        const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

        // Get payments for this month
        const monthPaymentsQuery = query(
          collection(db, 'payments'),
          where('paidAt', '>=', Timestamp.fromDate(startDate)),
          where('paidAt', '<=', Timestamp.fromDate(endDate)),
          where('status', '==', 'completed')
        );
        
        const snapshot = await getDocs(monthPaymentsQuery);
        
        let monthlyRevenue = 0;
        snapshot.forEach(doc => {
          monthlyRevenue += doc.data().amount || 0;
        });

        salesVolume.push({
          month: months[i],
          sales: monthlyRevenue / 1000, // Convert to thousands
        });

        // Mock visitor data (you can replace this with real data from your analytics)
        visitorsData.push({
          month: months[i],
          visitors: Math.floor(120 + (i * 15) + Math.random() * 20),
          buyers: Math.floor(45 + (i * 5) + Math.random() * 10),
          returns: Math.floor(32 + (i * 3) + Math.random() * 5),
        });
      }

      setSalesVolumeData(salesVolume);
      setVisitorsBuyersData(visitorsData);
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Set empty data on error
      setSalesVolumeData([]);
      setVisitorsBuyersData([]);
    }
  };

  // Helper function to parse currency strings
  const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[₱,\s]/g, '')) || 0;
    }
    return 0;
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    return Math.round(num).toLocaleString();
  };

  // Helper function to get relative time
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error in getTimeAgo:', error);
      return 'Unknown';
    }
  };

  // Helper function to format dates
  const formatDate = (date) => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (error) {
      console.error('Error in formatDate:', error);
      return 'Invalid Date';
    }
  };

  const conversionData = [
    { name: 'Buyers', value: dashboardData.salesFunnel, color: '#0D6F73' },
    { name: 'New', value: Math.round((100 - dashboardData.salesFunnel) * 0.4), color: '#FF8C42' },
    { name: 'Other', value: 100 - dashboardData.salesFunnel - Math.round((100 - dashboardData.salesFunnel) * 0.4), color: '#00B8F4' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
                <span className="text-sm subheading">
                  {Math.round((dashboardData.occupiedLots / dashboardData.totalLots) * 100)}%
                </span>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Total Lots</h3>
            <p className="text-3xl heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {dashboardData.totalLots.toLocaleString()}
            </p>
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" 
                  style={{ width: `${(dashboardData.occupiedLots / dashboardData.totalLots) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((dashboardData.occupiedLots / dashboardData.totalLots) * 100)}%
              </span>
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
              {dashboardData.salesFunnel}%
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
                  <span className="text-xs heading text-destructive">
                    {dashboardData.pendingPayments}
                  </span>
                </div>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Pending Payments</h3>
            <p className="text-3xl heading text-primary">
              ₱{formatNumber(dashboardData.pendingPaymentsAmount)}
            </p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next Due</span>
              <span className="subheading text-destructive">Action Required</span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="card-3d relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-accent shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-accent">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm subheading">{dashboardData.revenueGrowth}%</span>
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground subheading mb-1">Monthly Revenue</h3>
            <p className="text-3xl heading bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              ₱{(dashboardData.monthlyRevenue / 1000).toFixed(1)}K
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors & Buyers Chart */}
        <Card className="lg:col-span-2 card-3d border-0 bg-gradient-to-br from-white to-gray-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl heading text-primary">Visitors & Buyers</h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent"></div>
                  <span className="text-xs subheading text-primary">Visitors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent to-secondary"></div>
                  <span className="text-xs subheading text-primary">Buyers</span>
                </div>
              </div>
            </div>

            <div className="w-full" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitorsBuyersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6F2F1" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Bar dataKey="visitors" fill="#1976D2" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="buyers" fill="#2196F3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Chart */}
        <Card className="card-3d border-0 bg-gradient-to-br from-white to-gray-50/30">
          <CardContent className="p-6">
            <h2 className="text-xl heading text-primary mb-6">Conversion</h2>
            <div className="flex items-center justify-center" style={{ height: '280px' }}>
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx={120}
                    cy={120}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Upcoming Interments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="card-3d border-0">
          <CardContent className="p-6">
            <h2 className="text-xl heading text-primary mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${activity.color}`} />
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.client} • {activity.amount}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interments */}
        <Card className="card-3d border-0">
          <CardContent className="p-6">
            <h2 className="text-xl heading text-primary mb-6">Upcoming Interments</h2>
            <div className="space-y-4">
              {upcomingInterments.length > 0 ? (
                upcomingInterments.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border hover:bg-primary/5 transition">
                    <p className="font-medium text-sm">{item.client}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.date} • {item.time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.lot}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming interments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}