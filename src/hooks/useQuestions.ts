import { useState, useEffect } from 'react';
import { Question } from '../types';

const STORAGE_KEY = 'medconsult_questions';
const LIKED_QUESTIONS_KEY = 'medconsult_liked_questions';

// 名前からauthorIdを推定する関数
const getAuthorIdByName = (authorName: string): string | undefined => {
  const nameToIdMap: { [key: string]: string } = {
    '田中 美咲': 'user1',
    '佐藤 健太': 'user2', 
    '山田 花子': 'user3',
    '鈴木 健一': 'user4',
    '山本 美沙': 'user5',
    '伊藤 雄一': 'user6',
    '加藤 綾': 'user7',
    '佐々木 明': 'user8',
    '林 恵子': 'user9',
    '渡辺 直樹': 'user10',
    '清水 智子': 'user11',
    '森田 和也': 'user12',
    '高橋 麻衣': 'user13',
    '中村 浩二': 'user14',
    '石井 美紀': 'user15',
    '小林 健治': 'user16',
    '三浦 由美': 'user17',
    '吉田 正明': 'user18',
    '松本 信子': 'user19',
    '岡田 慎一': 'user20'
  };
  return nameToIdMap[authorName];
};

// デモデータの強制リセット機能（開発用）
const forceResetToNewData = () => {
  console.log('📊 新しいデモデータ（20件）を強制読み込み中...');
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY + '_version');
  localStorage.removeItem(LIKED_QUESTIONS_KEY);
  return true;
};

