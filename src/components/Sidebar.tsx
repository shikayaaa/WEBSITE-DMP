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
  FileText,
  Contact
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'sonner';
import logoImage from '../assets/dmplogofinal.png';

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
    { id: 'deeds', label: 'Deed of Sale', icon: FileText },
    { id: 'interments', label: 'Interments & Scheduling', icon: Calendar },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'contacts', label: 'Contacts', icon: Contact },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'lots', label: 'Lots', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'preneed', label: 'Pre-Need Purchase', icon: ShoppingCart },
    { id: 'deeds', label: 'Deed of Sale', icon: FileText },
    { id: 'interments', label: 'Interments', icon: Calendar },
    { id: 'support', label: 'Client Support', icon: HeadphonesIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : staffMenuItems;

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        // Update user document with logout timestamp
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastLogout: serverTimestamp(),
            lastActive: serverTimestamp(),
          });
        } catch (updateError) {
          console.error('Error updating logout timestamp:', updateError);
        }
      }

      // Sign out from Firebase
      await signOut(auth);
      
      toast.success('Logged out successfully');
      
      // Call parent onLogout
      onLogout();
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="w-64 sidebar-3d border-0 h-screen flex flex-col relative">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none"></div>
      
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {/* Logo Image */}
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img 
              src={logoImage} 
              alt="Dumaguete Memorial Park Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
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
          onClick={handleLogout}
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