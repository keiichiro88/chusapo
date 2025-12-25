import React, { useState } from 'react';
import { FileText, Download, X, User, Loader2 } from 'lucide-react';
import { PersonalityResult, AIAdvice, MBTIScores } from '../../lib/nurse-tools/mbti-types';
import { generateMBTIPDF } from '../../lib/nurse-tools/mbti-pdf-generator';

interface MBTIPDFDownloadProps {
  mbtiType: string;
  result: PersonalityResult;
  scores: MBTIScores;
  aiAdvice?: AIAdvice | null;
}

export function MBTIPDFDownload({ mbtiType, result, scores, aiAdvice }: MBTIPDFDownloadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateMBTIPDF({
        mbtiType,
        result,
        scores,
        aiAdvice,
        userName: userName.trim() || undefined,
        diagnosisDate: new Date().toLocaleDateString('ja-JP'),
      });
      setIsModalOpen(false);
      setUserName('');
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickDownload = async () => {
    setIsGenerating(true);
    try {
      await generateMBTIPDF({
        mbtiType,
        result,
        scores,
        aiAdvice,
        diagnosisDate: new Date().toLocaleDateString('ja-JP'),
      });
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDF生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* ダウンロードボタン */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-lg text-slate-800">PDF出力</h3>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          診断結果をPDFでダウンロードできます。履歴書への添付や自己分析の記録にご活用ください。
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleQuickDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {isGenerating ? '生成中...' : 'すぐにダウンロード'}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-red-300 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <User className="w-5 h-5" />
            名前を入れてダウンロード
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 text-center">
          ※ PDFは日本語で出力されます。A4サイズ対応。
        </p>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <h2 id="pdf-modal-title" className="font-bold text-lg">PDF出力オプション</h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-slate-700 mb-2">
                  お名前（オプション）
                </label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="例: 山田 花子"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  maxLength={50}
                />
                <p className="text-xs text-slate-400 mt-1">
                  入力すると、PDFに「診断者: ○○様」と表示されます
                </p>
              </div>

              {/* プレビュー情報 */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">PDF内容</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    MBTIタイプ: {mbtiType} - {result.title}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    性格特性・強み
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    性格バランス分析チャート
                  </li>
                  {aiAdvice && (
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      AIキャリアアドバイス
                    </li>
                  )}
                </ul>
              </div>

              {/* ダウンロードボタン */}
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PDF生成中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    PDFをダウンロード
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
