import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, DollarSign, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { collection, query, getDocs, where, orderBy, limit, Timestamp, addDoc } from 'firebase/firestore';import { db } from '../../firebase';

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
    totalVisitors: 0,
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
// Helper to log visitor activity
  const logVisitorActivity = async (userId, activityType) => {
    try {
      await addDoc(collection(db, 'visitor_logs'), {
        userId: userId,
        activityType: activityType, // 'page_view', 'plan_view', 'inquiry'
        timestamp: Timestamp.now(),
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error logging visitor:', error);
    }
  };
  const loadStatistics = async () => {
  try {
    // Get all agreements and filter in memory to avoid index issues
    const agreementsSnapshot = await getDocs(collection(db, 'preNeedAgreements'));
const activeAgreements = agreementsSnapshot.docs.filter(doc => 
  doc.data().status === 'active'
);
 // Get all payments and filter/sort in memory
const paymentsSnapshot = await getDocs(collection(db, 'payments'));
const completedPayments = paymentsSnapshot.docs.filter(doc => 
  doc.data().status === 'completed'
);
// Calculate total revenue from completed payments only
let totalRevenue = 0;
let pendingCount = 0;
let pendingAmount = 0;

completedPayments.forEach(doc => {
  const amount = doc.data().amount || 0;
  totalRevenue += amount;
});
 // Calculate pending payments from active agreements
activeAgreements.forEach(doc => {
  const data = doc.data();
  const remaining = Number(data.remainingBalance) || 0;
  const monthlyPayment = Number(data.monthlyPayment) || 0;
  
  if (remaining > 0 && monthlyPayment > 0) {
    pendingCount++;
    pendingAmount += monthlyPayment;
  }
});
      // Get current month revenue
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
     // Calculate monthly revenue by filtering in memory
let monthlyRevenue = 0;
completedPayments.forEach(doc => {
  const paidAt = doc.data().paidAt?.toDate();
  if (paidAt && paidAt >= startOfMonth) {
    monthlyRevenue += doc.data().amount || 0;
  }
});
// Get last month dates
const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate last month revenue by filtering in memory
let lastMonthRevenue = 0;
completedPayments.forEach(doc => {
  const paidAt = doc.data().paidAt?.toDate();
  if (paidAt && paidAt >= startOfLastMonth && paidAt <= endOfLastMonth) {
    lastMonthRevenue += doc.data().amount || 0;
  }
});
    const revenueGrowth = lastMonthRevenue > 0 
  ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
  : monthlyRevenue > 0 ? 100 : 0;
      // Get interment requests for occupied lots
// Calculate occupied lots from completed agreements
const completedAgreements = agreementsSnapshot.docs.filter(doc => 
  doc.data().status === 'completed' || doc.data().remainingBalance === 0
);

const occupiedLots = completedAgreements.length;

// Calculate sales funnel: (completed / total agreements) * 100
const totalAgreements = agreementsSnapshot.size;
const salesFunnel = totalAgreements > 0 
  ? Math.round((occupiedLots / totalAgreements) * 100)
  : 0;

// Calculate total visitors from visitor_logs
let totalVisitors = 0;
try {
  const visitorLogsSnapshot = await getDocs(collection(db, 'visitor_logs'));
  totalVisitors = visitorLogsSnapshot.size;
} catch (error) {
  console.log('No visitor logs yet:', error);
  // Estimate visitors if no logs exist
  totalVisitors = totalAgreements * 3;
}

setDashboardData({  
        totalLots: 1596,
        occupiedLots: occupiedLots,
        availableLots: 1596 - occupiedLots,
        salesFunnel: salesFunnel,
        pendingPayments: pendingCount,
        pendingPaymentsAmount: pendingAmount,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        revenueGrowth: revenueGrowth,
        totalVisitors: totalVisitors,
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
       time: formatTimestamp(data.createdAt),
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
  time: formatTimestamp(data.createdAt),
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
      const now = new Date();
      
      // Generate last 6 months dynamically
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        months.push(monthNames[monthDate.getMonth()]);
      }
      
      const salesVolume = [];
      const visitorsData = [];


// Get all completed payments once
const paymentsSnapshot = await getDocs(collection(db, 'payments'));
const completedPayments = paymentsSnapshot.docs.filter(doc => 
  doc.data().status === 'completed'
);

// Get all agreements once
const agreementsSnapshot = await getDocs(collection(db, 'preNeedAgreements'));

// Get all visitor logs once
let visitorLogsSnapshot = null;
try {
  visitorLogsSnapshot = await getDocs(collection(db, 'visitor_logs'));
} catch (error) {
  console.log('No visitor logs available:', error);
}

      for (let i = 0; i < 6; i++) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - (5 - i));
        
        const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    // Calculate revenue by filtering completed payments in memory
let monthlyRevenue = 0;
completedPayments.forEach(doc => {
  const paidAt = doc.data().paidAt?.toDate();
  if (paidAt && paidAt >= startDate && paidAt <= endDate) {
    monthlyRevenue += doc.data().amount || 0;
  }
});

        salesVolume.push({
          month: months[i],
          sales: monthlyRevenue / 1000, // Convert to thousands
        });

// Calculate buyers from agreements created this month
let monthlyBuyers = 0;
agreementsSnapshot.docs.forEach(doc => {
  const createdAt = doc.data().createdAt?.toDate();
  if (createdAt && createdAt >= startDate && createdAt <= endDate) {
    monthlyBuyers++;
  }
});

// Get real visitor logs for this month
let monthlyVisitors = 0;
if (visitorLogsSnapshot) {
  visitorLogsSnapshot.docs.forEach(doc => {
    const logDate = doc.data().timestamp?.toDate();
    if (logDate && logDate >= startDate && logDate <= endDate) {
      monthlyVisitors++;
    }
  });
}

// If no visitor logs exist yet, estimate from buyers
if (monthlyVisitors === 0 && monthlyBuyers > 0) {
  monthlyVisitors = monthlyBuyers * 3; // Estimate 3x visitors per buyer
}

const returns = Math.floor(monthlyBuyers * 0.3);

visitorsData.push({
  month: months[i],
  visitors: monthlyVisitors,
  buyers: monthlyBuyers,
  returns: returns,
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
 const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = Math.floor((Number(now) - Number(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    const days = Math.floor(diffInHours / 24);
    return `${days} days ago`;
  } catch (err) {
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
    { name: 'Buyers', value: dashboardData.occupiedLots || 1, color: '#0D6F73' },
    { name: 'Visitors', value: dashboardData.totalVisitors || 1, color: '#FF8C42' },
    { name: 'Pending', value: dashboardData.pendingPayments || 1, color: '#00B8F4' },
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
            <div className="flex flex-col items-center justify-center" style={{ height: '280px' }}>
              {/* Pie Chart */}
              <ResponsiveContainer width={240} height={180}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx={120}
                    cy={90}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

           {/* Center Percentage Display */}
{/* Center Percentage Display */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground mb-1">Buyers</p>
                  <p className="text-4xl font-bold text-primary">
                    {(() => {
                      const total = conversionData.reduce((sum, item) => sum + item.value, 0);
                      const buyersPercent = total > 0 ? Math.round((conversionData[0].value / total) * 100) : 0;
                      return `${buyersPercent}%`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4">
                {conversionData.map((entry, index) => {
                  const total = conversionData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.name} {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
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