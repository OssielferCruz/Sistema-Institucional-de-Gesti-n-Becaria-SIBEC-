import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = '#2E7D32',
  onClick
}) => {
  return (
    <Card 
      className={`bg-white border-none shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:scale-105 hover:border-[#2E7D32] border-2 border-transparent' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-bold text-[#424242]">{value}</p>
            {trend && (
              <p className={`text-sm mt-2 ${trend.isPositive ? 'text-[#1B5E20]' : 'text-[#D32F2F]'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
            {onClick && (
              <p className="text-xs text-[#2E7D32] mt-2 font-medium">
                👁️ Clic para ver detalles
              </p>
            )}
          </div>
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};