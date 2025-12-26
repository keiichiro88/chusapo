import { useState, useEffect } from 'react';
import { Answer } from '../types';
import { devLog } from '../lib/logger';

const STORAGE_KEY = 'medconsult_answers';

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
    '岡田 慎一': 'user20',
    '田村 恵子': 'user4' // 初期データの田村恵子さんも追加
  };
  return nameToIdMap[authorName];
};

const initialAnswers: Answer[] = [
  // 田中美咲さんの質問（id: '1'）に対する回答を6件追加
  {
    id: '1',
    questionId: '1',
    content: '高齢患者への穿刺は確かに難しいですね。私の経験では、22Gの針を使用し、穿刺前に温めたタオルで血管を拡張させることが効果的です。また、血管の触診に十分時間をかけ、最も良い部位を選択することが重要です。',
    author: '鈴木 健一',
    authorRole: '看護師長',
    authorId: 'user4',
    gratitude: 8,
    isAccepted: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    questionId: '1',
    content: '私は超音波ガイド下穿刺を推奨します。視覚的に血管を確認できるため、成功率が大幅に向上します。また、針の挿入角度を浅くし（15-30度）、ゆっくりと進めることも重要です。当院では高齢者への穿刺成功率が90%以上に向上しました。',
    author: '山本 美沙',
    authorRole: '血管外科医',
    authorId: 'user5',
    gratitude: 15,
    isAccepted: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '10',
    questionId: '1',
    content: '血管の選択が重要です。手背よりも前腕の橈側皮静脈を狙うことをお勧めします。血管壁が比較的しっかりしており、固定もしやすいです。また、駆血帯は軽めにして血管を過度に圧迫しないよう注意しています。',
    author: '伊藤 雄一',
    authorRole: '救急科医師',
    authorId: 'user6',
    gratitude: 12,
    isAccepted: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: '11',
    questionId: '1',
    content: '穿刺前の準備が成功の鍵です。皮膚の清拭はもちろん、血管の走行を確認し、穿刺部位をマーキングしておくと良いでしょう。高齢者は皮膚が薄いので、針を進める速度はゆっくりと、血管に当たったら少し角度を下げて慎重に進めます。',
    author: '加藤 綾',
    authorRole: '訪問看護師',
    authorId: 'user7',
    gratitude: 9,
    isAccepted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '12',
    questionId: '1',
    content: '翼状針の使用をお勧めします。針の安定性が高く、血管を傷つけるリスクが低いです。また、穿刺後はすぐに針を固定し、患者に腕を動かさないよう説明することも大切です。',
    author: '清水 智子',
    authorRole: 'ICU看護師',
    authorId: 'user11',
    gratitude: 7,
    isAccepted: false,
    createdAt: new Date(Date.now() - 90 * 60 * 1000)
  },
  {
    id: '13',
    questionId: '1',
    content: '血管が見えにくい場合は、LEDライトやペンライトで血管を透過光で確認する方法も有効です。また、患者との十分なコミュニケーションを取り、リラックスしてもらうことで血管の緊張を和らげることができます。私の経験では、優しい声がけで成功率が向上します。',
    author: '高橋 麻衣',
    authorRole: '透析室看護師',
    authorId: 'user13',
    gratitude: 6,
    isAccepted: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  // 他の質問の回答
  {
    id: '3',
    questionId: '2',
    content: '小児の場合、気分転換技術が非常に効果的です。シャボン玉やタブレットでの動画視聴などで注意をそらすことで、不安を軽減できます。また、EMLA（麻酔クリーム）の事前使用も考慮してください。',
    author: '田村 恵子',
    authorRole: '小児科看護師',
    authorId: 'user4',
    gratitude: 15,
    isAccepted: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
];

export const useAnswers = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);

  // ローカルストレージから回答を読み込む
  useEffect(() => {
    const loadAnswers = () => {
      try {
        // 開発時: 回答データを強制リセット（デモ用）
        // localStorage.removeItem(STORAGE_KEY);
        // localStorage.removeItem(STORAGE_KEY + '_version');
        // localStorage.removeItem('medconsult_questions'); // 質問データもリセット
        
        const saved = localStorage.getItem(STORAGE_KEY);
        devLog('LocalStorageから読み込み:', saved ? 'データあり' : 'データなし');
        
        if (saved) {
          const parsed = JSON.parse(saved);
          const answersWithDates = parsed.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            // 既存データにauthorIdがない場合、名前から推定して追加
            authorId: a.authorId || getAuthorIdByName(a.author),
            // 既存データに感謝数がない場合、0で初期化
            gratitude: a.gratitude || 0
          }));
          devLog('読み込んだ回答データ:', answersWithDates);
          setAnswers(answersWithDates);
          // authorIdを追加した場合はLocalStorageを更新
          localStorage.setItem(STORAGE_KEY, JSON.stringify(answersWithDates));
        } else {
          devLog('📝 6件のデモ回答データを読み込み中...');
          setAnswers(initialAnswers);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAnswers));
        }
      } catch (error) {
        console.error('回答の読み込みに失敗しました:', error);
        setAnswers(initialAnswers);
      }
    };

    loadAnswers();
  }, []);

  // 回答を追加
  const addAnswer = (answerData: Omit<Answer, 'id' | 'gratitude' | 'isAccepted' | 'createdAt'>, authorId?: string) => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString(),
      gratitude: 0, // 感謝数を初期化
      isAccepted: false,
      createdAt: new Date(),
      authorId
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));
  };


  // 回答をベストアンサーにする、または解除する
  const acceptAnswer = (answerId: string, questionId: string) => {
    devLog('acceptAnswer実行:', { answerId, questionId, action: answerId === '' ? '解除' : '選択' });
    
    const updatedAnswers = answers.map(a => {
      if (a.questionId === questionId) {
        // 空のIDが渡された場合はすべて解除、そうでなければ指定されたIDのみをベストアンサーにする
        const newIsAccepted = answerId === '' ? false : a.id === answerId;
        return { ...a, isAccepted: newIsAccepted };
      }
      return a;
    });
    
    // LocalStorageに保存
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));
    devLog(
      '回答データ保存完了:',
      updatedAnswers.filter((a) => a.questionId === questionId).map((a) => ({ id: a.id, isAccepted: a.isAccepted }))
    );
    
    // 状態を更新
    setAnswers(updatedAnswers);
  };

  // 特定の質問の回答を取得
  const getAnswersForQuestion = (questionId: string) => {
    return answers
      .filter(answer => answer.questionId === questionId)
      .sort((a, b) => {
        // ベストアンサーを最初に表示、その後は感謝数順
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return b.gratitude - a.gratitude;
      });
  };

  // 回答の感謝数を更新
  const updateAnswerGratitude = (answerId: string, newGratitudeCount: number) => {
    const updatedAnswers = answers.map(a =>
      a.id === answerId ? { ...a, gratitude: newGratitudeCount } : a
    );
    setAnswers(updatedAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));
  };

  return {
    answers,
    addAnswer,
    acceptAnswer,
    getAnswersForQuestion,
    updateAnswerGratitude
  };
};