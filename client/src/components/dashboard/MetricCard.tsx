import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  iconBgColor?: string;
}

export default function MetricCard({
  title,
  value,
  trend,
  icon,
  iconBgColor = 'bg-primary-50',
}: MetricCardProps) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-semibold mt-1 text-slate-900">{value}</h3>
            
            {trend && (
              <span 
                className={cn(
                  "inline-flex items-center text-xs font-medium mt-2",
                  {
                    'text-green-600': trend.direction === 'up',
                    'text-red-600': trend.direction === 'down',
                    'text-slate-500': trend.direction === 'neutral',
                  }
                )}
              >
                {trend.direction === 'up' && <ArrowUp className="mr-1 h-3 w-3" />}
                {trend.direction === 'down' && <ArrowDown className="mr-1 h-3 w-3" />}
                {trend.value}
              </span>
            )}
          </div>
          
          <div className={cn("p-2 rounded-md", iconBgColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
