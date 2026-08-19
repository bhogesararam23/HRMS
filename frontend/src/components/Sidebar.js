import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  CheckCircle,
  Building2,
  Menu,
  X,
  BookOpen,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['employee', 'admin'] },
    { icon: Calendar, label: 'Attendance', path: '/attendance', roles: ['employee', 'admin'] },
    { icon: FileText, label: 'Leaves', path: '/leaves', roles: ['employee', 'admin'] },
    { icon: DollarSign, label: 'Payroll', path: '/payroll', roles: ['employee', 'admin'] },
    { icon: Users, label: 'Employees', path: '/employees', roles: ['admin'] },
    { icon: CheckCircle, label: 'Approvals', path: '/approvals', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(isAdmin ? 'admin' : 'employee')
  );

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HRMS</h1>
                <p className="text-xs text-muted-foreground">Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${active 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${
                    active ? '' : 'group-hover:scale-110 transition-transform'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="px-4 py-3 bg-accent rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-foreground">
                  {isAdmin ? 'Admin Access' : 'Employee Portal'}
                </p>
                <span className="text-[10px] bg-primary/10 text-primary font-mono px-1.5 py-0.5 rounded">v1.0.0</span>
              </div>
              <p className="text-[11px] text-muted-foreground">NexusHR Enterprise System</p>
            </div>

            {/* Live API Documentation links */}
            <div className="pt-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-semibold px-2 mb-1.5">
                Developer API
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <a
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent/80 py-1.5 px-2 rounded-md transition-colors border border-border"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Swagger</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
                <a
                  href="/redoc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-accent/80 py-1.5 px-2 rounded-md transition-colors border border-border"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ReDoc</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}