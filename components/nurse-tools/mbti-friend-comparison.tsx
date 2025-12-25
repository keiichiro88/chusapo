import React, { useState } from 'react';
import { getTypeCompatibility, PERSONALITY_TYPES } from '../../lib/nurse-tools/mbti-constants';
import { TypeCompatibility } from '../../lib/nurse-tools/mbti-types';
import { Users, Heart, Star, AlertTriangle, ChevronDown } from 'lucide-react';

interface MBTIFriendComparisonProps {
  myType: string;
}

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

const compatibilityColors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  excellent: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', icon: <Heart className="w-5 h-5 text-green-500 fill-green-500" /> },
  good: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', icon: <Star className="w-5 h-5 text-blue-500 fill-blue-500" /> },
  neutral: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-300', icon: <Users className="w-5 h-5 text-gray-500" /> },
  challenging: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
};

const compatibilityLabels: Record<string, string> = {
  excellent: '最高の相性',
  good: '良い相性',
  neutral: '普通の相性',
  challenging: '学びのある関係',
};

export function MBTIFriendComparison({ myType }: MBTIFriendComparisonProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [compatibility, setCompatibility] = useState<TypeCompatibility | null>(null);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsDropdownOpen(false);
    const result = getTypeCompatibility(myType, type);
    setCompatibility(result);
  };

  const selectedTypeInfo = selectedType ? PERSONALITY_TYPES[selectedType] : null;
  const colorStyle = compatibility ? compatibilityColors[compatibility.compatibility] : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-purple-500" />
        <h3 className="font-bold text-lg text-slate-800">友達・同僚との相性診断</h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        チームメンバーや同僚のMBTIタイプを選んで、仕事上の相性をチェック！
      </p>

      {/* Type Selector Dropdown */}
      <div className="relative mb-6">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-label="友達のMBTIタイプを選択"
        >
          <span className={selectedType ? 'text-slate-800 font-medium' : 'text-slate-400'}>
            {selectedType ? `${selectedType} - ${selectedTypeInfo?.title}` : '友達のMBTIタイプを選択'}
          </span>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div 
            className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 max-h-64 overflow-y-auto"
            role="listbox"
          >
            {MBTI_TYPES.map((type) => {
              const typeInfo = PERSONALITY_TYPES[type];
              const isSameType = type === myType;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  disabled={isSameType}
                  className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors ${
                    isSameType ? 'opacity-50 cursor-not-allowed' : ''
                  } ${selectedType === type ? 'bg-purple-100' : ''}`}
                  role="option"
                  aria-selected={selectedType === type}
                >
                  <span className="font-medium text-slate-800">{type}</span>
                  <span className="text-sm text-slate-500 ml-2">{typeInfo?.title}</span>
                  {isSameType && <span className="text-xs text-slate-400 ml-2">(あなた)</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Compatibility Result */}
      {compatibility && colorStyle && (
        <div className={`${colorStyle.bg} ${colorStyle.border} border rounded-xl p-5 animate-fade-in`}>
          <div className="flex items-center gap-3 mb-3">
            {colorStyle.icon}
            <div>
              <span className={`font-bold ${colorStyle.text}`}>
                {compatibilityLabels[compatibility.compatibility]}
              </span>
              <span className="text-sm text-slate-500 ml-2">
                {myType} × {selectedType}
              </span>
            </div>
          </div>

          <p className="text-slate-700 mb-4">
            {compatibility.description}
          </p>

          <div className="bg-white/70 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600 mb-1">
              💡 一緒に働くときのヒント
            </p>
            <p className="text-sm text-slate-700">
              {compatibility.workTip}
            </p>
          </div>
        </div>
      )}

      {!selectedType && (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">タイプを選択すると相性が表示されます</p>
        </div>
      )}
    </div>
  );
}



