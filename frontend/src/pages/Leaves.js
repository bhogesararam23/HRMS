import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, FileText, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Leaves() {
  const { authFetch } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Fetch leaves on mount
  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/leaves');
      if (response.ok) {
        const data = await response.json();
        setMyLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    if (endDate < startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSubmitting(true);

    try {
      const response = await authFetch('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          leave_type: formData.leave_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason
        })
      });

      if (response.ok) {
        toast.success('Leave request submitted successfully!');
        setShowForm(false);
        setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
        fetchMyLeaves(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-success/20 text-success border-success/30';
      case 'Rejected':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-warning/20 text-warning border-warning/30';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate days between dates
  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Calculate leave stats
  const approvedLeaves = myLeaves.filter(l => l.status === 'Approved');
  const totalUsedDays = approvedLeaves.reduce((sum, leave) => {
    return sum + calculateDays(leave.start_date, leave.end_date);
  }, 0);
  const remainingDays = 30 - totalUsedDays; // Assuming 30 days total leave

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">Apply and track your leave requests</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leave</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">30</h3>
                <p className="text-xs text-muted-foreground mt-1">Days per year</p>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Used</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{totalUsedDays}</h3>
                <p className="text-xs text-muted-foreground mt-1">Days taken</p>
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{Math.max(0, remainingDays)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Days available</p>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Leave Type</Label>
                  <Select
                    value={formData.leave_type}
                    onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual Leave</SelectItem>
                      <SelectItem value="Sick">Sick Leave</SelectItem>
                      <SelectItem value="Personal">Personal Leave</SelectItem>
                      <SelectItem value="Emergency">Emergency Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading leaves...</span>
            </div>
          ) : myLeaves.length > 0 ? (
            <div className="space-y-4">
              {myLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-medium">
                          {leave.leave_type}
                        </Badge>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium text-foreground">
                          {formatDate(leave.start_date)}
                        </span>
                        {' '}→{' '}
                        <span className="font-medium text-foreground">
                          {formatDate(leave.end_date)}
                        </span>
                        {' '}({calculateDays(leave.start_date, leave.end_date)} days)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reason: {leave.reason}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Applied: {formatDate(leave.applied_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}