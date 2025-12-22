import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: LucideIcon;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 p-8 transition-all duration-300 hover:-translate-y-1 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-3">{title}</p>
          <p className="text-4xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
            {value}
          </p>
          <p className={`text-sm font-bold flex items-center ${
            changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            <span className="mr-1 text-lg">
              {changeType === 'increase' ? '↗' : '↘'}
            </span>
            {change}
          </p>
        </div>
        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;