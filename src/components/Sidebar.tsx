import React from 'react';
import { 
  Home, 
  Users, 
  MapPin, 
  CreditCard, 
  Calendar, 
  BarChart3, 
  Settings,
  HeadphonesIcon,
  LogOut,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface SidebarProps {
  userRole: 'admin' | 'staff';
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function Sidebar({ userRole, currentPage, onPageChange, onLogout }: SidebarProps) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'lots', label: 'Lots', icon: MapPin },
    { id: 'payments', label: 'Payments & Contracts', icon: CreditCard },
    { id: 'preneed', label: 'Pre-Need Purchase', icon: ShoppingCart },
    { id: 'deeds', label: 'Deed of Sales', icon: FileText },
    { id: 'interments', label: 'Interments & Scheduling', icon: Calendar },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'lots', label: 'Lots', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'preneed', label: 'Pre-Need Purchase', icon: ShoppingCart },
    { id: 'deeds', label: 'Deed of Sales', icon: FileText },
    { id: 'interments', label: 'Interments', icon: Calendar },
    { id: 'support', label: 'Client Support', icon: HeadphonesIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : staffMenuItems;

  return (
    <div className="w-64 sidebar-3d border-0 h-screen flex flex-col relative">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none"></div>
      
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg" 
               style={{background: 'linear-gradient(135deg, #00B8F4 0%, #2DF2A3 100%)'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
            <div className="w-5 h-5 bg-white rounded-sm relative z-10"></div>
          </div>
          <div>
            <h2 className="font-semibold text-white heading">Dumaguete Memorial</h2>
            <p className="text-xs text-white/70 capitalize">{userRole} Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="relative z-10 flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10",
                isActive && "bg-gradient-to-r from-secondary/30 to-accent/20 text-white shadow-lg hover:from-secondary/40 hover:to-accent/30 border border-white/20"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <div className={cn("p-1.5 rounded-lg", isActive && "bg-white/20")}>
                <Icon className="h-4 w-4" />
              </div>
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="relative z-10 p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/20 transition-all duration-200"
          onClick={onLogout}
        >
          <div className="p-1.5 rounded-lg">
            <LogOut className="h-4 w-4" />
          </div>
          Logout
        </Button>
      </div>
    </div>
  );
}