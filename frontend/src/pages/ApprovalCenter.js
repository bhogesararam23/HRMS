import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { CheckCircle, XCircle, Clock, FileText, Calendar, User } from 'lucide-react';
import { getPendingApprovals } from '../data/mockData';
import { toast } from 'sonner';

export default function ApprovalCenter() {
  const [requests, setRequests] = useState(getPendingApprovals());

  const handleApprove = (id) => {
    setRequests(requests.filter(req => req.id !== id));
    toast.success('Leave request approved!');
  };

  const handleReject = (id) => {
    setRequests(requests.filter(req => req.id !== id));
    toast.error('Leave request rejected');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

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
                <h3 className="text-3xl font-bold text-foreground mt-2">{requests.length}</h3>
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
                <h3 className="text-3xl font-bold text-foreground mt-2">0</h3>
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
                <h3 className="text-3xl font-bold text-foreground mt-2">0</h3>
                <p className="text-xs text-muted-foreground mt-1">This session</p>
              </div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            Pending Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id}
                  className="p-6 border border-border rounded-xl hover:shadow-md transition-all bg-gradient-to-r from-accent/50 to-transparent"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Employee Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium text-base">
                          {getInitials(request.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{request.employeeName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {request.employeeId}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{request.type}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{request.days} days</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' '}→{' '}
                              {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">Reason:</span> {request.reason}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Applied on {new Date(request.appliedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[200px]">
                      <Button 
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-success hover:bg-success/90 text-white"
                        size="lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(request.id)}
                        variant="destructive"
                        className="flex-1"
                        size="lg"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending leave requests to review</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}