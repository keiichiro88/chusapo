import React from 'react';
import { DiagnosisHistoryItem } from '../../lib/nurse-tools/mbti-types';
import { PERSONALITY_TYPES } from '../../lib/nurse-tools/mbti-constants';
import { History, Trash2, Eye, Calendar } from 'lucide-react';

interface MBTIHistoryProps {
  history: DiagnosisHistoryItem[];
  onSelect: (item: DiagnosisHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  currentType?: string;
}

export function MBTIHistory({ history, onSelect, onDelete, onClear, currentType }: MBTIHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-teal-500" />
          <h3 className="font-bold text-lg text-slate-800">診断履歴</h3>
        </div>
        <div className="text-center py-8 text-slate-400">
          <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">まだ診断履歴がありません</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-500" />
          <h3 className="font-bold text-lg text-slate-800">診断履歴</h3>
          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
            {history.length}件
          </span>
        </div>
        {history.length > 1 && (
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            aria-label="履歴をすべて削除"
          >
            <Trash2 className="w-3 h-3" />
            すべて削除
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {history.map((item, index) => {
          const typeInfo = PERSONALITY_TYPES[item.mbtiType];
          const isCurrent = currentType === item.mbtiType && index === 0;
          
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrent 
                  ? 'bg-teal-50 border-teal-200' 
                  : 'bg-slate-50 border-slate-100 hover:border-teal-200 hover:bg-teal-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  isCurrent ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {item.mbtiType.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{item.mbtiType}</span>
                    {isCurrent && (
                      <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">
                        現在
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">
                    {typeInfo?.title || item.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.savedAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(item)}
                  className="p-2 rounded-lg hover:bg-teal-100 transition-colors text-slate-500 hover:text-teal-600"
                  aria-label={`${item.mbtiType}の結果を見る`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 rounded-lg hover:bg-red-100 transition-colors text-slate-400 hover:text-red-500"
                  aria-label={`${item.mbtiType}の履歴を削除`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {history.length >= 3 && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          ※ 最新10件まで保存されます
        </p>
      )}
    </div>
  );
}



