import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckSquare, Clock, MapPin, User, Target, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { db, auth } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';

/**
 * Expected Firestore collections (create them as needed):
 *
 * - schedules
 *   { id, time: Timestamp, client, service, lot, status, staffId }
 *   Example: { time: Timestamp.fromDate(new Date()), status: 'confirmed' | 'pending' }
 *
 * - tasks
 *   { id, task, priority: 'high' | 'medium' | 'low', due: Timestamp | string, status, staffId }
 *
 * - staffPerformanceWeekly
 *   { id, weekLabel: 'Week 1', completed: number, pending: number, staffId }
 *
 * - staffClientInteractions
 *   { id, dayLabel: 'Mon'|'Tue'... , interactions: number, weekStart: Timestamp, staffId }
 *
 * The component filters by the current authenticated user’s UID (staffId = auth.currentUser?.uid).
 */

type ScheduleItem = {
  id: string;
  time: Timestamp;
  client: string;
  service: string;
  lot: string;
  status: 'confirmed' | 'pending' | 'in-progress' | 'completed';
  staffId?: string;
};

type TaskItem = {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  due: Timestamp | string;
  status: 'in-progress' | 'pending' | 'completed';
  staffId?: string;
};

type PerformanceItem = {
  id: string;
  weekLabel: string; // e.g., "Week 1"
  completed: number;
  pending: number;
  staffId?: string;
};

type InteractionItem = {
  id: string;
  dayLabel: string; // e.g., "Mon"
  interactions: number;
  weekStart?: Timestamp;
  staffId?: string;
};

