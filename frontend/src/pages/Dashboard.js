import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard user={user} />;
}

function AdminDashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await authFetch('/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch pending leaves
      const leavesResponse = await authFetch('/leaves');
      if (leavesResponse.ok) {
        const leavesData = await leavesResponse.json();
        const pending = leavesData.filter(l => l.status === 'Pending');
        setPendingLeaves(pending);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample attendance trends data (could be fetched from backend)
  const attendanceTrends = [
    { date: 'Mon', present: 45, absent: 3, late: 2 },
    { date: 'Tue', present: 47, absent: 2, late: 1 },
    { date: 'Wed', present: 44, absent: 4, late: 2 },
    { date: 'Thu', present: 48, absent: 1, late: 1 },
    { date: 'Fri', present: 43, absent: 5, late: 2 },
  ];

  // Upcoming holidays
  const upcomingHolidays = [
    { id: 1, name: 'Republic Day', date: '2026-01-26', type: 'National' },
    { id: 2, name: 'Holi', date: '2026-03-14', type: 'Festival' },
    { id: 3, name: 'Independence Day', date: '2026-08-15', type: 'National' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Employees',
      value: stats?.total_employees || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%'
    },
    {
      title: 'On Leave Today',
      value: stats?.on_leave_today || 0,
      icon: UserCheck,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      subtitle: 'employees'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pending_leaves || 0,
      icon: Clock,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      subtitle: 'requests'
    },
    {
      title: 'Present Today',
      value: stats?.present_today || 0,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: 'employees'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your organization</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                    {stat.change && (
                      <p className="text-xs text-success mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change} from last month
                      </p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Attendance Trends (Last 5 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="present" fill="hsl(var(--primary))" name="Present" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(var(--destructive))" name="Absent" radius={[8, 8, 0, 0]} />
                <Bar dataKey="late" fill="hsl(var(--warning))" name="Late" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-warning" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{request.user_name || 'Employee'}</p>
                    <p className="text-xs text-muted-foreground">{request.leave_type} • {calculateDays(request.start_date, request.end_date)} days</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full">
                    Pending
                  </span>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending approvals
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Holidays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{holiday.name}</p>
                    <p className="text-xs text-muted-foreground">{holiday.type}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDashboard({ user }) {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample attendance trends
  const attendanceTrends = [
    { date: 'Mon', present: 8 },
    { date: 'Tue', present: 9 },
    { date: 'Wed', present: 8 },
    { date: 'Thu', present: 9 },
    { date: 'Fri', present: 7 },
  ];

  // Upcoming holidays
  const upcomingHolidays = [
    { id: 1, name: 'Republic Day', date: '2026-01-26', type: 'National' },
    { id: 2, name: 'Holi', date: '2026-03-14', type: 'Festival' },
    { id: 3, name: 'Independence Day', date: '2026-08-15', type: 'National' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Attendance',
      value: `${stats?.attendance_percentage || 0}%`,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtitle: 'This month'
    },
    {
      title: 'Pending Leaves',
      value: stats?.pending_leaves || 0,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtitle: 'requests'
    },
    {
      title: 'Next Holiday',
      value: stats?.next_holiday?.split(' (')[0] || 'None',
      icon: Calendar,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      subtitle: stats?.next_holiday?.match(/\((.*?)\)/)?.[1] || ''
    },
    {
      title: 'Present Today',
      value: stats?.present_today || 0,
      icon: FileText,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      subtitle: 'colleagues'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name || 'User'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-2">{stat.value}</h3>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            My Attendance (Last 5 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="present" fill="hsl(var(--primary))" name="Hours Worked" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <span className="text-sm font-medium">Mark Attendance</span>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <span className="text-sm font-medium">Apply for Leave</span>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <span className="text-sm font-medium">View Payslip</span>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{holiday.name}</p>
                    <p className="text-xs text-muted-foreground">{holiday.type}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function
function calculateDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}