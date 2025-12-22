import React from 'react';
import { Award, Shield, Crown } from 'lucide-react';
import { UserAchievement } from '../types';

interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: 'small' | 'medium' | 'large';
  showTitle?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'medium',
  showTitle = true 
}) => {
  // サイズ設定
  const sizeConfig = {
    small: {
      container: 'h-8 w-8',
      icon: 'h-4 w-4',
      text: 'text-xs'
    },
    medium: {
      container: 'h-12 w-12',
      icon: 'h-6 w-6',
      text: 'text-sm'
    },
    large: {
      container: 'h-16 w-16',
      icon: 'h-8 w-8',
      text: 'text-base'
    }
  };

  // レベル別の色設定
  const levelConfig = {
    bronze: {
      bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
      text: 'text-amber-800',
      shadow: 'shadow-amber-200'
    },
    silver: {
      bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
      text: 'text-gray-800',
      shadow: 'shadow-gray-200'
    },
    gold: {
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      text: 'text-yellow-800',
      shadow: 'shadow-yellow-200'
    },
    platinum: {
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      text: 'text-purple-800',
      shadow: 'shadow-purple-200'
    }
  };

  // アイコンの選択
  const getIcon = () => {
    switch (achievement.achievementType) {
      case 'badge':
        return Award;
      case 'shield':
        return Shield;
      case 'crown':
        return Crown;
      default:
        return Award;
    }
  };

  const Icon = getIcon();
  const sizeStyle = sizeConfig[size];
  const levelStyle = levelConfig[achievement.level];

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* バッジアイコン */}
      <div 
        className={`
          ${sizeStyle.container} 
          ${levelStyle.bg} 
          ${levelStyle.shadow}
          rounded-xl flex items-center justify-center shadow-lg
          transform hover:scale-105 transition-transform duration-200
        `}
        title={`${achievement.title} (感謝数: ${achievement.gratitudeCount})`}
      >
        <Icon className={`${sizeStyle.icon} text-white`} />
      </div>
      
      {/* 称号テキスト */}
      {showTitle && (
        <div className="text-center">
          <p className={`font-bold ${levelStyle.text} ${sizeStyle.text} leading-tight`}>
            {achievement.title}
          </p>
          <p className="text-gray-500 text-xs">
            感謝 {achievement.gratitudeCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;