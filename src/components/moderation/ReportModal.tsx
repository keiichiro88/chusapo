import React, { useMemo, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type ReportReason =
  | '個人情報が含まれている'
  | '誹謗中傷・攻撃的'
  | 'スパム・宣伝'
  | '危険/不適切な医療行為の助長'
  | '著作権/無断転載'
  | 'その他';

const REASONS: ReportReason[] = [
  '個人情報が含まれている',
  '誹謗中傷・攻撃的',
  'スパム・宣伝',
  '危険/不適切な医療行為の助長',
  '著作権/無断転載',
  'その他',
];

export function ReportModal(props: {
  isOpen: boolean;
  targetLabel: string;
  reportedUserName?: string;
  onClose: () => void;
  onSubmit: (payload: { reason: string; details?: string }) => Promise<void> | void;
}) {
  const { isOpen, targetLabel, reportedUserName, onClose, onSubmit } = props;

  const [reason, setReason] = useState<ReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => !!reason, [reason]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ reason, details: details.trim() || undefined });
      setReason('');
      setDetails('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">通報する</h2>
              <p className="text-xs text-gray-500 font-medium">
                対象: {targetLabel}
                {reportedUserName ? `（${reportedUserName}）` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">お願い</p>
            <p className="leading-relaxed">
              個人情報（氏名・住所・施設名・顔写真・カルテ番号など）が含まれていないかを確認し、必要に応じて編集/削除を依頼できるよう運営に共有します。
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              通報理由 *
            </label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                    reason === r ? 'border-amber-300 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="mt-1"
                  />
                  <span className="text-sm font-semibold text-gray-800">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              追加情報（任意）
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 font-medium resize-none"
              placeholder="どの部分が問題か、補足があれば記載してください（例：個人名が含まれる、宣伝URLがある など）"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '送信中...' : '通報を送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


