import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Search, Users, Eye, Mail, Briefcase } from 'lucide-react';
import { employees } from '../data/mockData';

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', ...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

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
        <h1 className="text-3xl font-bold text-foreground">Employees</h1>
        <p className="text-muted-foreground mt-1">Manage your workforce</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{employees.length}</h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{departments.length - 1}</h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">
                  {employees.filter(e => e.status === 'Active').length}
                </h3>
              </div>
              <div className="bg-success/10 text-success p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Salary</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">
                  ${Math.round(employees.reduce((sum, e) => sum + e.salary, 0) / employees.length / 1000)}K
                </h3>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {departments.map(dept => (
                <Button
                  key={dept}
                  variant={selectedDept === dept ? 'default' : 'outline'}
                  onClick={() => setSelectedDept(dept)}
                  size="sm"
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Position</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Join Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{employee.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium">{employee.position}</p>
                      <p className="text-xs text-muted-foreground">{employee.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{employee.department}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm">
                        {new Date(employee.joinDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-success/20 text-success border-success/30">
                        {employee.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}