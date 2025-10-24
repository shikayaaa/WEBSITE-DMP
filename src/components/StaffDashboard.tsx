import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StaffDashboardOverview } from './staff/StaffDashboardOverview';
import { StaffLots } from './staff/StaffLots';
import { StaffPayments } from './staff/StaffPayments';
import { StaffPreNeed } from './staff/StaffPreNeed';
import { StaffDeedOfSales } from './staff/StaffDeedOfSales';
import { StaffInterments } from './staff/StaffInterments';
import { ClientSupport } from './staff/ClientSupport';
import { StaffSettings } from './staff/StaffSettings';
import type { User } from '../App';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      lots: 'Lots',
      payments: 'Payments',
      preneed: 'Pre-Need Purchase',
      deeds: 'Deed of Sales',
      interments: 'Interments',
      support: 'Client Support',
      settings: 'Settings'
    };
    return titles[currentPage as keyof typeof titles] || 'Dashboard';
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <StaffDashboardOverview />;
      case 'lots':
        return <StaffLots />;
      case 'payments':
        return <StaffPayments />;
      case 'preneed':
        return <StaffPreNeed />;
      case 'deeds':
        return <StaffDeedOfSales />;
      case 'interments':
        return <StaffInterments />;
      case 'support':
        return <ClientSupport />;
      case 'settings':
        return <StaffSettings />;
      default:
        return <StaffDashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        userRole="staff"
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