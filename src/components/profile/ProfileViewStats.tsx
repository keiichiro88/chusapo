import React from 'react';
import { Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { useProfileViews } from '../../hooks/useProfileViews';

interface ProfileViewStatsProps {
  userId: string;
}

const ProfileViewStats: React.FC<ProfileViewStatsProps> = ({ userId }) => {
  const { getProfileViewStats, getDailyViewCounts } = useProfileViews();
  
  const stats = getProfileViewStats(userId);
  const dailyCounts = getDailyViewCounts(userId, 7); // 過去7日間

  const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* 閲覧統計サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">今日</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
          <div className="text-xs text-blue-700">閲覧者</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">今週</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
          <div className="text-xs text-green-700">閲覧者</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">今月</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
          <div className="text-xs text-purple-700">閲覧者</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">累計</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
          <div className="text-xs text-orange-700">閲覧者</div>
        </div>
      </div>

      {/* 過去7日間のチャート */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">過去7日間の閲覧数</h3>
        </div>
        
        <div className="space-y-3">
          {dailyCounts.map((day, index) => {
            const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('ja-JP', { 
              month: 'short', 
              day: 'numeric',
              weekday: 'short'
            });

            return (
              <div key={day.date} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-600 text-right">
                  {dayName}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  >
                    {day.count > 0 && (
                      <span className="text-white text-xs font-medium">
                        {day.count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-8 text-sm text-gray-500 text-center">
                  {day.count}
                </div>
              </div>
            );
          })}
        </div>

        {stats.thisWeek === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>過去7日間の閲覧はありませんでした</p>
            <p className="text-sm mt-1">プロフィールを充実させて注目度を高めましょう！</p>
          </div>
        )}
      </div>

      {/* プライバシー情報 */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <Eye className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">プライバシーについて</p>
            <p className="leading-relaxed">
              閲覧者の個人情報は保護されています。誰があなたのプロフィールを見たかは表示されません。
              表示されるのは閲覧数のみです。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewStats;