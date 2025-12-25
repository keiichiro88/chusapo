import React, { useState } from 'react';
import { TrendingUp, Briefcase, GraduationCap, Award, Star } from 'lucide-react';

interface CareerMilestone {
  year: string;
  title: string;
  description: string;
  skills: string[];
  icon: 'briefcase' | 'graduation' | 'award' | 'star';
}

interface CareerPath {
  name: string;
  description: string;
  milestones: CareerMilestone[];
  recommended: boolean;
}

// MBTIタイプ別のキャリアパスデータ
const CAREER_PATHS: Record<string, CareerPath[]> = {
  // 分析家グループ
  INTJ: [
    {
      name: 'スペシャリストルート',
      description: '専門看護師・認定看護師として高度な専門性を追求',
      recommended: true,
      milestones: [
        { year: '現在', title: '臨床経験を積む', description: '高度急性期病棟でスキルアップ', skills: ['アセスメント力', '論理的思考'], icon: 'briefcase' },
        { year: '3年後', title: '認定看護師資格取得', description: '集中ケアや救急看護など専門分野を選択', skills: ['専門知識', '臨床判断'], icon: 'graduation' },
        { year: '5年後', title: '大学院進学', description: '専門看護師（CNS）を目指し学術的知識を深める', skills: ['研究力', 'エビデンス活用'], icon: 'graduation' },
        { year: '10年後', title: '専門看護師として活躍', description: 'コンサルテーション・研究・教育をリード', skills: ['リーダーシップ', '後進指導'], icon: 'award' },
      ],
    },
    {
      name: '管理職ルート',
      description: '看護管理者として組織をマネジメント',
      recommended: false,
      milestones: [
        { year: '現在', title: '病棟業務でリーダー経験', description: 'チームマネジメントの基礎を学ぶ', skills: ['調整力', '業務管理'], icon: 'briefcase' },
        { year: '3年後', title: '副師長・主任に昇進', description: 'スタッフ管理とシフト調整を担当', skills: ['人材管理', '問題解決'], icon: 'star' },
        { year: '5年後', title: '認定看護管理者資格取得', description: '看護管理の専門教育を修了', skills: ['経営視点', '組織運営'], icon: 'graduation' },
        { year: '10年後', title: '看護師長・副看護部長', description: '部署全体のマネジメントを担う', skills: ['戦略立案', '人材育成'], icon: 'award' },
      ],
    },
  ],
  INTP: [
    {
      name: '研究・教育ルート',
      description: '看護研究や教育分野で知識を活かす',
      recommended: true,
      milestones: [
        { year: '現在', title: '臨床でデータ収集', description: '現場の課題を研究テーマに発展', skills: ['観察力', '分析力'], icon: 'briefcase' },
        { year: '3年後', title: '大学院進学（修士）', description: '看護研究の方法論を体系的に学ぶ', skills: ['研究デザイン', '統計解析'], icon: 'graduation' },
        { year: '5年後', title: '臨床研究コーディネーター', description: 'CRCとして治験・臨床研究に従事', skills: ['プロトコル管理', '倫理審査'], icon: 'star' },
        { year: '10年後', title: '大学教員・研究者', description: '看護学の発展に貢献', skills: ['論文執筆', '学会発表'], icon: 'award' },
      ],
    },
    {
      name: 'IT・医療情報ルート',
      description: '医療情報システムや看護記録の最適化',
      recommended: false,
      milestones: [
        { year: '現在', title: '電子カルテ活用', description: 'システムの改善点を発見', skills: ['ITリテラシー', '業務分析'], icon: 'briefcase' },
        { year: '3年後', title: '医療情報技師資格取得', description: '医療情報の専門知識を習得', skills: ['データベース', 'セキュリティ'], icon: 'graduation' },
        { year: '5年後', title: 'システム導入担当', description: '電子カルテ導入プロジェクトに参画', skills: ['プロジェクト管理', '要件定義'], icon: 'star' },
        { year: '10年後', title: '医療情報部門リーダー', description: 'DX推進を牽引', skills: ['戦略立案', 'ベンダー折衝'], icon: 'award' },
      ],
    },
  ],
  ENTJ: [
    {
      name: '看護管理者ルート',
      description: '病院経営・看護部門のトップを目指す',
      recommended: true,
      milestones: [
        { year: '現在', title: 'リーダー・プリセプター', description: 'チーム運営と後輩指導の経験', skills: ['リーダーシップ', '指導力'], icon: 'briefcase' },
        { year: '3年後', title: '主任・副師長', description: '病棟運営の実務を担当', skills: ['業務改善', 'スタッフ管理'], icon: 'star' },
        { year: '5年後', title: '看護師長', description: '病棟全体のマネジメント', skills: ['経営感覚', '人事評価'], icon: 'award' },
        { year: '10年後', title: '看護部長・副院長', description: '病院経営に参画', skills: ['経営戦略', '組織改革'], icon: 'award' },
      ],
    },
    {
      name: '起業・コンサルルート',
      description: '訪問看護ステーション経営や医療コンサル',
      recommended: false,
      milestones: [
        { year: '現在', title: '多様な臨床経験', description: '急性期・慢性期・在宅など幅広く経験', skills: ['臨床力', '適応力'], icon: 'briefcase' },
        { year: '3年後', title: '訪問看護で独立準備', description: '在宅医療の実務と経営を学ぶ', skills: ['在宅ケア', '事業計画'], icon: 'graduation' },
        { year: '5年後', title: '訪問看護ステーション開設', description: '自身の理想とする看護を実現', skills: ['起業', '資金調達'], icon: 'star' },
        { year: '10年後', title: '複数拠点展開', description: '地域医療に貢献する事業を拡大', skills: ['経営', '人材確保'], icon: 'award' },
      ],
    },
  ],
  ENTP: [
    {
      name: 'イノベータールート',
      description: '新しい看護サービスや医療ビジネスを創出',
      recommended: true,
      milestones: [
        { year: '現在', title: '多様な現場を経験', description: '様々な部署で課題を発見', skills: ['課題発見力', '柔軟性'], icon: 'briefcase' },
        { year: '3年後', title: '業務改善プロジェクト', description: 'IT活用や新しい仕組みを提案', skills: ['企画力', 'プレゼン'], icon: 'star' },
        { year: '5年後', title: 'ヘルスケアベンチャー参画', description: 'スタートアップで新サービス開発', skills: ['ビジネス開発', 'マーケティング'], icon: 'graduation' },
        { year: '10年後', title: '医療イノベーター', description: '新しい医療・看護の形を創造', skills: ['事業創造', '資金調達'], icon: 'award' },
      ],
    },
    {
      name: '教育・コンサルルート',
      description: '看護教育や医療コンサルティング',
      recommended: false,
      milestones: [
        { year: '現在', title: 'プリセプター・指導者', description: '後輩育成で教育スキルを磨く', skills: ['指導力', 'コミュニケーション'], icon: 'briefcase' },
        { year: '3年後', title: '院内教育担当', description: '研修企画・運営を担当', skills: ['カリキュラム設計', 'ファシリテーション'], icon: 'star' },
        { year: '5年後', title: '外部講師・研修講師', description: '複数施設で教育活動', skills: ['講義力', 'コンテンツ開発'], icon: 'graduation' },
        { year: '10年後', title: '医療コンサルタント', description: '組織改善・人材育成のプロ', skills: ['コンサルティング', '経営支援'], icon: 'award' },
      ],
    },
  ],
  // 外交官グループ
  INFJ: [
    {
      name: '緩和ケア・心理支援ルート',
      description: '患者さんの心に寄り添う専門家へ',
      recommended: true,
      milestones: [
        { year: '現在', title: '終末期ケアの経験', description: 'ホスピス・緩和ケア病棟で学ぶ', skills: ['傾聴', '共感'], icon: 'briefcase' },
        { year: '3年後', title: '緩和ケア認定看護師', description: '専門的な緩和ケアスキルを取得', skills: ['症状マネジメント', 'グリーフケア'], icon: 'graduation' },
        { year: '5年後', title: '緩和ケアチームリーダー', description: '多職種チームをコーディネート', skills: ['チーム連携', '意思決定支援'], icon: 'star' },
        { year: '10年後', title: 'がん看護専門看護師', description: '患者・家族の心理支援のエキスパート', skills: ['カウンセリング', '倫理調整'], icon: 'award' },
      ],
    },
    {
      name: '精神科・心療内科ルート',
      description: 'メンタルヘルスケアの専門家',
      recommended: false,
      milestones: [
        { year: '現在', title: '精神科での臨床経験', description: '精神疾患患者のケアを学ぶ', skills: ['観察力', '治療的コミュニケーション'], icon: 'briefcase' },
        { year: '3年後', title: '精神科認定看護師', description: '精神看護の専門資格を取得', skills: ['精神療法', '危機介入'], icon: 'graduation' },
        { year: '5年後', title: 'リエゾンナース', description: '一般病棟の精神的問題に対応', skills: ['コンサルテーション', '多職種連携'], icon: 'star' },
        { year: '10年後', title: '精神看護専門看護師', description: '組織全体のメンタルヘルス支援', skills: ['組織支援', '政策提言'], icon: 'award' },
      ],
    },
  ],
  INFP: [
    {
      name: '訪問看護・在宅ケアルート',
      description: '患者さんの生活に寄り添う看護',
      recommended: true,
      milestones: [
        { year: '現在', title: '病棟で基礎を固める', description: '幅広い疾患のケアを経験', skills: ['基礎看護力', 'アセスメント'], icon: 'briefcase' },
        { year: '3年後', title: '訪問看護へ転職', description: '在宅での患者さんとの関わり', skills: ['在宅ケア', '家族支援'], icon: 'star' },
        { year: '5年後', title: '訪問看護のリーダー', description: 'チームをまとめ質の高いケアを提供', skills: ['ケアマネジメント', '地域連携'], icon: 'graduation' },
        { year: '10年後', title: '訪問看護ステーション管理者', description: '自分の理想とする看護を実現', skills: ['経営', '人材育成'], icon: 'award' },
      ],
    },
    {
      name: 'ホスピス・終末期ケアルート',
      description: '人生の最期に寄り添う看護',
      recommended: false,
      milestones: [
        { year: '現在', title: '終末期患者のケア経験', description: '看取りの経験を積む', skills: ['緩和ケア', '傾聴'], icon: 'briefcase' },
        { year: '3年後', title: 'ホスピスへ転職', description: '緩和ケア専門施設で学ぶ', skills: ['疼痛管理', 'スピリチュアルケア'], icon: 'star' },
        { year: '5年後', title: '緩和ケア認定看護師', description: '専門的スキルを取得', skills: ['症状マネジメント', 'グリーフケア'], icon: 'graduation' },
        { year: '10年後', title: 'ホスピスケアのエキスパート', description: '地域の緩和ケアを牽引', skills: ['教育', 'コンサルテーション'], icon: 'award' },
      ],
    },
  ],
  ENFJ: [
    {
      name: '教育者・指導者ルート',
      description: '後輩育成と看護教育のプロフェッショナル',
      recommended: true,
      milestones: [
        { year: '現在', title: 'プリセプター経験', description: '新人指導で教育スキルを磨く', skills: ['指導力', 'コミュニケーション'], icon: 'briefcase' },
        { year: '3年後', title: '教育担当・実習指導者', description: '院内教育や学生指導を担当', skills: ['カリキュラム設計', 'ファシリテーション'], icon: 'star' },
        { year: '5年後', title: '大学院で教育学を学ぶ', description: '看護教育の専門性を深める', skills: ['教育理論', '研究'], icon: 'graduation' },
        { year: '10年後', title: '看護学校教員・大学教員', description: '次世代の看護師を育てる', skills: ['講義', '学生指導'], icon: 'award' },
      ],
    },
    {
      name: '看護管理者ルート',
      description: 'スタッフを大切にする管理者',
      recommended: false,
      milestones: [
        { year: '現在', title: 'チームリーダー', description: 'スタッフのモチベーション管理', skills: ['傾聴', 'チームビルディング'], icon: 'briefcase' },
        { year: '3年後', title: '主任・副師長', description: 'スタッフの成長を支援', skills: ['人材育成', 'メンタリング'], icon: 'star' },
        { year: '5年後', title: '看護師長', description: '働きやすい職場環境を作る', skills: ['組織開発', '労務管理'], icon: 'graduation' },
        { year: '10年後', title: '看護部門のリーダー', description: 'スタッフが輝ける組織を実現', skills: ['ビジョン構築', '変革推進'], icon: 'award' },
      ],
    },
  ],
  ENFP: [
    {
      name: '地域・在宅看護ルート',
      description: '地域に根ざした健康支援活動',
      recommended: true,
      milestones: [
        { year: '現在', title: '病棟で幅広い経験', description: '多様な患者さんと関わる', skills: ['コミュニケーション', '適応力'], icon: 'briefcase' },
        { year: '3年後', title: '訪問看護・地域連携室', description: '地域とのつながりを深める', skills: ['地域連携', 'ケースマネジメント'], icon: 'star' },
        { year: '5年後', title: '保健師資格取得', description: '地域保健活動のスキルを習得', skills: ['健康教育', '疫学'], icon: 'graduation' },
        { year: '10年後', title: '地域保健のリーダー', description: '健康づくり事業を企画・推進', skills: ['事業企画', 'アドボカシー'], icon: 'award' },
      ],
    },
    {
      name: '健康教育・産業保健ルート',
      description: '企業や学校での健康支援',
      recommended: false,
      milestones: [
        { year: '現在', title: '患者教育の経験', description: '指導スキルを磨く', skills: ['プレゼン', '教材作成'], icon: 'briefcase' },
        { year: '3年後', title: '健康教育担当', description: '院内外での健康講座を担当', skills: ['企画力', 'ファシリテーション'], icon: 'star' },
        { year: '5年後', title: '産業保健師', description: '企業の健康経営を支援', skills: ['メンタルヘルス', '労働衛生'], icon: 'graduation' },
        { year: '10年後', title: '健康経営コンサルタント', description: '複数企業の健康支援', skills: ['コンサルティング', '事業開発'], icon: 'award' },
      ],
    },
  ],
  // 番人グループ
  ISTJ: [
    {
      name: '専門性追求ルート',
      description: '一つの分野を極める職人タイプ',
      recommended: true,
      milestones: [
        { year: '現在', title: '専門病棟での経験', description: '特定分野のスキルを磨く', skills: ['正確性', '手技'], icon: 'briefcase' },
        { year: '3年後', title: '認定看護師資格取得', description: '手術室・ICU・透析など専門分野', skills: ['専門知識', '技術力'], icon: 'graduation' },
        { year: '5年後', title: '部署のエキスパート', description: '後輩指導・マニュアル整備', skills: ['標準化', '教育'], icon: 'star' },
        { year: '10年後', title: '専門分野のリーダー', description: '院内外で頼られる存在に', skills: ['コンサルテーション', '品質管理'], icon: 'award' },
      ],
    },
    {
      name: '医療安全・感染管理ルート',
      description: 'リスク管理と安全文化の構築',
      recommended: false,
      milestones: [
        { year: '現在', title: '院内ルールの徹底', description: '安全意識を高める', skills: ['リスク感性', '遵守力'], icon: 'briefcase' },
        { year: '3年後', title: '医療安全・感染対策委員', description: '組織的な安全活動に参画', skills: ['データ分析', 'インシデント対応'], icon: 'star' },
        { year: '5年後', title: '感染管理認定看護師', description: '専門資格を取得', skills: ['感染対策', 'サーベイランス'], icon: 'graduation' },
        { year: '10年後', title: '医療安全管理者', description: '病院全体の安全を守る', skills: ['システム構築', '文化醸成'], icon: 'award' },
      ],
    },
  ],
  ISFJ: [
    {
      name: '慢性期・回復期ケアルート',
      description: '患者さんとじっくり向き合う看護',
      recommended: true,
      milestones: [
        { year: '現在', title: '急性期で基礎を固める', description: '幅広いケアスキルを習得', skills: ['基礎看護', 'アセスメント'], icon: 'briefcase' },
        { year: '3年後', title: '回復期・慢性期病棟へ', description: '長期的な患者さんとの関わり', skills: ['退院支援', 'ADL評価'], icon: 'star' },
        { year: '5年後', title: '慢性疾患看護認定看護師', description: '糖尿病や心不全など専門分野', skills: ['患者教育', '自己管理支援'], icon: 'graduation' },
        { year: '10年後', title: '慢性期ケアのエキスパート', description: '地域包括ケアの中核として活躍', skills: ['多職種連携', '在宅移行支援'], icon: 'award' },
      ],
    },
    {
      name: '外来・クリニックルート',
      description: '地域の患者さんの健康を支える',
      recommended: false,
      milestones: [
        { year: '現在', title: '病棟での経験を積む', description: '様々な疾患のケアを学ぶ', skills: ['臨床判断', '対応力'], icon: 'briefcase' },
        { year: '3年後', title: '外来部門へ異動', description: '継続的な患者さんとの関わり', skills: ['外来看護', 'トリアージ'], icon: 'star' },
        { year: '5年後', title: '専門外来担当', description: '特定疾患の患者さんをフォロー', skills: ['専門知識', '患者教育'], icon: 'graduation' },
        { year: '10年後', title: 'クリニック看護師長', description: '地域のかかりつけとして信頼される', skills: ['経営', '地域連携'], icon: 'award' },
      ],
    },
  ],
  ESTJ: [
    {
      name: '看護管理者ルート',
      description: '組織をまとめ効率的に運営',
      recommended: true,
      milestones: [
        { year: '現在', title: 'リーダー業務を担当', description: 'チーム運営の基礎を学ぶ', skills: ['統率力', '業務管理'], icon: 'briefcase' },
        { year: '3年後', title: '主任・副師長に昇進', description: '病棟運営の実務を担う', skills: ['人事管理', 'シフト調整'], icon: 'star' },
        { year: '5年後', title: '看護師長', description: '病棟全体のマネジメント', skills: ['経営感覚', '目標管理'], icon: 'graduation' },
        { year: '10年後', title: '看護部長・副院長', description: '病院経営に参画', skills: ['経営戦略', '人材開発'], icon: 'award' },
      ],
    },
    {
      name: '急性期・救急ルート',
      description: 'スピード感のある現場で力を発揮',
      recommended: false,
      milestones: [
        { year: '現在', title: '急性期病棟で経験', description: '迅速な判断と対応力を磨く', skills: ['救急対応', '優先順位'], icon: 'briefcase' },
        { year: '3年後', title: '救急外来・ICUへ', description: '重症患者のケアスキルを習得', skills: ['クリティカルケア', '機器管理'], icon: 'star' },
        { year: '5年後', title: '救急看護認定看護師', description: '専門資格を取得', skills: ['トリアージ', '災害看護'], icon: 'graduation' },
        { year: '10年後', title: '救急部門のリーダー', description: '救急医療体制の構築に貢献', skills: ['システム構築', '人材育成'], icon: 'award' },
      ],
    },
  ],
  ESFJ: [
    {
      name: '病棟リーダー・指導者ルート',
      description: 'チームをまとめ後輩を育てる',
      recommended: true,
      milestones: [
        { year: '現在', title: 'プリセプター経験', description: '新人指導でスキルを磨く', skills: ['指導力', 'コミュニケーション'], icon: 'briefcase' },
        { year: '3年後', title: 'チームリーダー', description: 'チームをまとめる役割', skills: ['調整力', 'モチベーション管理'], icon: 'star' },
        { year: '5年後', title: '教育担当・副師長', description: '教育体制の構築', skills: ['教育企画', '人材育成'], icon: 'graduation' },
        { year: '10年後', title: '看護師長', description: 'スタッフが働きやすい環境を作る', skills: ['組織運営', 'メンタルヘルス'], icon: 'award' },
      ],
    },
    {
      name: '透析・外来ルート',
      description: '継続的な患者さんとの関係を築く',
      recommended: false,
      milestones: [
        { year: '現在', title: '病棟で基礎を固める', description: '幅広い看護スキルを習得', skills: ['基礎看護', '患者対応'], icon: 'briefcase' },
        { year: '3年後', title: '透析室へ異動', description: '専門技術と長期的な関係構築', skills: ['透析技術', '患者教育'], icon: 'star' },
        { year: '5年後', title: '透析看護認定看護師', description: '専門資格を取得', skills: ['バスキュラーアクセス管理', 'CKD教育'], icon: 'graduation' },
        { year: '10年後', title: '透析部門のリーダー', description: '患者さんのQOL向上に貢献', skills: ['チーム管理', '医療連携'], icon: 'award' },
      ],
    },
  ],
  // 探検家グループ
  ISTP: [
    {
      name: '手術室・ICUルート',
      description: '高度な技術を追求する職人',
      recommended: true,
      milestones: [
        { year: '現在', title: '急性期病棟で経験', description: '基礎スキルと機器の扱いを学ぶ', skills: ['技術力', '冷静さ'], icon: 'briefcase' },
        { year: '3年後', title: '手術室・ICUへ異動', description: '専門的な技術を習得', skills: ['器械出し', 'モニタリング'], icon: 'star' },
        { year: '5年後', title: '手術看護認定看護師', description: '専門資格を取得', skills: ['周術期管理', '麻酔看護'], icon: 'graduation' },
        { year: '10年後', title: '手術室・ICUのエキスパート', description: '高度医療の現場をリード', skills: ['技術指導', 'システム改善'], icon: 'award' },
      ],
    },
    {
      name: '救急・災害医療ルート',
      description: '緊急事態で力を発揮',
      recommended: false,
      milestones: [
        { year: '現在', title: '救急対応の経験', description: '急変時の対応力を磨く', skills: ['BLS/ACLS', '判断力'], icon: 'briefcase' },
        { year: '3年後', title: '救急外来・ドクターカー', description: '最前線での経験を積む', skills: ['トリアージ', '外傷対応'], icon: 'star' },
        { year: '5年後', title: '救急看護認定看護師', description: '専門資格を取得', skills: ['災害看護', 'DMAT'], icon: 'graduation' },
        { year: '10年後', title: '救急医療のリーダー', description: '地域の救急体制構築に貢献', skills: ['システム構築', '人材育成'], icon: 'award' },
      ],
    },
  ],
  ISFP: [
    {
      name: '訪問看護・在宅ケアルート',
      description: '患者さんの生活に寄り添う',
      recommended: true,
      milestones: [
        { year: '現在', title: '病棟で基礎を固める', description: '幅広い看護スキルを習得', skills: ['観察力', '柔軟性'], icon: 'briefcase' },
        { year: '3年後', title: '訪問看護へ転職', description: '在宅での個別ケアを学ぶ', skills: ['在宅ケア', '家族支援'], icon: 'star' },
        { year: '5年後', title: '訪問看護のエキスパート', description: '複雑なケースも対応', skills: ['ケアマネジメント', '多職種連携'], icon: 'graduation' },
        { year: '10年後', title: '訪問看護ステーション管理者', description: '地域の在宅医療を支える', skills: ['経営', '人材育成'], icon: 'award' },
      ],
    },
    {
      name: '小児・NICUルート',
      description: '子どもたちのケアに特化',
      recommended: false,
      milestones: [
        { year: '現在', title: '小児科病棟で経験', description: '小児看護の基礎を学ぶ', skills: ['発達理解', '家族ケア'], icon: 'briefcase' },
        { year: '3年後', title: 'NICU・PICUへ', description: '重症小児のケアスキル', skills: ['新生児ケア', '家族支援'], icon: 'star' },
        { year: '5年後', title: '新生児集中ケア認定看護師', description: '専門資格を取得', skills: ['発達支援', 'ファミリーケア'], icon: 'graduation' },
        { year: '10年後', title: '小児看護のエキスパート', description: '子どもと家族を支える', skills: ['教育', 'コンサルテーション'], icon: 'award' },
      ],
    },
  ],
  ESTP: [
    {
      name: '救命救急ルート',
      description: '最前線で命を救う',
      recommended: true,
      milestones: [
        { year: '現在', title: '急性期で経験を積む', description: '迅速な判断力を磨く', skills: ['救急対応', '行動力'], icon: 'briefcase' },
        { year: '3年後', title: '救命救急センターへ', description: '重症外傷・急病の対応', skills: ['クリティカルケア', '外傷看護'], icon: 'star' },
        { year: '5年後', title: 'ドクターヘリ・DMAT', description: '最前線で活躍', skills: ['プレホスピタル', '災害医療'], icon: 'graduation' },
        { year: '10年後', title: '救急医療のリーダー', description: '地域の救急体制を牽引', skills: ['システム構築', '人材育成'], icon: 'award' },
      ],
    },
    {
      name: '冒険的キャリアルート',
      description: '海外や特殊な環境での看護',
      recommended: false,
      milestones: [
        { year: '現在', title: '多様な経験を積む', description: '様々な状況に対応できる力', skills: ['適応力', '語学'], icon: 'briefcase' },
        { year: '3年後', title: '国際医療支援に参加', description: 'NGOや国際機関での活動', skills: ['国際看護', '異文化理解'], icon: 'star' },
        { year: '5年後', title: '海外での看護経験', description: '外国の医療現場で活躍', skills: ['英語', 'グローバル視点'], icon: 'graduation' },
        { year: '10年後', title: '国際医療のプロフェッショナル', description: '世界で活躍する看護師', skills: ['リーダーシップ', '国際ネットワーク'], icon: 'award' },
      ],
    },
  ],
  ESFP: [
    {
      name: '小児・リハビリルート',
      description: '明るさを活かしたケア',
      recommended: true,
      milestones: [
        { year: '現在', title: '患者さんとの関わり重視', description: 'コミュニケーション力を磨く', skills: ['社交性', 'ムードメーカー'], icon: 'briefcase' },
        { year: '3年後', title: '小児科・リハビリ病棟へ', description: '患者さんを笑顔にするケア', skills: ['レクリエーション', '動機づけ'], icon: 'star' },
        { year: '5年後', title: '療養環境の専門家', description: 'アクティビティケアを推進', skills: ['企画力', 'チームワーク'], icon: 'graduation' },
        { year: '10年後', title: 'ケアの質向上リーダー', description: '患者体験を高める取り組み', skills: ['患者満足', 'サービス向上'], icon: 'award' },
      ],
    },
    {
      name: 'デイサービス・介護ルート',
      description: '高齢者の生活を支える',
      recommended: false,
      milestones: [
        { year: '現在', title: '高齢者ケアの経験', description: 'コミュニケーション力を活かす', skills: ['傾聴', '共感'], icon: 'briefcase' },
        { year: '3年後', title: 'デイサービスへ転職', description: 'レクリエーションや活動支援', skills: ['企画力', 'ファシリテーション'], icon: 'star' },
        { year: '5年後', title: '介護施設の看護リーダー', description: '施設の看護体制を構築', skills: ['多職種連携', '看取りケア'], icon: 'graduation' },
        { year: '10年後', title: '高齢者ケアのエキスパート', description: '地域の高齢者を支える', skills: ['認知症ケア', '地域連携'], icon: 'award' },
      ],
    },
  ],
};

