import React from 'react';

export const MBTIButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline';
  'aria-label'?: string;
}> = ({
  children,
  variant = 'primary',
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles = `
    px-6 py-3 rounded-full font-bold transition-all duration-200 
    transform active:scale-95 shadow-md flex items-center justify-center gap-2
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variants = {
    primary: "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-200 focus:ring-teal-500",
    secondary: "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200 focus:ring-pink-500",
    outline: "border-2 border-teal-500 text-teal-600 hover:bg-teal-50 focus:ring-teal-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const MBTICard: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}> = ({ 
  children, 
  className = '',
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) => (
  <div 
    className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}
    role={role}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
  >
    {children}
  </div>
);

export const MBTIBadge: React.FC<{ 
  children: React.ReactNode; 
  color?: string;
  'aria-label'?: string;
}> = ({ 
  children, 
  color = "bg-gray-100 text-gray-800",
  'aria-label': ariaLabel,
}) => (
  <span 
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    role="status"
    aria-label={ariaLabel}
  >
    {children}
  </span>
);

// プログレスバーコンポーネント（アクセシビリティ対応）
export const MBTIProgressBar: React.FC<{
  current: number;
  total: number;
  className?: string;
}> = ({ current, total, className = '' }) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-slate-500 mb-2">
        <span>質問 {current} / {total}</span>
        <span>{percentage}%完了</span>
      </div>
      <div 
        className="h-3 w-full bg-slate-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`診断の進捗: ${total}問中${current}問完了`}
      >
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// スキップリンク（キーボードナビゲーション用）
export const SkipLink: React.FC<{ targetId: string; children: React.ReactNode }> = ({ 
  targetId, 
  children 
}) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-white focus:rounded-lg focus:shadow-lg"
  >
    {children}
  </a>
);

// ビジュアリーヒドゥン（スクリーンリーダー専用テキスト）
export const VisuallyHidden: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// ライブリージョン（動的な変更を通知）
export const LiveRegion: React.FC<{ 
  children: React.ReactNode;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
}> = ({ 
  children, 
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
}) => (
  <div 
    aria-live={ariaLive} 
    aria-atomic={ariaAtomic}
    className="sr-only"
  >
    {children}
  </div>
);

// 5段階評価ボタングループ（アクセシビリティ対応）
export const LikertButtonGroup: React.FC<{
  questionText: string;
  optionAText: string;
  optionBText: string;
  onSelect: (value: -2 | -1 | 0 | 1 | 2) => void;
  disabled?: boolean;
}> = ({ questionText, optionAText, optionBText, onSelect, disabled = false }) => {
  const options = [
    { value: -2 as const, label: '強くA', shortLabel: 'A', size: 'w-10 h-10 md:w-12 md:h-12', bgColor: 'bg-teal-500', hoverBorder: 'hover:border-teal-500 hover:bg-teal-50' },
    { value: -1 as const, label: 'ややA', shortLabel: 'A', size: 'w-8 h-8 md:w-10 md:h-10', bgColor: 'bg-teal-300', hoverBorder: 'hover:border-teal-300 hover:bg-teal-50/50' },
    { value: 0 as const, label: 'どちらとも', shortLabel: '＝', size: 'w-6 h-6 md:w-8 md:h-8', bgColor: 'bg-slate-300', hoverBorder: 'hover:border-slate-400 hover:bg-slate-50' },
    { value: 1 as const, label: 'ややB', shortLabel: 'B', size: 'w-8 h-8 md:w-10 md:h-10', bgColor: 'bg-pink-300', hoverBorder: 'hover:border-pink-300 hover:bg-pink-50/50' },
    { value: 2 as const, label: '強くB', shortLabel: 'B', size: 'w-10 h-10 md:w-12 md:h-12', bgColor: 'bg-pink-500', hoverBorder: 'hover:border-pink-500 hover:bg-pink-50' },
  ];

  return (
    <div 
      role="radiogroup" 
      aria-label={`${questionText} - 回答を選択してください`}
      className="w-full"
    >
      <div className="flex justify-center items-center gap-2 md:gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            disabled={disabled}
            role="radio"
            aria-checked={false}
            aria-label={`${option.label === 'どちらとも' ? 'どちらとも言えない' : 
              option.value < 0 ? `${option.label}に同意: ${optionAText}` : 
              `${option.label}に同意: ${optionBText}`}`}
            className={`
              flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl border-2 border-slate-100 
              ${option.hoverBorder} transition-all 
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 
              group disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className={`${option.size} rounded-full ${option.bgColor} flex items-center justify-center text-white font-bold ${option.value === 0 ? 'text-slate-600 text-sm' : 'text-lg'} group-hover:scale-110 transition-transform`}>
              {option.shortLabel}
            </div>
            <span className="text-[10px] md:text-xs text-slate-500 whitespace-nowrap">
              {option.label === 'どちらとも' ? 'どちらとも' : option.label.replace('強く', '強く').replace('やや', 'やや') + 'そう'}
            </span>
          </button>
        ))}
      </div>
      
      {/* スクリーンリーダー用の説明 */}
      <div className="sr-only">
        <p>A: {optionAText}</p>
        <p>B: {optionBText}</p>
        <p>キーボードの矢印キーで選択肢を移動し、Enterキーで選択できます。</p>
      </div>
    </div>
  );
};
