import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AdminDashboardOverview } from './admin/AdminDashboardOverview';
import { UserManagement } from './admin/UserManagement';
import { LotsManagement } from './admin/LotsManagement';
import { PaymentsContracts } from './admin/PaymentsContracts';
import { PreNeedPurchase } from './admin/PreNeedPurchase';
import { DeedOfSales } from './admin/DeedOfSale';
import { IntermentScheduling } from './admin/IntermentScheduling';
import { ReportsAnalytics } from './admin/ReportsAnalytics';
import { SettingsPage } from './admin/SettingsPage';
import { ContactsManagement } from './admin/ContactsManagement';
import type { User } from '../App';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'User Management',
      lots: 'Lots Management',
      payments: 'Payments & Contracts',
      preneed: 'Pre-Need Purchase',
      deeds: 'Deed of Sale',
      interments: 'Interments & Scheduling',
      reports: 'Reports & Analytics',
      contacts: 'Contacts',
      settings: 'Settings'
    };
    return titles[currentPage as keyof typeof titles] || 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'lots':
        return <LotsManagement />;
      case 'payments':
        return <PaymentsContracts />;
      case 'preneed':
        return <PreNeedPurchase />;
      case 'deeds':
        return <DeedOfSales />;
      case 'interments':
        return <IntermentScheduling />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'contacts':
        return <ContactsManagement />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        userRole="admin"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-background/50 to-accent/10">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}