// デフォルトのキャリアパス（タイプが見つからない場合）
const DEFAULT_CAREER_PATHS: CareerPath[] = [
  {
    name: 'ジェネラリストルート',
    description: '幅広い経験を活かした総合的な看護師',
    recommended: true,
    milestones: [
      { year: '現在', title: '臨床経験を積む', description: '様々な部署で経験を重ねる', skills: ['基礎看護', '適応力'], icon: 'briefcase' },
      { year: '3年後', title: 'チームリーダー', description: 'チームをまとめる役割', skills: ['調整力', 'コミュニケーション'], icon: 'star' },
      { year: '5年後', title: '専門分野の選択', description: '自分に合った分野を見つける', skills: ['専門性', '自己理解'], icon: 'graduation' },
      { year: '10年後', title: 'キャリアの確立', description: '自分らしい看護を実現', skills: ['エキスパート', 'メンター'], icon: 'award' },
    ],
  },
];

const IconComponent = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'briefcase':
      return <Briefcase className="w-5 h-5" />;
    case 'graduation':
      return <GraduationCap className="w-5 h-5" />;
    case 'award':
      return <Award className="w-5 h-5" />;
    case 'star':
      return <Star className="w-5 h-5" />;
    default:
      return <Briefcase className="w-5 h-5" />;
  }
};

