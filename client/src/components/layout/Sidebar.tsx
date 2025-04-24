import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  CreditCard,
  FileBarChart,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: 'Empréstimos',
    href: '/loans',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    name: 'Mutuários',
    href: '/borrowers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: 'Pagamentos',
    href: '/payments',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: <FileBarChart className="h-5 w-5" />,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location === path;
    }
    return location.startsWith(path);
  };
  
  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <span className="text-xl font-semibold text-primary-600">LoanBuddy</span>
        </div>
        <nav className="flex-1 px-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                isActive(item.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive(item.href)
                    ? "text-primary-500"
                    : "text-slate-400 group-hover:text-slate-500"
                )}
              >
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
  
  // Mobile Header
  const MobileHeader = () => (
    <div className="md:hidden bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold text-primary-700">LoanBuddy</span>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-600"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
  
  // Mobile Sidebar
  const MobileSidebar = () => (
    <div className={cn("fixed inset-0 z-40", mobileSidebarOpen ? "block" : "hidden")}>
      <div 
        className="fixed inset-0 bg-slate-600 bg-opacity-75" 
        aria-hidden="true"
        onClick={toggleMobileSidebar}
      />
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={toggleMobileSidebar}
          >
            <span className="sr-only">Fechar menu</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4 mb-5">
            <span className="text-xl font-bold text-primary-700">LoanBuddy</span>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-base font-medium rounded-md",
                  isActive(item.href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={toggleMobileSidebar}
              >
                <div
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive(item.href)
                      ? "text-primary-500"
                      : "text-slate-400"
                  )}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );
  
  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
      <MobileSidebar />
    </>
  );
}
