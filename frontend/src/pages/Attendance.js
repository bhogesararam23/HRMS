import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import { attendanceRecords } from '../data/mockData';
import { toast } from 'sonner';

export default function Attendance() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  const myAttendance = attendanceRecords.filter(
    record => record.employeeId === user.employeeId
  );

  const handleCheckIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    setIsCheckedIn(true);
    setCheckInTime(time);
    toast.success(`Checked in at ${time}`);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    toast.success(`Checked out at ${time}`);
    setIsCheckedIn(false);
    setCheckInTime(null);
  };

  const presentDays = myAttendance.filter(r => r.status === 'Present').length;
  const absentDays = myAttendance.filter(r => r.status === 'Absent').length;
  const attendanceRate = Math.round((presentDays / myAttendance.length) * 100);

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
                  {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {isCheckedIn ? `Since ${checkInTime}` : 'Mark your attendance for today'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {!isCheckedIn ? (
                <Button 
                  size="lg" 
                  onClick={handleCheckIn}
                  className="px-8 h-12"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Check In
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="destructive"
                  onClick={handleCheckOut}
                  className="px-8 h-12"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Check Out
                </Button>
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
                <p className="text-xs text-muted-foreground mt-1">This month</p>
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
                <p className="text-xs text-muted-foreground mt-1">This month</p>
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
                <p className="text-xs text-muted-foreground mt-1">This month</p>
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
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
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
                {myAttendance.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{record.checkIn || '-'}</td>
                    <td className="py-3 px-4 text-sm">{record.checkOut || '-'}</td>
                    <td className="py-3 px-4 text-sm font-medium">{record.hours}h</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={record.status === 'Present' ? 'default' : 'destructive'}
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
        </CardContent>
      </Card>
    </div>
  );
}