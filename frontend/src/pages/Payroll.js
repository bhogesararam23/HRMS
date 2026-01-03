import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DollarSign, Download, Calendar } from 'lucide-react';
import { payrollData } from '../data/mockData';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Payroll() {
  const handleDownload = () => {
    toast.success('Payslip downloaded successfully!');
  };

  const totalAllowances = Object.values(payrollData.allowances).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(payrollData.deductions).reduce((sum, val) => sum + val, 0);
  const grossSalary = payrollData.basicSalary + totalAllowances;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">View your salary details and payslips</p>
        </div>
        <Button onClick={handleDownload} size="lg">
          <Download className="w-5 h-5 mr-2" />
          Download Payslip
        </Button>
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Salary</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">
                  ${grossSalary.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Before deductions</p>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deductions</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">
                  ${totalDeductions.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Tax + Insurance + Pension</p>
              </div>
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Salary</p>
                <h3 className="text-3xl font-bold text-success mt-2">
                  ${payrollData.netSalary.toLocaleString()}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Take home pay</p>
              </div>
              <div className="bg-success/20 text-success p-3 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payslip Details */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Payslip for {payrollData.month}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Employee: {payrollData.employeeName} ({payrollData.employeeId})
              </p>
            </div>
            <Badge className="text-sm px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              Paid on {new Date(payrollData.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-2 h-6 bg-success rounded-full mr-2"></div>
                Earnings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                  <span className="text-sm font-medium">Basic Salary</span>
                  <span className="text-sm font-bold">${payrollData.basicSalary.toLocaleString()}</span>
                </div>
                {Object.entries(payrollData.allowances).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <span className="text-sm font-medium capitalize">{key} Allowance</span>
                    <span className="text-sm font-bold">${value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-t-2 border-primary mt-4">
                  <span className="text-sm font-bold">Total Earnings</span>
                  <span className="text-base font-bold text-primary">${grossSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <div className="w-2 h-6 bg-destructive rounded-full mr-2"></div>
                Deductions
              </h3>
              <div className="space-y-3">
                {Object.entries(payrollData.deductions).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-destructive/5 rounded-lg">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className="text-sm font-bold text-destructive">-${value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg border-t-2 border-destructive mt-4">
                  <span className="text-sm font-bold">Total Deductions</span>
                  <span className="text-base font-bold text-destructive">-${totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-success/20 to-success/10 rounded-xl border-2 border-success/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Net Salary (Take Home)</p>
                <p className="text-xs text-muted-foreground">Payment Method: {payrollData.paymentMethod}</p>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-bold text-success">
                  ${payrollData.netSalary.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This is a computer-generated payslip and does not require a signature. 
              For any queries, please contact the HR department.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}