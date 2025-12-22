import React from 'react';
import { MessageCircle, Search, Plus, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-questions' | 'no-results' | 'no-answers' | 'custom';
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  actionLabel,
  onAction,
  className = ''
}) => {
  // タイプ別のデフォルト設定
  const presets = {
    'no-questions': {
      icon: MessageCircle,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      title: 'まだ質問がありません',
      description: '最初の質問者になって、コミュニティのみんなに相談してみましょう！',
      defaultAction: '質問を投稿する'
    },
    'no-results': {
      icon: Search,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      title: '検索結果が見つかりませんでした',
      description: '検索条件を変更するか、新しい質問を投稿してみましょう。',
      defaultAction: '質問を投稿する'
    },
    'no-answers': {
      icon: MessageCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      title: 'まだ回答がありません',
      description: 'この質問に最初の回答をしてみませんか？',
      defaultAction: '回答する'
    },
    'custom': {
      icon: MessageCircle,
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-500',
      title: 'データがありません',
      description: '',
      defaultAction: ''
    }
  };

  const preset = presets[type];
  const Icon = CustomIcon || preset.icon;
  const title = customTitle || preset.title;
  const description = customDescription || preset.description;
  const buttonLabel = actionLabel || preset.defaultAction;

  return (
    <div className={`text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 ${className}`}>
      {/* アイコン */}
      <div className={`${preset.iconBg} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6`}>
        <Icon className={`h-10 w-10 ${preset.iconColor}`} />
      </div>

      {/* タイトル */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>

      {/* 説明文 */}
      {description && (
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* アクションボタン */}
      {buttonLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2 mx-auto"
        >
          <Plus className="h-5 w-5" />
          <span>{buttonLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

