import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp,
  Calendar,
  Award,
  HandHeart,
  Users,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AchievementBadge from './AchievementBadge';
import { useUser } from '../hooks/useUser';
import { useGratitude } from '../hooks/useGratitude';

interface MonthlyRankingProps {
  onBack: () => void;
}

interface RankedUser {
  id: string;
  name: string;
  role: string;
  totalGratitude: number;
  monthlyGratitude: number;
  currentTitle: string;
  rank: number;
  change: 'up' | 'down' | 'same' | 'new';
}

const MonthlyRanking: React.FC<MonthlyRankingProps> = ({ onBack }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-06');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  const { users } = useUser();
  const { gratitudes, getUserGratitudeCount, getUserAchievements } = useGratitude();

  // 月間感謝数を計算する関数
  const getMonthlyGratitudeCount = (userId: string, month: string) => {
    const [year, monthNum] = month.split('-');
    return gratitudes.filter(g => {
      const gratitudeDate = new Date(g.createdAt);
      return g.toUserId === userId && 
             gratitudeDate.getFullYear() === parseInt(year) &&
             gratitudeDate.getMonth() === parseInt(monthNum) - 1;
    }).length;
  };

  // ランキングデータを生成
  const rankingData = useMemo(() => {
    let rankedUsers: RankedUser[] = users.map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      totalGratitude: getUserGratitudeCount(user.id),
      monthlyGratitude: getMonthlyGratitudeCount(user.id, selectedMonth),
      currentTitle: user.currentTitle || '',
      rank: 0,
      change: 'same' as const
    }));

    // 月間感謝数でソート
    rankedUsers.sort((a, b) => b.monthlyGratitude - a.monthlyGratitude);
    
    // ランクを設定
    rankedUsers.forEach((user, index) => {
      user.rank = index + 1;
    });

    // 職種でフィルタリング
    if (filterRole !== 'all') {
      rankedUsers = rankedUsers.filter(user => 
        user.role.toLowerCase().includes(filterRole.toLowerCase())
      );
    }

    return rankedUsers;
  }, [users, selectedMonth, filterRole, gratitudes, getUserGratitudeCount]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-500';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const monthOptions = [
    { value: '2024-06', label: '2024年6月' },
    { value: '2024-05', label: '2024年5月' },
    { value: '2024-04', label: '2024年4月' },
    { value: '2024-03', label: '2024年3月' },
  ];

  const roleOptions = [
    { value: 'all', label: '全職種' },
    { value: '医師', label: '医師' },
    { value: '看護師', label: '看護師' },
    { value: '技師', label: '技師' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">ホームに戻る</span>
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">月間ランキング</h1>
          <p className="text-gray-600">感謝数に基づく月間貢献者ランキングです</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <HandHeart className="h-4 w-4" />
            <span>感謝数ベース</span>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">対象月:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">職種:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* トップ3表彰台 */}
      {rankingData.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">今月のトップ貢献者</h2>
          
          <div className="flex items-end justify-center space-x-4">
            {/* 2位 */}
            {rankingData[1] && (
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 mb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Medal className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{rankingData[1].name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rankingData[1].role}</p>
                  <div className="flex items-center justify-center space-x-1 text-gray-700">
                    <HandHeart className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold">{rankingData[1].monthlyGratitude}</span>
                  </div>
                </div>
                <div className="h-20 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-black text-white">2</span>
                </div>
              </div>
            )}
            
            {/* 1位 */}
            {rankingData[0] && (
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-yellow-300 mb-4">
                  <div className="h-20 w-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">{rankingData[0].name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rankingData[0].role}</p>
                  {rankingData[0].currentTitle && (
                    <p className="text-xs text-yellow-600 font-bold mb-2">{rankingData[0].currentTitle}</p>
                  )}
                  <div className="flex items-center justify-center space-x-1 text-gray-700">
                    <HandHeart className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-lg">{rankingData[0].monthlyGratitude}</span>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-black text-white">1</span>
                </div>
              </div>
            )}
            
            {/* 3位 */}
            {rankingData[2] && (
              <div className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200 mb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{rankingData[2].name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rankingData[2].role}</p>
                  <div className="flex items-center justify-center space-x-1 text-gray-700">
                    <HandHeart className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold">{rankingData[2].monthlyGratitude}</span>
                  </div>
                </div>
                <div className="h-16 bg-gradient-to-t from-amber-400 to-amber-300 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-black text-white">3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 全ランキングリスト */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">完全ランキング</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{rankingData.length}名のユーザー</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {rankingData.map((user) => (
            <div key={user.id} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 ${getRankBgColor(user.rank)} rounded-xl flex items-center justify-center`}>
                    {user.rank <= 3 ? (
                      getRankIcon(user.rank)
                    ) : (
                      <span className="text-white font-bold">{user.rank}</span>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900">{user.name}</h3>
                      {user.currentTitle && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                          {user.currentTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <HandHeart className="h-4 w-4" />
                      <span className="font-bold">{user.monthlyGratitude}</span>
                    </div>
                    <p className="text-xs text-gray-500">今月の感謝</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{user.totalGratitude}</p>
                    <p className="text-xs text-gray-500">累計感謝</p>
                  </div>
                  
                  <button
                    onClick={() => setShowDetails(showDetails === user.id ? null : user.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors"
                  >
                    {showDetails === user.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* 詳細表示 */}
              {showDetails === user.id && (
                <div className="ml-16 p-4 bg-white border border-gray-200 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">獲得バッジ</h4>
                  <div className="flex flex-wrap gap-2">
                    {getUserAchievements(user.id).map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        type={achievement.achievementType}
                        level={achievement.level}
                        title={achievement.title}
                        size="sm"
                      />
                    ))}
                    {getUserAchievements(user.id).length === 0 && (
                      <p className="text-gray-500 text-sm">まだバッジを獲得していません</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {rankingData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              該当するユーザーがいません
            </h3>
            <p className="text-gray-500">
              選択した条件でランキングデータが見つかりませんでした
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyRanking;