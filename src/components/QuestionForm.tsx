import React, { useMemo, useState, useEffect } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface User {
  id: string;
  name: string;
  role: string;
}

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionData: Omit<Question, 'id' | 'likes' | 'answers' | 'hasAcceptedAnswer' | 'createdAt' | 'timeAgo'>) => void;
  currentUser: User | null;
}

const DRAFT_STORAGE_KEY = 'medconsult_question_draft';

const PUNCTURE_SITES = ['前腕', '肘窩', '手背', '上腕', '足背', '三角筋（ワクチン等）', 'その他/不明'] as const;
const VESSEL_CONDITIONS = [
  '細い',
  '蛇行',
  '浮きにくい/触れにくい',
  '脆い/破れやすい',
  '硬い',
  '浮腫',
  '皮膚が脆弱',
  '脱水傾向',
  '血管痛が強い',
  '高齢',
  '小児',
  'その他',
] as const;
const DEVICE_TYPES = ['翼状針', '留置針', '採血針', '動脈穿刺キット', 'シリンジ直', 'その他/不明'] as const;
const GAUGES = ['18G', '20G', '22G', '24G', '25G', '26G', '27G', '不明'] as const;
const ISSUE_OPTIONS = [
  '穿刺が入らない（皮下で外れる）',
  '逆血はあるが進まない',
  '血管が潰れる',
  '血管が破れる/血腫',
  '痛みが強い',
  '固定が難しい/抜けやすい',
  '採血量が取れない',
  'その他',
] as const;

type TemplateData = {
  punctureSite: string;
  vesselConditions: string[];
  deviceType: string;
  gauge: string;
  issues: string[];
  hasPhoto: 'あり' | 'なし' | '';
  photoNote: string;
};

function buildStructuredContent(params: { category: string; title: string; content: string } & TemplateData) {
  const templateFilled =
    !!params.punctureSite ||
    params.vesselConditions.length > 0 ||
    !!params.deviceType ||
    !!params.gauge ||
    params.issues.length > 0 ||
    !!params.hasPhoto ||
    !!params.photoNote.trim();

  if (!templateFilled) return params.content;

  const lines: string[] = [];
  lines.push('【状況テンプレ】');
  if (params.category) lines.push(`【カテゴリ】${params.category}`);
  if (params.punctureSite) lines.push(`【穿刺部位】${params.punctureSite}`);
  if (params.vesselConditions.length > 0) lines.push(`【血管/条件】${params.vesselConditions.join(' / ')}`);
  if (params.deviceType || params.gauge) lines.push(`【針・カテ】${[params.deviceType, params.gauge].filter(Boolean).join(' ')}`);
  if (params.issues.length > 0) lines.push(`【困りごと】${params.issues.join(' / ')}`);
  if (params.hasPhoto) lines.push(`【参考画像】${params.hasPhoto}${params.photoNote.trim() ? `（${params.photoNote.trim()}）` : ''}`);
  lines.push('');
  lines.push('【詳細】');
  lines.push(params.content.trim());
  return lines.join('\n');
}

