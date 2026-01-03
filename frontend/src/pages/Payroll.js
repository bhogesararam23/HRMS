import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Download, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Payroll() {
  const { authFetch, user } = useAuth();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const response = await authFetch('/payroll/me');
      if (response.ok) {
        const data = await response.json();
        setPayroll(data);
      }
    } catch (error) {
      console.error('Payroll error:', error);
      toast.error('Failed to load payroll details');
    } finally {
      setLoading(false);
    }
  };

  // Indian Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payroll) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">Salary slip for {payroll.month}</p>
        </div>
        <Button size="lg" onClick={() => toast.success("Payslip downloaded!")}>
          <Download className="w-5 h-5 mr-2" />
          Download Payslip
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Base Salary</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">{formatCurrency(payroll.base_salary)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
            <h3 className="text-3xl font-bold text-destructive mt-2">-{formatCurrency(payroll.tax + payroll.deductions)}</h3>
            <p className="text-xs text-muted-foreground mt-1">Tax + Any Leaves ({payroll.absent_days} absent days)</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Net Salary</p>
            <h3 className="text-3xl font-bold text-success mt-2">{formatCurrency(payroll.net_salary)}</h3>
            <p className="text-xs text-muted-foreground mt-1">Cash in hand</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between p-3 bg-accent rounded">
            <span>Base Salary</span>
            <span className="font-bold">{formatCurrency(payroll.base_salary)}</span>
          </div>
          <div className="flex justify-between p-3">
            <span>Tax (12%)</span>
            <span className="text-destructive">-{formatCurrency(payroll.tax)}</span>
          </div>
          <div className="flex justify-between p-3">
            <span>Unpaid Leave Deductions ({payroll.absent_days} days)</span>
            <span className="text-destructive">-{formatCurrency(payroll.deductions)}</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
            <span>Net Payable</span>
            <span className="text-success">{formatCurrency(payroll.net_salary)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}