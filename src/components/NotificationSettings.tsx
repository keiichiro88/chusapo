import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  BellOff,
  HandHeart,
  Award,
  Settings,
  Check,
  X,
  Info,
  Smartphone,
  Monitor,
  Toggle
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationSettingsProps {
  onBack: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const { 
    settings, 
    updateSettings, 
    requestPermission,
    getUserNotifications,
    getUnreadCount,
    markAllAsRead
  } = useNotifications();
  
  const [browserPermission, setBrowserPermission] = useState(
    'Notification' in window ? Notification.permission : 'default'
  );

  const handleToggle = (setting: keyof typeof settings) => {
    updateSettings({ [setting]: !settings[setting] });
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setBrowserPermission(granted ? 'granted' : 'denied');
  };

  const getPermissionStatus = () => {
    switch (browserPermission) {
      case 'granted':
        return { icon: Check, color: 'text-green-600', bg: 'bg-green-50', text: '許可済み' };
      case 'denied':
        return { icon: X, color: 'text-red-600', bg: 'bg-red-50', text: '拒否されています' };
      default:
        return { icon: Info, color: 'text-amber-600', bg: 'bg-amber-50', text: '未設定' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-black text-gray-900 mb-2">通知設定</h1>
          <p className="text-gray-600">感謝や称号獲得時の通知設定を管理できます</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <div className={`p-2 rounded-xl ${settings.enabled ? 'bg-blue-50' : 'bg-gray-50'}`}>
            {settings.enabled ? (
              <Bell className="h-6 w-6 text-blue-600" />
            ) : (
              <BellOff className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <span className={`font-bold ${settings.enabled ? 'text-blue-600' : 'text-gray-500'}`}>
            {settings.enabled ? '通知ON' : '通知OFF'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* メイン通知設定 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">基本設定</h2>
                <p className="text-gray-600">通知機能の全体的な制御</p>
              </div>
            </div>
            
            <button
              onClick={() => handleToggle('enabled')}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${settings.enabled ? 'bg-blue-600' : 'bg-gray-300'}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className={`space-y-4 transition-opacity duration-200 ${
            settings.enabled ? 'opacity-100' : 'opacity-50'
          }`}>
            {/* 感謝通知設定 */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <HandHeart className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">感謝通知</h3>
                  <p className="text-sm text-gray-600">誰かから感謝を受け取った時に通知</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle('gratitudeReceived')}
                disabled={!settings.enabled}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
                  ${settings.gratitudeReceived && settings.enabled ? 'bg-emerald-600' : 'bg-gray-300'}
                  ${!settings.enabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className={`
                  inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200
                  ${settings.gratitudeReceived && settings.enabled ? 'translate-x-5' : 'translate-x-1'}
                `} />
              </button>
            </div>

            {/* 称号獲得通知設定 */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">称号獲得通知</h3>
                  <p className="text-sm text-gray-600">新しい称号を獲得した時に通知</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle('achievementUnlocked')}
                disabled={!settings.enabled}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
                  ${settings.achievementUnlocked && settings.enabled ? 'bg-purple-600' : 'bg-gray-300'}
                  ${!settings.enabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className={`
                  inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200
                  ${settings.achievementUnlocked && settings.enabled ? 'translate-x-5' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>
        </div>

        {/* ブラウザ通知設定 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Monitor className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">ブラウザ通知</h2>
              <p className="text-gray-600">デスクトップ通知の設定</p>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${permissionStatus.bg} ${permissionStatus.color.replace('text-', 'border-')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <permissionStatus.icon className={`h-5 w-5 ${permissionStatus.color}`} />
                <div>
                  <h3 className="font-bold text-gray-900">通知許可状況</h3>
                  <p className="text-sm text-gray-600">
                    ブラウザからのデスクトップ通知: <span className="font-medium">{permissionStatus.text}</span>
                  </p>
                </div>
              </div>
              
              {browserPermission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  許可を要求
                </button>
              )}
            </div>
          </div>

          {browserPermission === 'denied' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-bold mb-1">通知が拒否されています</p>
                  <p>
                    ブラウザの設定から当サイトの通知を許可してください。
                    アドレスバーの左側にある鍵マークをクリックして「通知」を「許可」に変更できます。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 通知プレビュー */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Smartphone className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">通知プレビュー</h2>
              <p className="text-gray-600">実際の通知がどのように表示されるかの例</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 感謝通知プレビュー */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <HandHeart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">感謝を受け取りました！</h4>
                  <p className="text-sm text-gray-600">田中 美咲さんから感謝を受け取りました。あなたのアドバイスが役に立ったようです！</p>
                  <p className="text-xs text-gray-500 mt-1">数秒前</p>
                </div>
              </div>
            </div>

            {/* 称号獲得通知プレビュー */}
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">新しい称号を獲得しました！</h4>
                  <p className="text-sm text-gray-600">「頼れるアドバイザー」の称号を獲得しました。おめでとうございます！</p>
                  <p className="text-xs text-gray-500 mt-1">1時間前</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-2">通知に関する注意事項</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>通知設定は即座に適用されます</li>
                <li>ブラウザ通知は各ブラウザの設定に依存します</li>
                <li>プライベートブラウジングモードでは通知が制限される場合があります</li>
                <li>通知は最新の30件まで保存されます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;