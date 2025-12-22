import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, MapPin, Link as LinkIcon, User, Briefcase, Palette, Image as ImageIcon, Youtube, Instagram, Twitter, Linkedin, Globe } from 'lucide-react';
import Modal from '../auth/Modal';
import { useAuth } from '../../hooks/useAuth';
import { useProfileSettings } from '../../hooks/useProfileSettings';
// import ImageCropModal from './ImageCropModal';  // 一時的に無効化
import { generateAvatarGradient } from '../../utils/avatarUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { settings, updateSettings } = useProfileSettings();
  
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
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>('');
  const [cropType, setCropType] = useState<'avatar' | 'background'>('avatar');
  
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
    }
  }, [isOpen, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // プロフィール設定を保存
      updateSettings({
        ...formData,
        socialLinks,
        avatarImage,
        backgroundImage,
        avatarGradient: selectedAvatarGradient,
        backgroundGradient: selectedBackgroundGradient
      });
      
      // 既存の認証システムにも反映
      updateProfile({
        name: formData.name,
        role: formData.role
      });
      
      onClose();
    } catch (error) {
      console.error('プロフィール更新に失敗しました:', error);
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
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium w-full"
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
              <input
                type="text"
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium text-sm"
                placeholder="例: 循環器内科、救急科"
              />
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
                <option value="1年未満">1年未満</option>
                <option value="1-3年目">1-3年目</option>
                <option value="4-6年目">4-6年目</option>
                <option value="7-10年目">7-10年目</option>
                <option value="10年目">10年目</option>
                <option value="15年以上">15年以上</option>
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
                  <option value="北海道">北海道</option>
                  <option value="東京都">東京都</option>
                  <option value="神奈川県">神奈川県</option>
                  <option value="大阪府">大阪府</option>
                  <option value="愛知県">愛知県</option>
                  <option value="福岡県">福岡県</option>
                  <option value="その他">その他</option>
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
      {/* <ImageCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageUrl={cropImageUrl}
        onSave={handleCropSave}
        cropShape={cropType === 'avatar' ? 'circle' : 'rect'}
        aspectRatio={cropType === 'avatar' ? 1 : 16/9}
      /> */}
    </Modal>
  );
};

export default EditProfileModal;