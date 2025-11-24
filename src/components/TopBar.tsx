import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { NotificationsPanel } from './admin/NotificationsPanel';
import type { User } from '../App';

interface TopBarProps {
  user: User;
  title: string;
}

export function TopBar({ user, title }: TopBarProps) {
  return (
    <div className="h-16 border-b border-border/30 flex items-center justify-between px-6 relative backdrop-blur-sm"
         style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,252,255,0.95) 100%)'}}>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <NotificationsPanel />
        
        <div className="flex items-center space-x-3">
          <div className="card-3d-sm p-0.5 rounded-full" style={{background: 'linear-gradient(135deg, #0D47A1 0%, #2196F3 100%)'}}>
            <Avatar className="border-2 border-white">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}