interface MBTICareerPathProps {
  mbtiType: string;
}

export function MBTICareerPath({ mbtiType }: MBTICareerPathProps) {
  const careerPaths = CAREER_PATHS[mbtiType] || DEFAULT_CAREER_PATHS;
  const [selectedPath, setSelectedPath] = useState(0);
  const currentPath = careerPaths[selectedPath];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-teal-500" />
        <h3 className="font-bold text-lg text-slate-800">あなたのキャリアパス</h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        {mbtiType}タイプのあなたに適したキャリアルートを提案します。
      </p>

      {/* パス選択タブ */}
      <div className="flex gap-2 mb-6">
        {careerPaths.map((path, index) => (
          <button
            key={index}
            onClick={() => setSelectedPath(index)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPath === index
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {path.recommended && <span className="mr-1">⭐</span>}
            {path.name}
          </button>
        ))}
      </div>

      {/* 選択されたパスの説明 */}
      <div className="bg-teal-50 rounded-lg p-3 mb-6">
        <p className="text-sm text-teal-800">{currentPath.description}</p>
      </div>

      {/* タイムライン */}
      <div className="relative">
        {currentPath.milestones.map((milestone, index) => (
          <div key={index} className="flex gap-4 mb-6 last:mb-0">
            {/* 左側：年数と線 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                <IconComponent icon={milestone.icon} />
              </div>
              {index < currentPath.milestones.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 my-2" />
              )}
            </div>

            {/* 右側：コンテンツ */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded">
                  {milestone.year}
                </span>
                <h4 className="font-semibold text-slate-800">{milestone.title}</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">{milestone.description}</p>
              <div className="flex flex-wrap gap-1">
                {milestone.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* フッターメッセージ */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500 text-center">
          ※ これは一般的なキャリアパスの例です。あなた自身の状況に合わせてアレンジしてください。
        </p>
      </div>
    </div>
  );
}