export function StaffDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [performance, setPerformance] = useState<PerformanceItem[]>([]);
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Current staff user
  const staffId = auth.currentUser?.uid || null;

  // Optional: If you have a staff profile doc, you can read it (e.g., roles or assignment)
  // useEffect(() => {
  //   if (!staffId) return;
  //   const staffRef = doc(db, 'staffProfiles', staffId);
  //   getDoc(staffRef).then(/*...*/);
  // }, [staffId]);

  useEffect(() => {
    if (!staffId) {
      // If not logged in yet, wait briefly. Your app should handle auth before mounting this.
      setLoading(false);
      setError('No authenticated staff user. Please sign in as staff.');
      return;
    }

    setLoading(true);
    setError(null);

    // Today’s start/end
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Schedules for today for this staff
    const schedulesQuery = query(
      collection(db, 'schedules'),
      where('staffId', '==', staffId),
      where('time', '>=', Timestamp.fromDate(startOfDay)),
      where('time', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('time', 'asc')
    );

    // Tasks assigned to this staff (active first)
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('staffId', '==', staffId),
      orderBy('status', 'asc'),
      limit(50)
    );

    // Weekly performance (latest 4 weeks)
    const performanceQuery = query(
      collection(db, 'staffPerformanceWeekly'),
      where('staffId', '==', staffId),
      orderBy('weekLabel', 'asc'),
      limit(4)
    );

    // Client interactions (current week) — or last 7 entries
    const interactionsQuery = query(
      collection(db, 'staffClientInteractions'),
      where('staffId', '==', staffId),
      orderBy('dayLabel', 'asc'),
      limit(7)
    );

    const unsubSchedules = onSnapshot(
      schedulesQuery,
      (snap) => {
        const items: ScheduleItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setSchedule(items);
      },
      (e) => setError(e.message)
    );

    const unsubTasks = onSnapshot(
      tasksQuery,
      (snap) => {
        const items: TaskItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setTasks(items);
      },
      (e) => setError(e.message)
    );

    const unsubPerformance = onSnapshot(
      performanceQuery,
      (snap) => {
        const items: PerformanceItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setPerformance(items);
      },
      (e) => setError(e.message)
    );

    const unsubInteractions = onSnapshot(
      interactionsQuery,
      (snap) => {
        const items: InteractionItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setInteractions(items);
      },
      (e) => setError(e.message)
    );

    setLoading(false);

    return () => {
      unsubSchedules();
      unsubTasks();
      unsubPerformance();
      unsubInteractions();
    };
  }, [staffId]);

  // Derived values
  const activeTaskCount = useMemo(
    () => tasks.filter((t) => t.status !== 'completed').length,
    [tasks]
  );

  const taskDistribution = useMemo(() => {
    const total = tasks.length || 1;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;

    return [
      { name: 'Completed', value: Math.round((completed / total) * 100), color: '#2DF2A3' },
      { name: 'In Progress', value: Math.round((inProgress / total) * 100), color: '#00B8F4' },
      { name: 'Pending', value: Math.round((pending / total) * 100), color: '#FF7E47' },
    ];
  }, [tasks]);

  const performanceData = useMemo(
    () =>
      performance.map((p) => ({
        week: p.weekLabel,
        completed: p.completed,
        pending: p.pending,
      })),
    [performance]
  );

  const clientInteractions = useMemo(
    () =>
      interactions.map((i) => ({
        day: i.dayLabel,
        interactions: i.interactions,
      })),
    [interactions]
  );

  const performanceScore = useMemo(() => {
    const totals = performance.reduce(
      (acc, p) => {
        acc.completed += p.completed;
        acc.pending += p.pending;
        return acc;
      },
      { completed: 0, pending: 0 }
    );
    const denom = totals.completed + totals.pending;
    if (denom === 0) return 0;
    return Math.round((totals.completed / denom) * 100);
  }, [performance]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'low':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'pending':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'in-progress':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading staff dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">Error: {error}</p>
      </div>
    );
  }

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
              {schedule.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{schedule.length} appointments</p>
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
              {activeTaskCount}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{activeTaskCount} pending tasks</p>
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
              <Badge className="bg-accent/20 text-accent border-accent/30">
                {performanceScore >= 85 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs focus'}
              </Badge>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">Performance Score</h3>
            <p className="text-3xl font-bold heading bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              {performanceScore}%
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {performanceScore >= 85 ? 'Above target' : performanceScore >= 70 ? 'Near target' : 'Below target'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule - Detailed */}
        <div className="lg:col-span-2 card-3d-lg">
          <h2 className="text-xl font-bold heading text-primary mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            {schedule.map((item) => {
              const timeStr = item.time?.toDate
                ? item.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : String(item.time);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-all duration-300 border-l-4 border-primary"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">{timeStr}</span>
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
              );
            })}
            {schedule.length === 0 && (
              <p className="text-sm text-muted-foreground">No appointments scheduled for today.</p>
            )}
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
                <p className="text-sm font-semibold">{isNaN(item.value) ? 0 : item.value}%</p>
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
            {tasks.map((task) => {
              const dueStr =
                typeof task.due === 'string'
                  ? task.due
                  : task.due?.toDate
                  ? task.due.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'N/A';
              return (
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
                    <p className="text-xs text-muted-foreground">Due: {dueStr}</p>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks assigned.</p>
            )}
          </div>
        </div>

        {/* Weekly Performance Chart */}
        <div className="card-3d-lg">
          <h2 className="text-xl font-bold heading text-primary mb-6">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performanceData}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DF2A3" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#00E09C" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B8F4" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.7} />
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
                  boxShadow: '0 4px 12px rgba(0, 91, 115, 0.15)',
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
            <span className="text-sm font-semibold text-accent">
              {performanceScore >= 85 ? '+20% from last week' : '+10% from last week'}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={clientInteractions}>
            <defs>
              <linearGradient id="interactionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00B8F4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00B8F4" stopOpacity={0.05} />
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
                boxShadow: '0 4px 12px rgba(0, 91, 115, 0.15)',
              }}
            />
            <Area type="monotone" dataKey="interactions" stroke="#00B8F4" strokeWidth={3} fill="url(#interactionsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
