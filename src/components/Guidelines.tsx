import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  AlertTriangle, 
  Shield, 
  Users, 
  Heart, 
  HandHeart,
  CheckCircle, 
  Info, 
  Star,
  FileText,
  Lock,
  Eye,
  MessageCircle,
  Zap,
  Award,
  Clock,
  Search,
  Download,
  ExternalLink
} from 'lucide-react';

interface GuidelinesProps {
  onBack: () => void;
}

interface GuidelineSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  content: {
    overview: string;
    rules: string[];
    examples?: string[];
    tips?: string[];
  };
}

const Guidelines: React.FC<GuidelinesProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [searchQuery, setSearchQuery] = useState('');

  const guidelineSections: GuidelineSection[] = [
    {
      id: 'basic',
      title: '基本ガイドライン',
      icon: BookOpen,
      color: 'blue',
      content: {
        overview: 'チューサポの基本的な利用ルールと推奨事項です。すべてのユーザーが安全で有意義な情報交換を行うための基盤となります。',
        rules: [
          '医療情報の正確性を最優先に考慮してください',
          '不確実な情報については必ず「推測」「個人的見解」と明記してください',
          '緊急性の高い医療状況では、まず適切な医療機関に相談してください',
          '個人情報やプライバシーに関わる内容は投稿しないでください',
          '建設的で専門的な議論を心がけてください',
          '他のユーザーに対して敬意を持って接してください'
        ],
        tips: [
          '質問時は症状や状況を具体的に記載すると、より適切な回答が得られます',
          '回答時は根拠となる文献やガイドラインがあれば併記してください',
          '異なる見解がある場合は、複数の専門家の意見を求めることを推奨します'
        ]
      }
    },
    {
      id: 'safety',
      title: '安全性ガイドライン',
      icon: Shield,
      color: 'red',
      content: {
        overview: '患者安全と医療従事者の安全を確保するための重要なガイドラインです。医療行為に関わる重要な安全性の指針を提供します。',
        rules: [
          '生命に関わる緊急事態では、必ず119番通報または医療機関への直接受診を優先してください',
          '薬剤アレルギーや既往歴の確認を怠らないでください',
          '無菌操作の原則を厳守してください',
          '針刺し事故防止のための安全器具使用を推奨します',
          '感染予防対策（手指衛生、個人防護具）を徹底してください',
          '医療事故や合併症が発生した場合は、適切な報告・対応を行ってください'
        ],
        examples: [
          '血管迷走神経反射の兆候：顔面蒼白、冷汗、めまい → 即座に処置中断',
          '針刺し事故発生時：直ちに流水で洗浄 → 感染管理部門への報告',
          'アナフィラキシー症状：呼吸困難、血圧低下 → 緊急コール・エピペン使用'
        ]
      }
    },
    {
      id: 'professional',
      title: '専門家ガイドライン',
      icon: Award,
      color: 'purple',
      content: {
        overview: '医療従事者としての専門性と責任を持った情報提供を行うためのガイドラインです。',
        rules: [
          '所属・資格・専門分野を明確に記載してください',
          '最新のエビデンスに基づいた情報提供を心がけてください',
          '個人的経験と一般的推奨事項を明確に区別してください',
          '他の専門家の見解に対して建設的な議論を行ってください',
          '学習者に対して教育的な配慮を持って回答してください',
          '継続的な学習と知識のアップデートを心がけてください'
        ],
        tips: [
          '参考文献やガイドラインの出典を明記すると信頼性が向上します',
          '図表や画像を用いた説明は理解促進に効果的です',
          '複雑な手技については段階的な説明を心がけてください'
        ]
      }
    },
    {
      id: 'technique',
      title: '穿刺技術ガイドライン',
      icon: Zap,
      color: 'emerald',
      content: {
        overview: '各種穿刺技術に関する標準的な手順と安全性の確保に関するガイドラインです。',
        rules: [
          '適応と禁忌を十分に検討してから実施してください',
          '十分な解剖学的知識に基づいて穿刺部位を決定してください',
          '適切な器具選択と準備を行ってください',
          '患者への十分な説明と同意取得を行ってください',
          '無菌操作を厳守してください',
          '合併症の早期発見と適切な対応を行ってください'
        ],
        examples: [
          '静脈穿刺：触診による血管確認 → 穿刺角度15-30度 → 血液逆流確認',
          '動脈穿刺：脈拍触知確認 → 90度穿刺 → 圧迫止血最低5分間',
          'ルート確保：血管選択（順序：前腕→手背→上腕） → 固定確実 → 開通確認'
        ]
      }
    },
    {
      id: 'evaluation',
      title: '「いいね👍」と「感謝🙏」の使い分けガイド',
      icon: HandHeart,
      color: 'teal',
      content: {
        overview: '質問への「いいね」と回答への「感謝」の使い分けについて説明します。それぞれ異なる意味と価値を持つ重要な評価システムです。',
        rules: [
          '✨ 質問に「いいね👍」を押すのは、「聞いてくれてありがとう」「私も同じことで悩んでいました」「とても良い質問ですね」「質問してくれて助かります」という気持ちの時',
          '🌟 回答に「感謝🙏」を押すのは、「実際に試してみて、うまくいきました」「患者さんのケアに活かせました」「技術が向上しました、ありがとうございます」「専門知識を教えてくださり感謝します」という気持ちの時',
          '💡 質問することは勇気のいること。その一歩を踏み出した仲間を応援しましょう',
          '💡 回答者の専門知識と時間に対する、心からの「ありがとう」を表現しましょう',
          '誤って押した場合は、再度クリックすることで取り消すことができます'
        ],
        examples: [
          '👍「いいね」 = 「質問してくれてありがとう、私も学びになります」',
          '🙏「感謝」 = 「おかげで患者さんにより良いケアができました、本当にありがとうございます」',
          '質問者への効果：質問する心理的ハードルの軽減、コミュニティからの温かいサポート実感',
          '回答者への効果：実践的価値の実感による回答意欲向上、医療従事者としての使命感・貢献感の充実'
        ],
        tips: [
          '医療従事者同士として、質問者の孤独感軽減と安心して質問できる環境づくりを心がけましょう',
          '実際に役立った実感を与えることで、継続的な知識共有への動機を高めましょう',
          '温かく支え合う、真の専門家集団としてのコミュニティを形成しましょう',
          'より多くの人が気軽に質問できる雰囲気と、実践に基づいた価値ある回答の蓄積を目指しましょう'
        ]
      }
    },
    {
      id: 'community',
      title: 'コミュニティガイドライン',
      icon: Users,
      color: 'amber',
      content: {
        overview: '建設的で専門的なコミュニティを維持するための行動規範です。',
        rules: [
          '相互尊重と建設的な議論を心がけてください',
          '批判的意見も専門的で建設的な表現で行ってください',
          '初学者に対して教育的で支援的な態度を取ってください',
          '商業的宣伝や不適切な投稿は禁止します',
          '著作権を尊重し、適切な引用を行ってください',
          'ハラスメントや差別的発言は一切禁止します'
        ],
        tips: [
          '質問には積極的に回答し、知識の共有を心がけてください',
          '良い質問や回答には「いいね」で評価してください',
          '実際に実践して効果があった場合は「感謝」で評価してください',
          '間違いを指摘する際は、正しい情報と併せて建設的に行ってください'
        ]
      }
    }
  ];

  const filteredSections = guidelineSections.filter(section =>
    searchQuery === '' ||
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.rules.some(rule => rule.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Tailwindは動的クラス（`bg-${color}-50` 等）を生成できないため、明示マッピングで扱う
  const sidebarColorTokens = {
    blue: { active: 'bg-blue-50 text-blue-700 border border-blue-200', icon: 'text-blue-600' },
    red: { active: 'bg-red-50 text-red-700 border border-red-200', icon: 'text-red-600' },
    purple: { active: 'bg-purple-50 text-purple-700 border border-purple-200', icon: 'text-purple-600' },
    emerald: { active: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'text-emerald-600' },
    teal: { active: 'bg-teal-50 text-teal-700 border border-teal-200', icon: 'text-teal-600' },
    amber: { active: 'bg-amber-50 text-amber-700 border border-amber-200', icon: 'text-amber-600' },
  } as const;

  const getSidebarTokens = (color: string) => {
    return sidebarColorTokens[color as keyof typeof sidebarColorTokens] ?? sidebarColorTokens.blue;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200',
      red: 'from-red-500 to-red-600 text-red-600 bg-red-50 border-red-200',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-200',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50 border-emerald-200',
      teal: 'from-teal-500 to-teal-600 text-teal-600 bg-teal-50 border-teal-200',
      amber: 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50 border-amber-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const activeGuidelineSection = guidelineSections.find(section => section.id === activeSection);

  return (
    <div className="max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-black text-gray-900 mb-2">ガイドライン</h1>
          <p className="text-gray-600">チューサポを安全かつ効果的に利用するための重要な指針です</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button 
            disabled
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-400 font-bold rounded-xl cursor-not-allowed"
            title="この機能は現在準備中です"
          >
            <Download className="h-4 w-4" />
            <span>PDF版（準備中）</span>
          </button>
        </div>
      </div>

      {/* 重要な注意事項 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-black text-red-900 mb-2">重要：医療安全に関する注意事項</h3>
            <p className="text-red-800 leading-relaxed">
              このプラットフォームは医療従事者間の情報交換を目的としており、医師の診断や治療の代替となるものではありません。
              緊急性の高い医療状況では、必ず適切な医療機関に直接相談してください。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* サイドバー：ガイドライン一覧 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-black text-gray-900">目次</h3>
            </div>

            {/* 検索 */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ガイドラインを検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-2">
              {filteredSections.map((section) => (
                (() => {
                  const tokens = getSidebarTokens(section.color);
                  const isActive = activeSection === section.id;
                  return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                    isActive
                      ? tokens.active
                      : 'text-gray-700 hover:bg-gray-50'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30`}
                >
                  <section.icon className={`h-5 w-5 ${
                    isActive ? tokens.icon : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{section.title}</span>
                </button>
                  );
                })()
              ))}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:col-span-3">
          {activeGuidelineSection && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              {/* セクションヘッダー */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-4 bg-gradient-to-br ${getColorClasses(activeGuidelineSection.color).split(' ')[0]} ${getColorClasses(activeGuidelineSection.color).split(' ')[1]} rounded-2xl shadow-lg`}>
                  <activeGuidelineSection.icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{activeGuidelineSection.title}</h2>
                  <p className="text-gray-600 mt-2 leading-relaxed">
                    {activeGuidelineSection.content.overview}
                  </p>
                </div>
              </div>

              {/* ルール */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                  <span>重要なルール</span>
                </h3>
                <div className="space-y-3">
                  {activeGuidelineSection.content.rules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 例（もしあれば） */}
              {activeGuidelineSection.content.examples && (
                <div className="mb-8">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span>実践例</span>
                  </h3>
                  <div className="space-y-3">
                    {activeGuidelineSection.content.examples.map((example, index) => (
                      <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <p className="text-purple-800 leading-relaxed font-medium">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ヒント（もしあれば） */}
              {activeGuidelineSection.content.tips && (
                <div className="mb-8">
                  <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                    <Star className="h-6 w-6 text-amber-600" />
                    <span>推奨事項</span>
                  </h3>
                  <div className="space-y-3">
                    {activeGuidelineSection.content.tips.map((tip, index) => (
                      <div key={index} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-800 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* フッター */}
              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>最終更新: 2024年6月</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>医療安全委員会監修</span>
                  </div>
                </div>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                  <ExternalLink className="h-4 w-4" />
                  <span>関連資料を見る</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 追加リソース */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900">よくある質問</h3>
          </div>
          <p className="text-gray-600 mb-4">ガイドラインに関する疑問や質問への回答集</p>
          <button className="text-blue-600 font-medium hover:text-blue-700">詳細を見る →</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900">安全対策</h3>
          </div>
          <p className="text-gray-600 mb-4">医療安全とリスク管理に関する詳細資料</p>
          <button className="text-emerald-600 font-medium hover:text-emerald-700">詳細を見る →</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900">認定制度</h3>
          </div>
          <p className="text-gray-600 mb-4">専門家認定と継続教育プログラム</p>
          <button className="text-purple-600 font-medium hover:text-purple-700">詳細を見る →</button>
        </div>
      </div>
    </div>
  );
};

export default Guidelines;