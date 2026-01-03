import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { CheckCircle, XCircle, Clock, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000';

export default function ApprovalCenter() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [stats, setStats] = useState({ approvedToday: 0, rejectedToday: 0 });

  // Fetch leaves from backend on mount
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaves');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  // Handle status update (Approve/Reject)
  const handleUpdateStatus = async (id, newStatus) => {
    // Add to processing set for loading state
    setProcessingIds(prev => new Set([...prev, id]));

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/leaves/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update status');
      }

      // Optimistic UI Update - update local state immediately
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );

      // Update stats
      if (newStatus === 'Approved') {
        setStats(prev => ({ ...prev, approvedToday: prev.approvedToday + 1 }));
        toast.success('Leave request approved!');
      } else if (newStatus === 'Rejected') {
        setStats(prev => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
        toast.error('Leave request rejected');
      }

    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.message || 'Failed to update leave status');
    } finally {
      // Remove from processing set
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleApprove = (id) => {
    handleUpdateStatus(id, 'Approved');
  };

  const handleReject = (id) => {
    handleUpdateStatus(id, 'Rejected');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Filter pending requests for the stats count
  const pendingRequests = requests.filter(req => req.status === 'Pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Approval Center</h1>
        <p className="text-muted-foreground mt-1">Review and manage leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{pendingRequests.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </div>
              <div className="bg-warning/10 text-warning p-3 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Today</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stats.approvedToday}</h3>
                <p className="text-xs text-muted-foreground mt-1">This session</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rejected Today</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{stats.rejectedToday}</h3>
                <p className="text-xs text-muted-foreground mt-1">This session</p>
              </div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            All Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading requests...</span>
            </div>
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      {/* Employee */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                              {getInitials(request.user_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{request.user_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">ID: {request.user_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4">
                        <Badge variant="outline">{request.leave_type}</Badge>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(request.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(request.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {getStatusBadge(request.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === 'Pending' ? (
                            <>
                              <Button
                                onClick={() => handleApprove(request.id)}
                                disabled={processingIds.has(request.id)}
                                size="sm"
                                className="bg-success hover:bg-success/90 text-white"
                              >
                                {processingIds.has(request.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                disabled={processingIds.has(request.id)}
                                variant="destructive"
                                size="sm"
                              >
                                {processingIds.has(request.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              {request.status === 'Approved' ? 'Approved' : 'Rejected'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Leave Requests</h3>
              <p className="text-muted-foreground">No leave requests found in the system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}