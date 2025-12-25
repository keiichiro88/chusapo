import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Settings, 
  Camera, 
  Shield, 
  Star,
  MessageCircle,
  Heart,
  BarChart3,
  ArrowLeft,
  Eye,
  CheckCircle,
  UserPlus,
  UserMinus,
  Users,
  Lock,
  X,
  Loader2
} from 'lucide-react';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { useMultipleProfiles } from '../../hooks/useMultipleProfiles';
import { useGratitude } from '../../hooks/useGratitude';
import { useUser } from '../../hooks/useUser';
import { useDataProvider } from '../../hooks/useDataProvider';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useFollows, FollowUser } from '../../hooks/useFollows';
import { supabase } from '../../lib/supabase';
import AchievementBadge from '../AchievementBadge';
import SocialLinks from '../SocialLinks';

interface UserProfileProps {
  userId?: string;
  userName?: string;
  onBack?: () => void;
  onEditProfile?: () => void;
  onQuestionSelect?: (questionId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId: propUserId, userName, onBack, onEditProfile, onQuestionSelect }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(propUserId);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { getUserProfile } = useMultipleProfiles();
  const { getUserGratitudeCount, getUserTopTitle, getUserAchievements } = useGratitude();
  const { users } = useUser();
  const { questions, isAuthenticated } = useDataProvider();
  const { user: supabaseUser } = useSupabaseAuth();
  
  // 認証ユーザー情報を渡してプロフィール設定を取得
  const authUserInfo = supabaseUser ? { id: supabaseUser.id, name: supabaseUser.name, role: supabaseUser.role } : null;
  const { settings } = useProfileSettings(authUserInfo);

