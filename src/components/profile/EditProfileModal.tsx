import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, MapPin, Link as LinkIcon, User, Briefcase, Palette, Image as ImageIcon, Youtube, Instagram, Twitter, Linkedin, Globe, Lock, Unlock, Users, Star } from 'lucide-react';
import Modal from '../auth/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { useFollows } from '../../hooks/useFollows';
import ImageCropModal from './ImageCropModal';
import { generateAvatarGradient } from '../../utils/avatarUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  
  // 認証ユーザー情報を渡してプロフィール設定を取得
  const authUserInfo = supabaseUser ? { id: supabaseUser.id, name: supabaseUser.name, role: supabaseUser.role } : null;
  const { settings, updateSettings } = useProfileSettings(authUserInfo);
  
  // フォロー公開設定
  const { privacySettings, updatePrivacySettings } = useFollows();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    location: '',
    website: '',
    speciality: '',
    experience: '',
    workplace: ''
  });

  const [socialLinks, setSocialLinks] = useState({
    youtube: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    website: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [cropType, setCropType] = useState<'avatar' | 'background'>('avatar');
  
  // 公開設定
  const [isFollowersListPublic, setIsFollowersListPublic] = useState(true);
  const [isFollowingListPublic, setIsFollowingListPublic] = useState(true);
  
  // MBTI表示設定
  const [showMbtiOnProfile, setShowMbtiOnProfile] = useState(false);
  
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);

  // アバターのグラデーションオプション
  const avatarGradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600'
  ];

  // 背景グラデーションオプション
  const backgroundGradients = [
    'from-blue-400 via-blue-500 to-blue-600',
    'from-purple-400 via-purple-500 to-purple-600',
    'from-emerald-400 via-emerald-500 to-emerald-600',
    'from-pink-400 via-pink-500 to-pink-600',
    'from-indigo-400 via-indigo-500 to-indigo-600',
    'from-cyan-400 via-cyan-500 to-cyan-600',
    'from-orange-400 via-orange-500 to-orange-600',
    'from-rose-400 via-rose-500 to-rose-600'
  ];

  const [selectedAvatarGradient, setSelectedAvatarGradient] = useState('from-purple-500 to-pink-500');
  const [selectedBackgroundGradient, setSelectedBackgroundGradient] = useState('from-blue-400 via-blue-500 to-blue-600');

  // 設定からフォームデータを初期化
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: settings.name,
        bio: settings.bio,
        role: settings.role,
        location: settings.location,
        website: settings.website,
        speciality: settings.speciality,
        experience: settings.experience,
        workplace: settings.workplace
      });
      setSocialLinks({
        youtube: settings.socialLinks?.youtube || '',
        instagram: settings.socialLinks?.instagram || '',
        twitter: settings.socialLinks?.twitter || '',
        linkedin: settings.socialLinks?.linkedin || '',
        website: settings.socialLinks?.website || ''
      });
      setAvatarImage(settings.avatarImage);
      setBackgroundImage(settings.backgroundImage);
      setSelectedAvatarGradient(settings.avatarGradient);
      setSelectedBackgroundGradient(settings.backgroundGradient);
      // 公開設定を初期化
      setIsFollowersListPublic(privacySettings.is_followers_list_public);
      setIsFollowingListPublic(privacySettings.is_following_list_public);
      // MBTI表示設定を初期化
      setShowMbtiOnProfile(settings.showMbtiOnProfile || false);
    }
  }, [isOpen, settings, privacySettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError(null);

    try {
      // プロフィール設定を保存
      await updateSettings({
        ...formData,
        socialLinks,
        avatarImage,
        backgroundImage,
        avatarGradient: selectedAvatarGradient,
        backgroundGradient: selectedBackgroundGradient,
        showMbtiOnProfile
      });
      
      // 公開設定を保存（Supabaseログイン時のみ）
      if (supabaseUser) {
        await updatePrivacySettings({
          is_followers_list_public: isFollowersListPublic,
          is_following_list_public: isFollowingListPublic,
        });
      }
      
      // 既存の認証システムにも反映
      updateProfile({
        name: formData.name,
        role: formData.role
      });
      
      onClose();
    } catch (error) {
      console.error('プロフィール更新に失敗しました:', error);
      setSaveError('保存に失敗しました。通信状況を確認してもう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (type: 'avatar' | 'banner') => {
    if (type === 'avatar') {
      avatarFileRef.current?.click();
    } else {
      backgroundFileRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // クロップモーダルを開く
        setCropImageUrl(result);
        setCropType(type === 'avatar' ? 'avatar' : 'background');
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // クロップ完了時の処理
  const handleCropSave = (croppedImage: string) => {
    if (cropType === 'avatar') {
      setAvatarImage(croppedImage);
    } else {
      setBackgroundImage(croppedImage);
    }
    setShowCropModal(false);
  };

  const handleGradientSelect = (gradient: string, type: 'avatar' | 'background') => {
    if (type === 'avatar') {
      setSelectedAvatarGradient(gradient);
      setAvatarImage(null); // グラデーションを選んだらアップロード画像をクリア
      setShowAvatarOptions(false);
    } else {
      setSelectedBackgroundGradient(gradient);
      setBackgroundImage(null);
      setShowBackgroundOptions(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">プロフィールを編集</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {saveError && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium">
              {saveError}
            </div>
          )}
          {/* 背景画像とアバター */}
          <div className="space-y-6">
            {/* 背景画像 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                背景画像
              </label>
              <div className="relative">
                <div className={`relative h-32 rounded-lg overflow-hidden ${
                  backgroundImage ? '' : `bg-gradient-to-br ${selectedBackgroundGradient}`
                }`}>
                  {backgroundImage ? (
                    <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20" />
                  <button
                    type="button"
                    onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
                    className="absolute top-2 right-2 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
                  >
                    <Palette className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (backgroundImage) {
                        setCropImageUrl(backgroundImage);
                        setCropType('background');
                        setShowCropModal(true);
                      } else {
                        handleImageUpload('banner');
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Camera className="h-6 w-6 text-white" />
                      <span className="text-white text-sm font-medium">
                        {backgroundImage ? '画像を編集' : '画像をアップロード'}
                      </span>
                    </div>
                  </button>
                </div>
                
                {/* 背景グラデーションオプション */}
                {showBackgroundOptions && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">背景テーマを選択</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {backgroundGradients.map((gradient, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleGradientSelect(gradient, 'background')}
                          className={`h-8 rounded-lg bg-gradient-to-br ${gradient} border-2 transition-all ${
                            selectedBackgroundGradient === gradient ? 'border-gray-900 scale-110' : 'border-transparent hover:border-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageUpload('banner')}
                      className="w-full mt-3 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      カスタム画像をアップロード
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* プロフィール画像 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                プロフィール画像
              </label>
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <div 
                    className={`h-20 w-20 rounded-full flex items-center justify-center cursor-pointer relative group ${
                      avatarImage ? '' : `bg-gradient-to-br ${selectedAvatarGradient}`
                    }`}
                    onClick={() => {
                      if (avatarImage) {
                        setCropImageUrl(avatarImage);
                        setCropType('avatar');
                        setShowCropModal(true);
                      }
                    }}
                  >
                    {avatarImage ? (
                      <>
                        <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-5 w-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {formData.name.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-gray-900 rounded-full text-white hover:bg-gray-800 transition-colors"
                  >
                    <Palette className="h-3 w-3" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload('avatar')}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full text-gray-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      新しい画像をアップロード
                    </button>
                    {avatarImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setCropImageUrl(avatarImage);
                          setCropType('avatar');
                          setShowCropModal(true);
                        }}
                        className="flex items-center px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        現在の画像を編集
                      </button>
                    )}
                  </div>
                  
                  {/* アバターグラデーションオプション */}
                  {showAvatarOptions && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-900 mb-2">アバターテーマ</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {avatarGradients.map((gradient, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleGradientSelect(gradient, 'avatar')}
                            className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} border-2 transition-all ${
                              selectedAvatarGradient === gradient ? 'border-gray-900 scale-110' : 'border-transparent hover:border-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* ファイル入力 */}
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'avatar')}
              className="hidden"
            />
            <input
              ref={backgroundFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'banner')}
              className="hidden"
            />
          </div>

          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                名前
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                職種
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                >
                  <option value="医師">医師</option>
                  <option value="看護師">看護師</option>
                  <option value="看護師長">看護師長</option>
                  <option value="臨床検査技師">臨床検査技師</option>
                  <option value="放射線技師">放射線技師</option>
                  <option value="薬剤師">薬剤師</option>
                  <option value="医学生">医学生</option>
                  <option value="看護学生">看護学生</option>
                  <option value="その他">その他</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                専門分野
              </label>
              <select
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
              >
                <option value="">選択してください</option>
                <optgroup label="内科系">
                  <option value="内科">内科</option>
                  <option value="循環器内科">循環器内科</option>
                  <option value="消化器内科">消化器内科</option>
                  <option value="呼吸器内科">呼吸器内科</option>
                  <option value="腎臓内科">腎臓内科</option>
                  <option value="糖尿病・内分泌内科">糖尿病・内分泌内科</option>
                  <option value="血液内科">血液内科</option>
                  <option value="神経内科">神経内科</option>
                  <option value="膠原病・リウマチ内科">膠原病・リウマチ内科</option>
                  <option value="感染症内科">感染症内科</option>
                  <option value="腫瘍内科">腫瘍内科</option>
                  <option value="老年内科">老年内科</option>
                  <option value="心療内科">心療内科</option>
                  <option value="総合診療科">総合診療科</option>
                </optgroup>
                <optgroup label="外科系">
                  <option value="外科">外科</option>
                  <option value="消化器外科">消化器外科</option>
                  <option value="心臓血管外科">心臓血管外科</option>
                  <option value="呼吸器外科">呼吸器外科</option>
                  <option value="脳神経外科">脳神経外科</option>
                  <option value="整形外科">整形外科</option>
                  <option value="形成外科">形成外科</option>
                  <option value="乳腺外科">乳腺外科</option>
                  <option value="泌尿器科">泌尿器科</option>
                  <option value="小児外科">小児外科</option>
                </optgroup>
                <optgroup label="専門科">
                  <option value="小児科">小児科</option>
                  <option value="産婦人科">産婦人科</option>
                  <option value="眼科">眼科</option>
                  <option value="耳鼻咽喉科">耳鼻咽喉科</option>
                  <option value="皮膚科">皮膚科</option>
                  <option value="精神科">精神科</option>
                  <option value="放射線科">放射線科</option>
                  <option value="麻酔科">麻酔科</option>
                  <option value="病理診断科">病理診断科</option>
                  <option value="臨床検査科">臨床検査科</option>
                </optgroup>
                <optgroup label="救急・集中治療">
                  <option value="救急科">救急科</option>
                  <option value="集中治療科">集中治療科</option>
                </optgroup>
                <optgroup label="その他">
                  <option value="リハビリテーション科">リハビリテーション科</option>
                  <option value="緩和ケア科">緩和ケア科</option>
                  <option value="在宅医療">在宅医療</option>
                  <option value="歯科">歯科</option>
                  <option value="口腔外科">口腔外科</option>
                  <option value="その他">その他</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                経験年数
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
              >
                <option value="">選択してください</option>
                <option value="1年未満">1年未満</option>
                <option value="1年目">1年目</option>
                <option value="2年目">2年目</option>
                <option value="3年目">3年目</option>
                <option value="4年目">4年目</option>
                <option value="5年目">5年目</option>
                <option value="6年目">6年目</option>
                <option value="7年目">7年目</option>
                <option value="8年目">8年目</option>
                <option value="9年目">9年目</option>
                <option value="10年目">10年目</option>
                <option value="11年目">11年目</option>
                <option value="12年目">12年目</option>
                <option value="13年目">13年目</option>
                <option value="14年目">14年目</option>
                <option value="15年目">15年目</option>
                <option value="16-20年目">16-20年目</option>
                <option value="21-25年目">21-25年目</option>
                <option value="26-30年目">26-30年目</option>
                <option value="30年以上">30年以上</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                勤務先
              </label>
              <select
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
              >
                <option value="大学病院">大学病院</option>
                <option value="総合病院">総合病院</option>
                <option value="専門病院">専門病院</option>
                <option value="クリニック">クリニック</option>
                <option value="訪問看護">訪問看護</option>
                <option value="介護施設">介護施設</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                所在地
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                >
                  <option value="">選択してください</option>
                  <optgroup label="地域（大まか）">
                    <option value="北海道・東北地方">北海道・東北地方</option>
                    <option value="関東地方">関東地方</option>
                    <option value="中部地方">中部地方</option>
                    <option value="近畿地方">近畿地方</option>
                    <option value="中国地方">中国地方</option>
                    <option value="四国地方">四国地方</option>
                    <option value="九州・沖縄地方">九州・沖縄地方</option>
                  </optgroup>
                  <optgroup label="北海道・東北">
                    <option value="北海道">北海道</option>
                    <option value="青森県">青森県</option>
                    <option value="岩手県">岩手県</option>
                    <option value="宮城県">宮城県</option>
                    <option value="秋田県">秋田県</option>
                    <option value="山形県">山形県</option>
                    <option value="福島県">福島県</option>
                  </optgroup>
                  <optgroup label="関東">
                    <option value="茨城県">茨城県</option>
                    <option value="栃木県">栃木県</option>
                    <option value="群馬県">群馬県</option>
                    <option value="埼玉県">埼玉県</option>
                    <option value="千葉県">千葉県</option>
                    <option value="東京都">東京都</option>
                    <option value="神奈川県">神奈川県</option>
                  </optgroup>
                  <optgroup label="中部">
                    <option value="新潟県">新潟県</option>
                    <option value="富山県">富山県</option>
                    <option value="石川県">石川県</option>
                    <option value="福井県">福井県</option>
                    <option value="山梨県">山梨県</option>
                    <option value="長野県">長野県</option>
                    <option value="岐阜県">岐阜県</option>
                    <option value="静岡県">静岡県</option>
                    <option value="愛知県">愛知県</option>
                  </optgroup>
                  <optgroup label="近畿">
                    <option value="三重県">三重県</option>
                    <option value="滋賀県">滋賀県</option>
                    <option value="京都府">京都府</option>
                    <option value="大阪府">大阪府</option>
                    <option value="兵庫県">兵庫県</option>
                    <option value="奈良県">奈良県</option>
                    <option value="和歌山県">和歌山県</option>
                  </optgroup>
                  <optgroup label="中国">
                    <option value="鳥取県">鳥取県</option>
                    <option value="島根県">島根県</option>
                    <option value="岡山県">岡山県</option>
                    <option value="広島県">広島県</option>
                    <option value="山口県">山口県</option>
                  </optgroup>
                  <optgroup label="四国">
                    <option value="徳島県">徳島県</option>
                    <option value="香川県">香川県</option>
                    <option value="愛媛県">愛媛県</option>
                    <option value="高知県">高知県</option>
                  </optgroup>
                  <optgroup label="九州・沖縄">
                    <option value="福岡県">福岡県</option>
                    <option value="佐賀県">佐賀県</option>
                    <option value="長崎県">長崎県</option>
                    <option value="熊本県">熊本県</option>
                    <option value="大分県">大分県</option>
                    <option value="宮崎県">宮崎県</option>
                    <option value="鹿児島県">鹿児島県</option>
                    <option value="沖縄県">沖縄県</option>
                  </optgroup>
                  <optgroup label="その他">
                    <option value="海外">海外</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              自己紹介
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm resize-none"
              placeholder="あなたの専門分野や興味について教えてください..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/160文字</p>
          </div>

          {/* SNSリンク */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              SNS・リンク（任意）
            </label>
            <div className="space-y-3">
              {/* YouTube */}
              <div>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  <input
                    type="url"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 font-medium text-sm"
                    placeholder="https://youtube.com/@username"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-500" />
                  <input
                    type="url"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 font-medium text-sm"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              {/* X (Twitter) */}
              <div>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200 font-medium text-sm"
                    placeholder="https://x.com/username"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              {/* ウェブサイト */}
              <div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="url"
                    value={socialLinks.website}
                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200 font-medium text-sm"
                    placeholder="https://example.com（個人サイト・ブログ）"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ※ SNSやウェブサイトのリンクを設定すると、プロフィールにアイコンが表示されます
            </p>
          </div>

          {/* プライバシー設定（Supabaseログイン時のみ表示） */}
          {supabaseUser && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  プライバシー設定
                </div>
              </label>
              <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* フォロワー一覧の公開設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">フォロワー一覧を公開</p>
                      <p className="text-xs text-gray-500">他のユーザーがあなたのフォロワー一覧を見られるようにする</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFollowersListPublic(!isFollowersListPublic)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isFollowersListPublic ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isFollowersListPublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* フォロー中一覧の公開設定 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">フォロー中一覧を公開</p>
                      <p className="text-xs text-gray-500">他のユーザーがあなたのフォロー中一覧を見られるようにする</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFollowingListPublic(!isFollowingListPublic)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isFollowingListPublic ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isFollowingListPublic ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  非公開にしても、フォロワー数・フォロー中数は表示されます
                </p>
              </div>
            </div>
          )}

          {/* MBTI表示設定（診断済みの場合のみ表示） */}
          {settings.mbtiType && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                <div className="flex items-center">
                  <span className="mr-2">🧠</span>
                  キャリア診断AI
                </div>
              </label>
              <div className="space-y-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                {/* 現在のMBTIタイプ */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-purple-900">
                      あなたのタイプ: {settings.mbtiType}
                    </p>
                    {settings.mbtiTitle && (
                      <p className="text-xs text-purple-600">{settings.mbtiTitle}</p>
                    )}
                  </div>
                </div>

                {/* MBTI表示ON/OFF */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">プロフィールに表示</p>
                      <p className="text-xs text-gray-500">MBTIタイプを他のユーザーに公開する</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMbtiOnProfile(!showMbtiOnProfile)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      showMbtiOnProfile ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showMbtiOnProfile ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
      
      {/* 画像クロップモーダル */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageUrl={cropImageUrl}
        onSave={handleCropSave}
        cropShape={cropType === 'avatar' ? 'circle' : 'rect'}
        aspectRatio={cropType === 'avatar' ? 1 : 16/9}
      />
    </Modal>
  );
};

export default EditProfileModal;