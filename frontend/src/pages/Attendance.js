import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Attendance() {
  const { authFetch } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch attendance data on mount
  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceHistory();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await authFetch('/attendance/today');
      if (response.ok) {
        const data = await response.json();
        setIsCheckedIn(data.checked_in);
        setIsCheckedOut(data.checked_out);
        if (data.attendance) {
          setCheckInTime(data.attendance.in_time);
          setCheckOutTime(data.attendance.out_time);
        }
      }
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/attendance/my-history');
      if (response.ok) {
        const data = await response.json();
        setAttendanceHistory(data);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const response = await authFetch('/attendance/check-in', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setIsCheckedIn(true);
        setCheckInTime(data.in_time);
        toast.success(`Checked in at ${formatTime(data.in_time)}`);
        fetchAttendanceHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const response = await authFetch('/attendance/check-out', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setIsCheckedOut(true);
        setCheckOutTime(data.out_time);
        toast.success(`Checked out at ${formatTime(data.out_time)}. Total: ${data.work_hours}`);
        fetchAttendanceHistory(); // Refresh history
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to check out');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    // Handle time string format (HH:MM:SS)
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate stats from history
  const presentDays = attendanceHistory.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentDays = attendanceHistory.filter(r => r.status === 'Absent').length;
  const attendanceRate = attendanceHistory.length > 0
    ? Math.round((presentDays / attendanceHistory.length) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground mt-1">Track your daily attendance</p>
      </div>

      {/* Check In/Out Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {isCheckedOut ? 'Day Complete' : isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {isCheckedIn && checkInTime && `In: ${formatTime(checkInTime)}`}
                  {isCheckedOut && checkOutTime && ` • Out: ${formatTime(checkOutTime)}`}
                  {!isCheckedIn && 'Mark your attendance for today'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isCheckedIn ? (
                <Button
                  size="lg"
                  onClick={handleCheckIn}
                  className="px-8 h-12"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Check In
                    </>
                  )}
                </Button>
              ) : !isCheckedOut ? (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleCheckOut}
                  className="px-8 h-12"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-5 h-5 mr-2" />
                      Check Out
                    </>
                  )}
                </Button>
              ) : (
                <Badge className="bg-success/20 text-success border-success/30 px-4 py-2 text-base">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed for Today
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{presentDays}</h3>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{absentDays}</h3>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{attendanceRate}%</h3>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading history...</span>
            </div>
          ) : attendanceHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formatDate(record.date)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{formatTime(record.in_time)}</td>
                      <td className="py-3 px-4 text-sm">{formatTime(record.out_time)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{record.work_hours || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={record.status === 'Present' ? 'default' : record.status === 'Late' ? 'secondary' : 'destructive'}
                          className="font-medium"
                        >
                          {record.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}