const QuestionForm: React.FC<QuestionFormProps> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  // ローカルストレージから下書きを復元
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft) as any;
        return {
          title: draft?.title || '',
          content: draft?.content || '',
          category: draft?.category || '',
          punctureSite: draft?.punctureSite || '',
          vesselConditions: Array.isArray(draft?.vesselConditions) ? draft.vesselConditions.filter((v: any) => typeof v === 'string') : [],
          deviceType: draft?.deviceType || '',
          gauge: draft?.gauge || '',
          issues: Array.isArray(draft?.issues) ? draft.issues.filter((v: any) => typeof v === 'string') : [],
          hasPhoto: draft?.hasPhoto === 'あり' || draft?.hasPhoto === 'なし' ? draft.hasPhoto : '',
          photoNote: draft?.photoNote || '',
          author: currentUser?.name || '匿名ユーザー',
          authorRole: currentUser?.role || ''
        };
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return {
      title: '',
      content: '',
      category: '',
      punctureSite: '',
      vesselConditions: [] as string[],
      deviceType: '',
      gauge: '',
      issues: [] as string[],
      hasPhoto: '' as '' | 'あり' | 'なし',
      photoNote: '',
      author: currentUser?.name || '匿名ユーザー',
      authorRole: currentUser?.role || ''
    };
  };

  const [formData, setFormData] = useState(loadDraft);
  const [showDraftNotification, setShowDraftNotification] = useState(false);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);

  const categories = [
    '注射',
    '採血',
    'ルート確保',
    '動脈穿刺',
    'その他'
  ];

  // 自動保存機能
  const saveDraft = (data: typeof formData) => {
    try {
      const draftData = {
        title: data.title,
        content: data.content,
        category: data.category,
        punctureSite: data.punctureSite,
        vesselConditions: data.vesselConditions,
        deviceType: data.deviceType,
        gauge: data.gauge,
        issues: data.issues,
        hasPhoto: data.hasPhoto,
        photoNote: data.photoNote
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // 下書きをクリア
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // フォームに入力内容があるかチェック
  const hasContent = () => {
    return (
      formData.title.trim() ||
      formData.content.trim() ||
      formData.category ||
      formData.punctureSite ||
      formData.deviceType ||
      formData.gauge ||
      (formData.vesselConditions?.length ?? 0) > 0 ||
      (formData.issues?.length ?? 0) > 0 ||
      formData.hasPhoto ||
      formData.photoNote?.trim()
    );
  };

  // モーダルが開いた時に下書きがあるかチェック＆背景スクロール制御
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        setShowDraftNotification(true);
        setTimeout(() => setShowDraftNotification(false), 5000);
      }
      
      // 背景のスクロールを無効化
      document.body.style.overflow = 'hidden';
      
      // iOSでの背景スクロール対策
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Escキーでモーダルを閉じる
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (hasContent()) {
            const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
            if (confirmClose) {
              onClose();
            }
          } else {
            onClose();
          }
        }
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY.toString()) * -1);
        }
      };
    } else {
      // モーダルが閉じた時に元に戻す
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen, onClose]);

  // フォームデータが変更された時に自動保存
  useEffect(() => {
    if (hasContent()) {
      const timeoutId = setTimeout(() => {
        saveDraft(formData);
      }, 1000); // 1秒後に保存

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  const contentPreview = useMemo(() => {
    return buildStructuredContent({
      category: formData.category,
      title: formData.title,
      content: formData.content,
      punctureSite: formData.punctureSite,
      vesselConditions: formData.vesselConditions || [],
      deviceType: formData.deviceType,
      gauge: formData.gauge,
      issues: formData.issues || [],
      hasPhoto: formData.hasPhoto,
      photoNote: formData.photoNote,
    });
  }, [formData]);

  const toggleMulti = (key: 'vesselConditions' | 'issues', value: string) => {
    setFormData((prev: any) => {
      const current: string[] = Array.isArray(prev[key]) ? prev[key] : [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  // ページを離れる時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOpen && hasContent()) {
        e.preventDefault();
        e.returnValue = '入力中の内容が失われます。このページを離れますか？';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOpen, formData]);



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!privacyConfirmed) {
      alert('投稿前に「個人情報を含めない」確認にチェックしてください。');
      return;
    }
    
    // カテゴリーをタグとして設定
    const finalTags = [];
    if (formData.category) finalTags.push(formData.category);
    
    // テンプレ情報をタグに軽く付与（LocalStorage用）
    if (formData.punctureSite) finalTags.push(`穿刺部位:${formData.punctureSite}`);
    if (formData.deviceType) finalTags.push(`器具:${formData.deviceType}`);
    if (formData.gauge) finalTags.push(`ゲージ:${formData.gauge}`);

    const finalContent = buildStructuredContent({
      category: formData.category,
      title: formData.title,
      content: formData.content,
      punctureSite: formData.punctureSite,
      vesselConditions: formData.vesselConditions,
      deviceType: formData.deviceType,
      gauge: formData.gauge,
      issues: formData.issues,
      hasPhoto: formData.hasPhoto,
      photoNote: formData.photoNote,
    });

    const questionData = {
      title: formData.title,
      content: finalContent,
      category: formData.category, // Supabase用にcategoryを追加
      author: formData.author || '匿名ユーザー',
      authorRole: formData.authorRole || '医療従事者',
      tags: finalTags
    };
    
    onSubmit(questionData);
    
    // 下書きをクリア
    clearDraft();
    
    // フォームをリセット
    setFormData({
      title: '',
      content: '',
      category: '',
      punctureSite: '',
      vesselConditions: [],
      deviceType: '',
      gauge: '',
      issues: [],
      hasPhoto: '',
      photoNote: '',
      author: currentUser?.name || '匿名ユーザー',
      authorRole: currentUser?.role || ''
    });
    setPrivacyConfirmed(false);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <h2 className="text-2xl font-black text-gray-900">質問を投稿</h2>
          <button
            onClick={() => {
              if (hasContent()) {
                const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
                if (confirmClose) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 下書き復元通知 */}
        {showDraftNotification && (
          <div className="mx-8 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                前回の入力内容を復元しました
              </p>
              <p className="text-xs text-blue-600 mt-1">
                入力内容は自動的に下書きとして保存されます
              </p>
            </div>
            <button
              onClick={() => setShowDraftNotification(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              質問タイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              placeholder="質問を簡潔に記述してください..."
              required
            />
          </div>

          {/* ログイン中は自動入力（表示のみ）、未ログイン時は編集可能 */}
          {currentUser ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{currentUser.name}</p>
                  <p className="text-sm text-gray-600">{currentUser.role || '医療従事者'}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  ログイン中
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  あなたのお名前
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  placeholder="匿名ユーザー"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  職種・役職
                </label>
                <input
                  type="text"
                  value={formData.authorRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value }))}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  placeholder="例: 看護師、医師、技師など"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              カテゴリー *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              required
            >
              <option value="">カテゴリーを選択</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 状況テンプレ（任意） */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="text-sm font-black text-gray-900">状況テンプレ（任意）</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  入力すると本文が整理され、回答がつきやすくなります（投稿時に自動で整形されます）。
                </p>
              </div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                おすすめ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">穿刺部位</label>
                <select
                  value={formData.punctureSite}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, punctureSite: e.target.value }))}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 font-medium"
                >
                  <option value="">選択（任意）</option>
                  {PUNCTURE_SITES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">針・カテの種類</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, deviceType: e.target.value }))}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 font-medium"
                >
                  <option value="">選択（任意）</option>
                  {DEVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">ゲージ</label>
                <select
                  value={formData.gauge}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, gauge: e.target.value }))}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 font-medium"
                >
                  <option value="">選択（任意）</option>
                  {GAUGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">参考画像</label>
                <select
                  value={formData.hasPhoto}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, hasPhoto: e.target.value }))}
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 font-medium"
                >
                  <option value="">選択（任意）</option>
                  <option value="なし">なし</option>
                  <option value="あり">あり（匿名化済み）</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">血管/条件（複数選択）</label>
              <div className="flex flex-wrap gap-2">
                {VESSEL_CONDITIONS.map((v) => {
                  const selected = (formData.vesselConditions || []).includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleMulti('vesselConditions', v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        selected
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">困りごと（複数選択）</label>
              <div className="flex flex-wrap gap-2">
                {ISSUE_OPTIONS.map((v) => {
                  const selected = (formData.issues || []).includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleMulti('issues', v)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        selected
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">参考画像の補足（任意）</label>
              <input
                type="text"
                value={formData.photoNote}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, photoNote: e.target.value }))}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 font-medium"
                placeholder="例：手背の静脈、皮下出血の様子 など（個人情報は書かない）"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              詳細説明 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
              placeholder="患者の状況、試行した手法、具体的な懸念事項など、詳細な情報を記載してください..."
              required
            />
          </div>

          {/* 投稿プレビュー */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">投稿プレビュー</p>
            <div className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
              {contentPreview || '（プレビューがありません）'}
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div className="text-sm text-amber-800">
                <p className="font-bold mb-2">プロフェッショナルガイドライン</p>
                <p className="leading-relaxed">
                  患者のプライバシー保護のため、患者を特定できる情報（氏名・住所・施設名・顔写真・カルテ番号・電話番号など）は一切投稿しないでください。
                </p>
              </div>
            </div>
          </div>

          {/* 個人情報チェック */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConfirmed}
                onChange={(e) => setPrivacyConfirmed(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="font-black text-gray-900 text-sm">個人情報を含めていません</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  患者が特定される情報（氏名/施設名/顔写真/カルテ番号など）を投稿していないことを確認しました。
                </p>
              </div>
            </label>
          </div>

          {/* 下書きクリアボタン */}
          {hasContent() && (
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  const confirmClear = window.confirm('下書きをクリアしますか？入力内容は失われます。');
                  if (confirmClear) {
                    clearDraft();
                    setFormData({
                      title: '',
                      content: '',
                      category: '',
                      punctureSite: '',
                      vesselConditions: [],
                      deviceType: '',
                      gauge: '',
                      issues: [],
                      hasPhoto: '',
                      photoNote: '',
                      author: currentUser?.name || '匿名ユーザー',
                      authorRole: currentUser?.role || ''
                    });
                    setPrivacyConfirmed(false);
                  }
                }}
                className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                下書きをクリア
              </button>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                if (hasContent()) {
                  const confirmClose = window.confirm('入力中の内容は下書きとして保存されます。フォームを閉じますか？');
                  if (confirmClose) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!privacyConfirmed}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              質問を投稿
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;