  // ユーザー名からプロフィールを取得（Supabase）
  useEffect(() => {
    const fetchProfileByName = async () => {
      // 自分のプロフィールの場合
      if (!userName || (supabaseUser && userName === supabaseUser.name)) {
        setTargetUserId(supabaseUser?.id);
        setTargetProfile(null);
        return;
      }

      // 他のユーザーのプロフィールを取得
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('name', userName)
          .maybeSingle();

        if (error) {
          console.error('Profile fetch error:', error);
          return;
        }

        if (data) {
          setTargetUserId(data.id);
          setTargetProfile(data);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileByName();
  }, [userName, supabaseUser]);
  
  // フォロー機能
  const {
    isFollowing,
    followCounts,
    privacySettings,
    followers,
    following,
    isLoading: followLoading,
    isActionLoading,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    isOwnProfile: isOwnFollowProfile,
    canViewFollowers,
    canViewFollowing,
    isAuthenticated: isFollowAuthenticated,
  } = useFollows(targetUserId);

  // ============================================
  // データソースに応じてプロフィール情報を取得
  // ============================================

  // Supabase認証時は supabaseUser を使用
  // 未認証時（デモモード）は LocalStorage の users を使用
  // Supabaseから取得した他ユーザーのプロフィールがある場合はそれを使用
  const realUser = targetProfile
    ? {
        id: targetProfile.id,
        name: targetProfile.name,
        role: targetProfile.role || '医療従事者',
        email: '',
        totalGratitude: targetProfile.total_gratitude || 0
      }
    : isAuthenticated && supabaseUser && (!userName || userName === supabaseUser.name)
    ? {
        id: supabaseUser.id,
        name: supabaseUser.name,
        role: supabaseUser.role,
        email: supabaseUser.email || '',
        totalGratitude: supabaseUser.totalGratitude || 0
      }
    : users.find(u => u.name === userName);

  // ユーザー名が指定されている場合は、そのユーザーのプロフィールを取得
  // そうでなければ、現在のユーザーのプロフィールを使用
  const profileData = userName ? getUserProfile(userName) : null;
  
  // 実際のユーザーデータから感謝システム情報を取得
  // Supabase認証時は profiles の total_gratitude を使用
  const userGratitudeCount = targetProfile
    ? (targetProfile.total_gratitude || 0)
    : isAuthenticated && supabaseUser && (!userName || userName === supabaseUser.name)
    ? (supabaseUser.totalGratitude || 0)
    : (realUser ? getUserGratitudeCount(realUser.id) : 0);
  
  const userTopTitle = !isAuthenticated && realUser ? getUserTopTitle(realUser.id) : '';
  const userAchievements = !isAuthenticated && realUser ? getUserAchievements(realUser.id) : [];
  
  // ユーザーの質問を取得
  const userQuestions = questions.filter(q => q.author === userName || q.authorId === realUser?.id || q.authorId === targetUserId);
  
  // プロフィールが存在しない場合、ユーザーデータから動的に生成
  let currentProfile = targetProfile ? {
    avatarImage: targetProfile.avatar_url,
    backgroundImage: targetProfile.background_url,
    avatarGradient: targetProfile.avatar_gradient || 'from-purple-500 to-pink-500',
    backgroundGradient: targetProfile.background_gradient || 'from-blue-400 via-blue-500 to-blue-600',
    name: targetProfile.name,
    bio: targetProfile.bio || '',
    role: targetProfile.role || '医療従事者',
    location: targetProfile.location || '',
    website: targetProfile.website || '',
    speciality: targetProfile.speciality || '',
    experience: targetProfile.experience || '',
    workplace: targetProfile.workplace || '',
    socialLinks: targetProfile.social_links || {}
  } : profileData || settings;
  
  if (!profileData && !targetProfile && realUser && userName) {
    // 新規ユーザーの場合、基本プロフィールを動的に生成
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600', 
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-violet-500 to-purple-600'
    ];
    const bgColors = [
      'from-blue-400 via-blue-500 to-blue-600',
      'from-purple-400 via-purple-500 to-purple-600',
      'from-emerald-400 via-emerald-500 to-emerald-600',
      'from-pink-400 via-pink-500 to-pink-600',
      'from-green-400 via-green-500 to-green-600',
      'from-yellow-400 via-yellow-500 to-yellow-600'
    ];
    const colorIndex = realUser.name.charCodeAt(0) % colors.length;
    
    currentProfile = {
      avatarImage: null,
      backgroundImage: null,
      avatarGradient: colors[colorIndex],
      backgroundGradient: bgColors[colorIndex],
      name: realUser.name,
      bio: '',
      role: realUser.role,
      location: '',
      website: '',
      speciality: '',
      experience: '',
      workplace: ''
    };
  }

  // プロフィール設定からユーザーデータを構築
  const user = {
    id: realUser?.id || 'demo_user',
    email: realUser?.email || 'demo@example.com',
    name: currentProfile.name,
    role: currentProfile.role,
    tier: 'expert' as const,
    isEmailVerified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    bio: currentProfile.bio,
    location: currentProfile.location,
    website: currentProfile.website,
    speciality: currentProfile.speciality,
    experience: currentProfile.experience,
    workplace: currentProfile.workplace,
    socialLinks: currentProfile.socialLinks
  };

  // 現在表示しているプロフィールが自分のものかどうかを判定
  // Supabase認証時は supabaseUser.name で比較
  const isOwnProfile = isAuthenticated && supabaseUser
    ? !userName || userName === supabaseUser.name
    : !userName || userName === settings.name;

  // 統計データ（フォロー数は実データを使用）
  const stats = {
    posts: userQuestions.length,
    answers: 298,
    likes: 1856,
    following: followCounts.following_count,
    followers: followCounts.followers_count
  };

  // フォロワー一覧モーダルを開く
  const handleOpenFollowersModal = () => {
    if (!isFollowAuthenticated) {
      // 未ログイン時はログイン誘導（または何もしない）
      return;
    }
    if (!canViewFollowers && !isOwnProfile) {
      // 非公開の場合は開けない
      return;
    }
    if (targetUserId) {
      fetchFollowers(targetUserId);
    }
    setShowFollowersModal(true);
  };

  // フォロー中一覧モーダルを開く
  const handleOpenFollowingModal = () => {
    if (!isFollowAuthenticated) {
      return;
    }
    if (!canViewFollowing && !isOwnProfile) {
      return;
    }
    if (targetUserId) {
      fetchFollowing(targetUserId);
    }
    setShowFollowingModal(true);
  };

  // フォローボタンクリック
  const handleFollowClick = async () => {
    if (!targetUserId) return;
    await toggleFollow(targetUserId);
  };

  const renderBadge = () => {
    if (user.tier === 'expert') {
      return (
        <div className="inline-flex items-center ml-2 text-yellow-600">
          <Star className="h-4 w-4" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ヘッダー */}
      {onBack && (
        <div className="flex items-center p-4 border-b border-gray-100">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-500">{stats.posts}件の投稿</p>
          </div>
        </div>
      )}

      {/* プロフィール情報 */}
      <div className="px-6 py-6">
        {/* トップ部分：プロフィール画像、統計、ボタン */}
        <div className="flex items-start space-x-6 mb-6">
          {/* プロフィール画像 */}
          <div className="relative flex-shrink-0">
            <div className={`h-20 w-20 rounded-full border-2 border-gray-200 flex items-center justify-center shadow-md ${
              currentProfile.avatarImage ? '' : `bg-gradient-to-br ${currentProfile.avatarGradient}`
            }`}>
              {currentProfile.avatarImage ? (
                <img 
                  src={currentProfile.avatarImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0) || 'U'}
                </span>
              )}
            </div>
            {isOwnProfile && (
              <button 
                onClick={onEditProfile}
                className="absolute -bottom-1 -right-1 p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* 統計情報とボタン */}
          <div className="flex-1">
            {/* 統計情報 */}
            <div className="flex justify-around mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{stats.posts}</div>
                <div className="text-sm text-gray-500">投稿</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600">{userGratitudeCount}</div>
                <div className="text-sm text-gray-500">感謝</div>
              </div>
              {/* フォロワー数 */}
              <button 
                onClick={handleOpenFollowersModal}
                className={`text-center ${isFollowAuthenticated && (canViewFollowers || isOwnProfile) ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
                disabled={!isFollowAuthenticated || (!canViewFollowers && !isOwnProfile)}
              >
                <div className="text-lg font-bold text-gray-900 flex items-center justify-center">
                  {stats.followers}
                  {!canViewFollowers && !isOwnProfile && (
                    <Lock className="h-3 w-3 ml-1 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-500">フォロワー</div>
              </button>
              {/* フォロー中数 */}
              <button 
                onClick={handleOpenFollowingModal}
                className={`text-center ${isFollowAuthenticated && (canViewFollowing || isOwnProfile) ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
                disabled={!isFollowAuthenticated || (!canViewFollowing && !isOwnProfile)}
              >
                <div className="text-lg font-bold text-gray-900 flex items-center justify-center">
                  {stats.following}
                  {!canViewFollowing && !isOwnProfile && (
                    <Lock className="h-3 w-3 ml-1 text-gray-400" />
                  )}
                </div>
                <div className="text-sm text-gray-500">フォロー中</div>
              </button>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-2">
              {isOwnProfile ? (
                <button
                  onClick={onEditProfile}
                  className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors text-sm text-gray-700"
                >
                  プロフィールを編集
                </button>
              ) : isFollowAuthenticated ? (
                <button
                  onClick={handleFollowClick}
                  disabled={isActionLoading}
                  className={`flex-1 px-4 py-1.5 rounded-md font-medium transition-colors text-sm flex items-center justify-center ${
                    isFollowing
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-300 hover:text-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4 mr-1" />
                      フォロー中
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      フォローする
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="flex-1 px-4 py-1.5 border border-gray-300 rounded-md font-medium text-sm text-gray-400 cursor-not-allowed"
                  disabled
                >
                  ログインしてフォロー
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ユーザー名とバッジ */}
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <h2 className="text-base font-bold text-gray-900 mr-2">{user.name}</h2>
            {renderBadge()}
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">{user.role}</p>
          {userTopTitle && (
            <p className="text-emerald-600 text-sm font-bold">🏆 {userTopTitle}</p>
          )}
        </div>

        {/* バイオ */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {user.bio}
          </p>
        </div>

        {/* メタ情報 */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-4 mb-4">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {user.location}
          </div>
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(user.createdAt).getFullYear()}年{new Date(user.createdAt).getMonth() + 1}月から参加
          </div>
        </div>

        {/* SNSリンク */}
        {user.socialLinks && (
          <div className="mb-4">
            <SocialLinks 
              socialLinks={user.socialLinks} 
              size="md" 
              showLabels={false} 
            />
          </div>
        )}
      </div>

      {/* タブナビゲーション */}
      <div className="border-t border-gray-200">
        <nav className="flex">
          {[
            { id: 'posts', label: '投稿', icon: MessageCircle },
            { id: 'answers', label: '回答', icon: Heart },
            { id: 'achievements', label: '実績', icon: Star },
            { id: 'stats', label: '統計', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userQuestions.length > 0 ? (
              userQuestions.map((question) => (
                <div 
                  key={question.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onQuestionSelect?.(question.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-blue-600 transition-colors">
                      {question.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{question.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {question.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {question.answers}
                      </span>
                      <span>{question.timeAgo}</span>
                    </div>
                    {question.hasAcceptedAnswer && (
                      <span className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        解決済み
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">投稿がありません</h3>
                <p className="text-gray-500">まだ質問を投稿していません</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'answers' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">回答した質問</p>
                  <h3 className="font-semibold text-gray-900 text-sm">採血時の血管選択について</h3>
                </div>
                <span className="flex items-center text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  ベストアンサー
                </span>
              </div>
              <p className="text-gray-700 text-xs mb-3 leading-relaxed">血管選択は穿刺成功の鍵となります。まず視診と触診を組み合わせ、直線的で弾力性のある血管を選びましょう。特に肘正中静脈は最も安全で確実です。</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  45 いいね
                </span>
                <span>2日前</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.posts}</div>
                <div className="text-sm text-gray-600">総投稿数</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.answers}</div>
                <div className="text-sm text-gray-600">回答数</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.likes}</div>
                <div className="text-sm text-gray-600">獲得いいね</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-600">解決率</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* 称号セクション */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                獲得した称号
              </h3>
              {userAchievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <AchievementBadge 
                        achievement={achievement} 
                        size="small" 
                        showTitle={true}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {achievement.achievedAt.toLocaleDateString('ja-JP')} 達成
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  まだ称号を獲得していません
                </p>
              )}
            </div>

            {/* 感謝統計 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-emerald-500" />
                感謝の統計
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">{userGratitudeCount}</div>
                  <div className="text-sm text-gray-600">受けた感謝</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userAchievements.length}</div>
                  <div className="text-sm text-gray-600">獲得称号</div>
                </div>
              </div>
            </div>

            {/* 次のマイルストーン */}
            {(() => {
              const nextMilestone = [1, 10, 100, 500, 1000, 5000, 10000, 50000]
                .find(milestone => milestone > userGratitudeCount);
              
              if (nextMilestone) {
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">次のマイルストーン</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          感謝 {nextMilestone} まで
                        </span>
                        <span className="text-sm text-gray-500">
                          {userGratitudeCount}/{nextMilestone}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((userGratitudeCount / nextMilestone) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        あと {nextMilestone - userGratitudeCount} 感謝で新しい称号が獲得できます
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {activeTab === 'views' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">最近の閲覧アクティビティ</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">今日</span>
                    <span className="text-xs text-gray-500">質問への回答から</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">8 閲覧</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">昨日</span>
                    <span className="text-xs text-gray-500">検索結果から</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">12 閲覧</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* フォロワー一覧モーダル */}
      {showFollowersModal && (
        <FollowListModal
          title="フォロワー"
          users={followers}
          isLoading={followLoading}
          isPrivate={!canViewFollowers && !isOwnProfile}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {/* フォロー中一覧モーダル */}
      {showFollowingModal && (
        <FollowListModal
          title="フォロー中"
          users={following}
          isLoading={followLoading}
          isPrivate={!canViewFollowing && !isOwnProfile}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
};

/**
 * フォロワー/フォロー中一覧モーダル
 */
interface FollowListModalProps {
  title: string;
  users: FollowUser[];
  isLoading: boolean;
  isPrivate: boolean;
  onClose: () => void;
}

const FollowListModal: React.FC<FollowListModalProps> = ({
  title,
  users,
  isLoading,
  isPrivate,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isPrivate ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Lock className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                このユーザーの{title}一覧は非公開です
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                {title}はまだいません
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* アバター */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-white font-bold">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* ユーザー情報 */}
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    {user.speciality && (
                      <p className="text-sm text-gray-500 truncate">
                        {user.speciality}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* フォロワー数 */}
                  <div className="text-right text-xs text-gray-500 ml-2">
                    <div>{user.followers_count} フォロワー</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;