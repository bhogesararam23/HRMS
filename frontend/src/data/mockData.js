// Mock Data for HRMS Dashboard

export const employees = [
  {
    id: 'EMP001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    joinDate: '2021-03-15',
    salary: 95000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff'
  },
  {
    id: 'EMP002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    joinDate: '2020-08-22',
    salary: 78000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff'
  },
  {
    id: 'EMP003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    department: 'Human Resources',
    position: 'HR Specialist',
    joinDate: '2022-01-10',
    salary: 62000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=8b5cf6&color=fff'
  },
  {
    id: 'EMP004',
    name: 'David Park',
    email: 'david.park@company.com',
    department: 'Sales',
    position: 'Sales Representative',
    joinDate: '2021-11-05',
    salary: 68000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=David+Park&background=f59e0b&color=fff'
  },
  {
    id: 'EMP005',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    joinDate: '2022-06-20',
    salary: 82000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Jessica+Taylor&background=ec4899&color=fff'
  },
  {
    id: 'EMP006',
    name: 'Robert Williams',
    email: 'robert.williams@company.com',
    department: 'Finance',
    position: 'Financial Analyst',
    joinDate: '2020-05-12',
    salary: 72000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Williams&background=14b8a6&color=fff'
  },
  {
    id: 'EMP007',
    name: 'Amanda Lee',
    email: 'amanda.lee@company.com',
    department: 'Design',
    position: 'UX Designer',
    joinDate: '2021-09-18',
    salary: 76000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Amanda+Lee&background=6366f1&color=fff'
  },
  {
    id: 'EMP008',
    name: 'James Brown',
    email: 'james.brown@company.com',
    department: 'Operations',
    position: 'Operations Manager',
    joinDate: '2019-12-03',
    salary: 88000,
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=James+Brown&background=ef4444&color=fff'
  }
];

export const attendanceRecords = [
  { id: 1, employeeId: 'EMP001', date: '2025-05-01', checkIn: '08:45', checkOut: '17:30', status: 'Present', hours: 8.75 },
  { id: 2, employeeId: 'EMP001', date: '2025-05-02', checkIn: '08:50', checkOut: '17:35', status: 'Present', hours: 8.75 },
  { id: 3, employeeId: 'EMP001', date: '2025-05-05', checkIn: '09:00', checkOut: '17:45', status: 'Present', hours: 8.75 },
  { id: 4, employeeId: 'EMP001', date: '2025-05-06', checkIn: '08:40', checkOut: '17:25', status: 'Present', hours: 8.75 },
  { id: 5, employeeId: 'EMP001', date: '2025-05-07', checkIn: '08:55', checkOut: '17:40', status: 'Present', hours: 8.75 },
  { id: 6, employeeId: 'EMP001', date: '2025-05-08', checkIn: '08:48', checkOut: '17:33', status: 'Present', hours: 8.75 },
  { id: 7, employeeId: 'EMP001', date: '2025-05-09', checkIn: '08:52', checkOut: '17:38', status: 'Present', hours: 8.75 },
  { id: 8, employeeId: 'EMP001', date: '2025-05-12', checkIn: '', checkOut: '', status: 'Absent', hours: 0 },
  { id: 9, employeeId: 'EMP001', date: '2025-05-13', checkIn: '08:47', checkOut: '17:32', status: 'Present', hours: 8.75 },
  { id: 10, employeeId: 'EMP001', date: '2025-05-14', checkIn: '08:55', checkOut: '17:40', status: 'Present', hours: 8.75 }
];

export const leaveRequests = [
  {
    id: 'LR001',
    employeeId: 'EMP001',
    employeeName: 'Sarah Johnson',
    type: 'Vacation',
    startDate: '2025-06-15',
    endDate: '2025-06-20',
    days: 6,
    reason: 'Family vacation',
    status: 'Approved',
    appliedOn: '2025-05-01',
    approvedBy: 'admin@company.com'
  },
  {
    id: 'LR002',
    employeeId: 'EMP002',
    employeeName: 'Michael Chen',
    type: 'Sick Leave',
    startDate: '2025-05-20',
    endDate: '2025-05-21',
    days: 2,
    reason: 'Medical appointment',
    status: 'Pending',
    appliedOn: '2025-05-14'
  },
  {
    id: 'LR003',
    employeeId: 'EMP003',
    employeeName: 'Emily Rodriguez',
    type: 'Personal Leave',
    startDate: '2025-05-28',
    endDate: '2025-05-28',
    days: 1,
    reason: 'Personal matter',
    status: 'Pending',
    appliedOn: '2025-05-13'
  },
  {
    id: 'LR004',
    employeeId: 'EMP005',
    employeeName: 'Jessica Taylor',
    type: 'Vacation',
    startDate: '2025-07-01',
    endDate: '2025-07-10',
    days: 10,
    reason: 'Summer vacation',
    status: 'Approved',
    appliedOn: '2025-04-28',
    approvedBy: 'admin@company.com'
  },
  {
    id: 'LR005',
    employeeId: 'EMP007',
    employeeName: 'Amanda Lee',
    type: 'Sick Leave',
    startDate: '2025-05-16',
    endDate: '2025-05-17',
    days: 2,
    reason: 'Flu',
    status: 'Approved',
    appliedOn: '2025-05-15',
    approvedBy: 'admin@company.com'
  }
];

export const payrollData = {
  employeeId: 'EMP001',
  employeeName: 'Sarah Johnson',
  month: 'May 2025',
  basicSalary: 95000,
  allowances: {
    housing: 12000,
    transport: 5000,
    meal: 3000
  },
  deductions: {
    tax: 18500,
    insurance: 4500,
    pension: 9500
  },
  netSalary: 82500,
  paymentDate: '2025-05-25',
  paymentMethod: 'Bank Transfer'
};

export const holidays = [
  { id: 1, name: 'Memorial Day', date: '2025-05-26', type: 'Public Holiday' },
  { id: 2, name: 'Independence Day', date: '2025-07-04', type: 'Public Holiday' },
  { id: 3, name: 'Labor Day', date: '2025-09-01', type: 'Public Holiday' },
  { id: 4, name: 'Thanksgiving', date: '2025-11-27', type: 'Public Holiday' },
  { id: 5, name: 'Christmas', date: '2025-12-25', type: 'Public Holiday' }
];

export const attendanceTrends = [
  { date: 'May 8', present: 245, absent: 15, late: 8 },
  { date: 'May 9', present: 252, absent: 8, late: 5 },
  { date: 'May 12', present: 248, absent: 12, late: 6 },
  { date: 'May 13', present: 255, absent: 5, late: 4 },
  { date: 'May 14', present: 250, absent: 10, late: 7 },
  { date: 'May 15', present: 258, absent: 2, late: 3 },
  { date: 'Today', present: 254, absent: 6, late: 5 }
];

// Helper functions
export const getEmployeeById = (id) => {
  return employees.find(emp => emp.id === id);
};

export const getLeaveBalance = (employeeId) => {
  const usedDays = leaveRequests
    .filter(req => req.employeeId === employeeId && req.status === 'Approved')
    .reduce((sum, req) => sum + req.days, 0);
  return 30 - usedDays; // Total 30 days annual leave
};

export const getPendingApprovals = () => {
  return leaveRequests.filter(req => req.status === 'Pending');
};

export const getTotalPayroll = () => {
  return employees.reduce((sum, emp) => sum + emp.salary, 0);
};

export const getOnLeaveToday = () => {
  const today = new Date();
  return leaveRequests.filter(req => {
    if (req.status !== 'Approved') return false;
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    return today >= start && today <= end;
  }).length;
};

export const getAttendancePercentage = (employeeId) => {
  const records = attendanceRecords.filter(rec => rec.employeeId === employeeId);
  const presentDays = records.filter(rec => rec.status === 'Present').length;
  return Math.round((presentDays / records.length) * 100);
};