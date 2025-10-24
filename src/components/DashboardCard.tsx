import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function DashboardCard({ title, value, icon: Icon, change, changeType = 'neutral' }: DashboardCardProps) {
  const changeColor = {
    positive: 'text-accent',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <Card className="card-3d border-0 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full -mr-16 -mt-16"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm subheading text-muted-foreground">{title}</CardTitle>
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value}</div>
        {change && (
          <p className={`text-xs mt-2 ${changeColor} subheading`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}