const initialQuestions: Question[] = [
  {
    id: '1',
    title: '高齢患者の脆弱な血管へのIV挿入の困難について',
    content: '高齢患者の非常に脆弱な血管へのIV挿入に苦労しています。最小ゲージの針を使用しても血管が破れやすく、成功率を向上させ、患者の不快感を軽減するための技術を探しています。',
    author: '田中 美咲',
    authorRole: '看護師',
    authorId: 'user1',
    timeAgo: '2時間前',
    likes: 24,
    answers: 8,
    tags: ['ルート確保', '高齢者ケア', '脆弱血管'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: '小児の静脈穿刺時のトラウマを最小化するベストプラクティス',
    content: '小児科で働いており、採血に対して極度に不安を感じる子供たちによく遭遇します。3-12歳の子供の静脈穿刺時の不安と身体的不快感を軽減する最も効果的な技術は何でしょうか？',
    author: '佐藤 健太',
    authorRole: '小児科医',
    authorId: 'user2',
    timeAgo: '4時間前',
    likes: 31,
    answers: 12,
    tags: ['採血', '小児科', '不安管理'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: '動脈穿刺の合併症と予防戦略について',
    content: '最近、動脈穿刺により重大な血腫形成を起こした症例がありました。このような合併症を予防し、発生時に管理するためのベストプラクティスは何でしょうか？',
    author: '山田 花子',
    authorRole: '臨床検査技師',
    authorId: 'user3',
    timeAgo: '6時間前',
    likes: 18,
    answers: 5,
    tags: ['動脈穿刺', '合併症', '予防'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: '血管迷走神経反射を起こしやすい患者への採血対策',
    content: '採血時に血管迷走神経反射（VVR）を起こしやすい患者にどのような前処置や配慮をしていますか？特に若い男性患者で多く見られます。',
    author: '鈴木 健一',
    authorRole: '臨床検査技師',
    authorId: 'user4',
    timeAgo: '8時間前',
    likes: 15,
    answers: 7,
    tags: ['採血', 'VVR', '患者ケア'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: '肥満患者への筋肉注射時の注射針の長さ選択',
    content: 'BMI35以上の肥満患者への三角筋筋注時、注射針の長さをどう選択していますか？1インチでは筋肉に届かない場合があります。',
    author: '山本 美沙',
    authorRole: '看護師',
    authorId: 'user5',
    timeAgo: '12時間前',
    likes: 22,
    answers: 9,
    tags: ['注射', '肥満患者', '筋肉注射'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: '6',
    title: '透析患者のシャント肢での採血・注射について',
    content: '血液透析患者のシャント肢での採血や注射は避けるべきですが、緊急時にやむを得ない場合の注意点を教えてください。',
    author: '伊藤 雄一',
    authorRole: '医師',
    authorId: 'user6',
    timeAgo: '1日前',
    likes: 33,
    answers: 14,
    tags: ['採血', '透析患者', 'シャント'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: '7',
    title: '新生児のかかと採血で十分な血液量を得るコツ',
    content: 'NICU勤務です。新生児のかかと採血で血液が出にくい場合があります。温罨法以外で血液量を確保する方法はありますか？',
    author: '加藤 綾',
    authorRole: '看護師',
    authorId: 'user7',
    timeAgo: '1日前',
    likes: 19,
    answers: 6,
    tags: ['採血', '新生児', 'NICU'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000)
  },
  {
    id: '8',
    title: '手背静脈への点滴ルート確保時の固定方法',
    content: '手背静脈にルート確保した際の固定方法で、患者の快適性と確実性を両立させる方法を教えてください。テープかぶれも心配です。',
    author: '佐々木 明',
    authorRole: '看護師',
    authorId: 'user8',
    timeAgo: '1日前',
    likes: 27,
    answers: 11,
    tags: ['ルート確保', '固定', '手背静脈'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000)
  },
  {
    id: '9',
    title: 'ワクチン接種時の注射部位の選択基準',
    content: 'インフルエンザワクチンやCOVID-19ワクチン接種で、三角筋のどの部位に注射するのが最適でしょうか？痛みを軽減する方法も知りたいです。',
    author: '林 恵子',
    authorRole: '看護師',
    authorId: 'user9',
    timeAgo: '2日前',
    likes: 41,
    answers: 18,
    tags: ['注射', 'ワクチン', '三角筋'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '10',
    title: '化学療法患者の血管アクセス困難への対策',
    content: '化学療法を繰り返している患者の血管が硬化し、採血やルート確保が困難になっています。血管を傷めずに穿刺する方法はありますか？',
    author: '渡辺 直樹',
    authorRole: '医師',
    authorId: 'user10',
    timeAgo: '2日前',
    likes: 29,
    answers: 13,
    tags: ['ルート確保', '化学療法', '血管硬化'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
  },
  {
    id: '11',
    title: '血液培養採血時の汚染防止対策',
    content: '血液培養の採血で汚染率を下げるための手技のポイントを教えてください。消毒方法や採血順序で注意すべき点はありますか？',
    author: '清水 智子',
    authorRole: '臨床検査技師',
    authorId: 'user11',
    timeAgo: '3日前',
    likes: 35,
    answers: 15,
    tags: ['採血', '血液培養', '感染対策'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: '12',
    title: '認知症患者への注射時の不穏対策',
    content: '認知症患者への注射で不穏になる場合の対処法を教えてください。安全に注射を完了させる方法はありますか？',
    author: '森田 和也',
    authorRole: '看護師',
    authorId: 'user12',
    timeAgo: '3日前',
    likes: 23,
    answers: 8,
    tags: ['注射', '認知症', '不穏対策'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000)
  },
  {
    id: '13',
    title: '橈骨動脈穿刺での失敗を減らすテクニック',
    content: '動脈血ガス採取で橈骨動脈穿刺の成功率を上げたいです。触診のコツや穿刺角度について教えてください。',
    author: '高橋 麻衣',
    authorRole: '臨床検査技師',
    authorId: 'user13',
    timeAgo: '4日前',
    likes: 38,
    answers: 16,
    tags: ['動脈穿刺', '橈骨動脈', 'ABG'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: '14',
    title: '末梢静脈ルートの血管選択の優先順位',
    content: '末梢静脈ルート確保時の血管選択で、どの部位から順番に試していますか？患者負担を最小限にする戦略を知りたいです。',
    author: '中村 浩二',
    authorRole: '看護師',
    authorId: 'user14',
    timeAgo: '4日前',
    likes: 31,
    answers: 12,
    tags: ['ルート確保', '血管選択', '末梢静脈'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)
  },
  {
    id: '15',
    title: '皮下注射での薬液漏れ防止策',
    content: 'インスリンやヘパリンの皮下注射で薬液が漏れ出ることがあります。確実に皮下に注入するコツを教えてください。',
    author: '石井 美紀',
    authorRole: '看護師',
    authorId: 'user15',
    timeAgo: '5日前',
    likes: 26,
    answers: 10,
    tags: ['注射', '皮下注射', 'インスリン'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '16',
    title: '採血困難患者への超音波ガイド下穿刺',
    content: '採血困難患者に超音波ガイド下での穿刺を導入したいと考えています。機器選択や手技習得のポイントを教えてください。',
    author: '小林 健治',
    authorRole: '医師',
    authorId: 'user16',
    timeAgo: '5日前',
    likes: 44,
    answers: 19,
    tags: ['採血', '超音波ガイド', '穿刺困難'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000)
  },
  {
    id: '17',
    title: '抗凝固薬内服患者の採血後止血管理',
    content: 'ワーファリンやDOAC内服患者の採血後、止血に時間がかかります。適切な圧迫時間と止血確認のポイントは？',
    author: '三浦 由美',
    authorRole: '臨床検査技師',
    authorId: 'user17',
    timeAgo: '6日前',
    likes: 32,
    answers: 14,
    tags: ['採血', '抗凝固薬', '止血'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    id: '18',
    title: '点滴漏れ早期発見のためのチェックポイント',
    content: '点滴の血管外漏出を早期に発見するためのチェックポイントを教えてください。特に皮膚トラブルを避けたいです。',
    author: '吉田 正明',
    authorRole: '看護師',
    authorId: 'user18',
    timeAgo: '6日前',
    likes: 28,
    answers: 11,
    tags: ['ルート確保', '血管外漏出', 'その他'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000)
  },
  {
    id: '19',
    title: '注射針事故防止のための安全対策',
    content: '注射針刺し事故を防ぐための具体的な対策と、万が一事故が起きた場合の対処法について教えてください。',
    author: '松本 信子',
    authorRole: '看護師',
    authorId: 'user19',
    timeAgo: '1週間前',
    likes: 47,
    answers: 21,
    tags: ['注射', '安全対策', 'その他'],
    hasAcceptedAnswer: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '20',
    title: '緊急時の外頸静脈アクセスの手技',
    content: '救急外来で末梢ルート確保困難時の外頸静脈アクセス手技について教えてください。解剖学的ランドマークと注意点は？',
    author: '岡田 慎一',
    authorRole: '医師',
    authorId: 'user20',
    timeAgo: '1週間前',
    likes: 39,
    answers: 17,
    tags: ['ルート確保', '救急', '中心静脈'],
    hasAcceptedAnswer: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000)
  }
];

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [likedQuestions, setLikedQuestions] = useState<Set<string>>(new Set());

  // ローカルストレージから質問といいね情報を読み込む
  useEffect(() => {
    const loadQuestions = () => {
      try {
        // 開発時: 常に新しいデータを読み込む（本番時はこの行をコメントアウト）
        forceResetToNewData();
        
        const saved = localStorage.getItem(STORAGE_KEY);
        // 新しいデータが追加されたことを示すバージョンチェック
        const currentVersion = '2.0'; // デモデータ追加後のバージョン
        const savedVersion = localStorage.getItem(STORAGE_KEY + '_version');
        
        if (saved && savedVersion === currentVersion) {
          const parsed = JSON.parse(saved);
          // 日付文字列をDateオブジェクトに変換し、authorIdが存在しない場合は追加、priorityプロパティを削除
          const questionsWithDates = parsed.map((q: any) => {
            const { priority, ...questionWithoutPriority } = q;
            return {
              ...questionWithoutPriority,
              createdAt: new Date(q.createdAt),
              // 既存データにauthorIdがない場合、名前から推定して追加
              authorId: q.authorId || getAuthorIdByName(q.author)
            };
          });
          setQuestions(questionsWithDates);
        } else {
          // バージョンが違う場合や初回起動時は新しいデータを設定
          console.log('📊 20件の新しいデモデータを読み込み中...');
          setQuestions(initialQuestions);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestions));
          localStorage.setItem(STORAGE_KEY + '_version', currentVersion);
        }
      } catch (error) {
        console.error('質問の読み込みに失敗しました:', error);
        setQuestions(initialQuestions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuestions));
        localStorage.setItem(STORAGE_KEY + '_version', '2.0');
      }
    };

    const loadLikedQuestions = () => {
      try {
        const saved = localStorage.getItem(LIKED_QUESTIONS_KEY);
        if (saved) {
          const likedArray = JSON.parse(saved);
          setLikedQuestions(new Set(likedArray));
        }
      } catch (error) {
        console.error('いいね情報の読み込みに失敗しました:', error);
      }
    };

    loadQuestions();
    loadLikedQuestions();

    // ウルトラシンク: ベストアンサー変更イベントをリッスン
    const handleBestAnswerChange = (event: CustomEvent) => {
      const { questionId, hasAccepted } = event.detail;
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === questionId ? { ...q, hasAcceptedAnswer: hasAccepted } : q
        )
      );
      console.log('質問データ強制更新:', { questionId, hasAccepted });
    };

    window.addEventListener('bestAnswerChanged', handleBestAnswerChange as EventListener);
    
    return () => {
      window.removeEventListener('bestAnswerChanged', handleBestAnswerChange as EventListener);
    };
  }, []);

  // 質問を追加
  const addQuestion = (questionData: Omit<Question, 'id' | 'likes' | 'answers' | 'hasAcceptedAnswer' | 'createdAt' | 'timeAgo'>, authorId?: string) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      likes: 0,
      answers: 0,
      hasAcceptedAnswer: false,
      createdAt: new Date(),
      timeAgo: '今',
      authorId
    };

    const updatedQuestions = [newQuestion, ...questions];
    setQuestions(updatedQuestions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions));
  };

  // 質問にいいねをトグル（追加/削除）
  const likeQuestion = (questionId: string) => {
    const isCurrentlyLiked = likedQuestions.has(questionId);

    const updatedQuestions = questions.map(q =>
      q.id === questionId 
        ? { ...q, likes: isCurrentlyLiked ? q.likes - 1 : q.likes + 1 }
        : q
    );
    
    const newLikedQuestions = new Set(likedQuestions);
    if (isCurrentlyLiked) {
      newLikedQuestions.delete(questionId);
    } else {
      newLikedQuestions.add(questionId);
    }
    
    setQuestions(updatedQuestions);
    setLikedQuestions(newLikedQuestions);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions));
    localStorage.setItem(LIKED_QUESTIONS_KEY, JSON.stringify(Array.from(newLikedQuestions)));
    
    return !isCurrentlyLiked; // 新しい状態を返す
  };

  // 質問がいいね済みかチェック
  const isQuestionLiked = (questionId: string) => {
    return likedQuestions.has(questionId);
  };

  // 質問を削除
  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuestions));
  };

  // 時間表示を更新
  const updateTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  };

  // questionsに時間表示を更新して返す
  const questionsWithUpdatedTime = questions.map(q => ({
    ...q,
    timeAgo: updateTimeAgo(q.createdAt)
  }));

  return {
    questions: questionsWithUpdatedTime,
    addQuestion,
    likeQuestion,
    deleteQuestion,
    isQuestionLiked
  };
};