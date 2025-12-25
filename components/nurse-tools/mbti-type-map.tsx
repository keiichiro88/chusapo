import React, { useState } from 'react';
import { PERSONALITY_TYPES } from '../../lib/nurse-tools/mbti-constants';
import { Map, Info, X } from 'lucide-react';

interface MBTITypeMapProps {
  currentType: string;
}

// 16タイプのグループ分け
const TYPE_GROUPS = {
  analysts: {
    name: '分析家',
    color: 'purple',
    types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    description: '論理的思考と戦略的視点を持つ',
  },
  diplomats: {
    name: '外交官',
    color: 'green',
    types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    description: '共感力と理想主義を持つ',
  },
  sentinels: {
    name: '番人',
    color: 'blue',
    types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    description: '責任感と協調性を持つ',
  },
  explorers: {
    name: '探検家',
    color: 'orange',
    types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
    description: '柔軟性と行動力を持つ',
  },
};

// タイプの特徴（簡潔版）
const TYPE_TRAITS: Record<string, { trait: string; nursing: string }> = {
  INTJ: { trait: '戦略家・独立心', nursing: '効率的なシステム構築が得意' },
  INTP: { trait: '論理派・分析家', nursing: 'エビデンスに基づく看護を追求' },
  ENTJ: { trait: '指揮官・決断力', nursing: '組織を牽引するリーダー' },
  ENTP: { trait: '革新者・議論好き', nursing: '新しい看護の形を模索' },
  INFJ: { trait: '洞察力・理想主義', nursing: '患者の心を読み取る力' },
  INFP: { trait: '共感力・創造性', nursing: '個別性を大切にするケア' },
  ENFJ: { trait: 'カリスマ・指導力', nursing: '後輩育成と教育に強み' },
  ENFP: { trait: '熱意・好奇心', nursing: '患者との信頼関係構築' },
  ISTJ: { trait: '責任感・正確性', nursing: '確実で安全な看護の実践' },
  ISFJ: { trait: '献身的・気配り', nursing: '患者に寄り添う看護' },
  ESTJ: { trait: '統率力・効率重視', nursing: '病棟運営のリーダー' },
  ESFJ: { trait: '協調性・世話好き', nursing: 'チームの調和を保つ' },
  ISTP: { trait: '冷静・技術力', nursing: '緊急時も動じない対応' },
  ISFP: { trait: '柔軟・観察力', nursing: '患者の個別性を尊重' },
  ESTP: { trait: '行動力・機転', nursing: '救急現場で力を発揮' },
  ESFP: { trait: '社交的・楽観的', nursing: '患者を笑顔にする力' },
};

// グループの色設定
const GROUP_COLORS = {
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
    highlight: 'bg-purple-500',
  },
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    highlight: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    highlight: 'bg-blue-500',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    highlight: 'bg-orange-500',
  },
};

export function MBTITypeMap({ currentType }: MBTITypeMapProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // 現在のタイプがどのグループに属するか
  const currentGroup = Object.entries(TYPE_GROUPS).find(([, group]) =>
    group.types.includes(currentType)
  );

  const handleTypeClick = (type: string) => {
    if (type === currentType) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-lg text-slate-800">16タイプマップ</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="タイプマップについて"
        >
          <Info className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {showInfo && (
        <div className="bg-indigo-50 rounded-lg p-4 mb-4 text-sm text-indigo-800">
          <p className="mb-2">MBTIは16の性格タイプを4つのグループに分類しています。</p>
          <p>あなたのタイプ（<strong>{currentType}</strong>）がマップ上でハイライトされています。</p>
          <p className="mt-2">他のタイプをタップすると詳細が表示されます。</p>
        </div>
      )}

      {/* グループ凡例 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries(TYPE_GROUPS).map(([key, group]) => {
          const colors = GROUP_COLORS[group.color as keyof typeof GROUP_COLORS];
          const isCurrentGroup = currentGroup?.[0] === key;
          return (
            <div
              key={key}
              className={`flex items-center gap-2 p-2 rounded-lg ${colors.bg} ${
                isCurrentGroup ? 'ring-2 ring-offset-1 ring-indigo-400' : ''
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${colors.highlight}`} />
              <span className={`text-xs font-medium ${colors.text}`}>{group.name}</span>
            </div>
          );
        })}
      </div>

      {/* 16タイプグリッド */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(TYPE_GROUPS).map(([, group]) => {
          const colors = GROUP_COLORS[group.color as keyof typeof GROUP_COLORS];
          return group.types.map((type) => {
            const isCurrent = type === currentType;
            const isSelected = type === selectedType;
            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? `${colors.highlight} text-white border-transparent ring-4 ring-yellow-300 ring-opacity-50`
                    : isSelected
                    ? `${colors.bg} ${colors.border} ${colors.text}`
                    : `bg-slate-50 border-slate-200 text-slate-600 hover:${colors.bg} hover:${colors.border}`
                }`}
                aria-label={`${type}タイプの詳細を見る`}
              >
                <span className="font-bold text-sm">{type}</span>
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-[10px]">★</span>
                  </span>
                )}
              </button>
            );
          });
        })}
      </div>

      {/* 選択されたタイプの詳細 */}
      {selectedType && (
        <div className="bg-slate-50 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800">{selectedType}</span>
                <span className="text-sm text-slate-500">
                  {PERSONALITY_TYPES[selectedType]?.title}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedType(null)}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="閉じる"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">
              <span className="font-medium text-slate-700">特徴：</span>
              {TYPE_TRAITS[selectedType]?.trait}
            </p>
            <p className="text-slate-600">
              <span className="font-medium text-slate-700">看護師として：</span>
              {TYPE_TRAITS[selectedType]?.nursing}
            </p>
          </div>

          {/* 現在のタイプとの比較 */}
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              あなた（{currentType}）との違い：
            </p>
            <div className="flex gap-1 mt-1">
              {currentType.split('').map((letter, index) => {
                const otherLetter = selectedType[index];
                const isDifferent = letter !== otherLetter;
                return (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      isDifferent
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {letter} {isDifferent ? '≠' : '='} {otherLetter}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 現在のタイプの説明（何も選択されていないとき） */}
      {!selectedType && (
        <div className={`rounded-xl p-4 ${GROUP_COLORS[currentGroup?.[1].color as keyof typeof GROUP_COLORS]?.bg || 'bg-slate-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <span className="font-bold text-slate-800">あなたは {currentType} タイプ</span>
          </div>
          <p className="text-sm text-slate-600">
            <strong>{currentGroup?.[1].name}グループ</strong>に属しています。
            {currentGroup?.[1].description}タイプです。
          </p>
          <p className="text-sm text-slate-600 mt-2">
            <span className="font-medium">看護師として：</span>
            {TYPE_TRAITS[currentType]?.nursing}
          </p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-4">
        タイプをタップして詳細を確認できます
      </p>
    </div>
  );
}
