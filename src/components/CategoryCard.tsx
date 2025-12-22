import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  questionCount: number;
  color: string;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  questionCount, 
  color,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start space-x-5">
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-semibold">
              {questionCount}件の質問
            </span>
            <span className="text-blue-600 font-bold group-hover:underline transition-all duration-200">
              参照する →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;