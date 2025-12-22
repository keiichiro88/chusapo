import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Grid3X3,
  List
} from 'lucide-react';
import { Question } from '../types';
import QuestionCard from './QuestionCard';

interface QuestionListProps {
  questions: Question[];
  onBack: () => void;
  onQuestionSelect: (question: Question) => void;
  onLikeQuestion: (questionId: string) => void;
  isQuestionLiked?: (questionId: string) => boolean;
  isMyQuestion?: (questionId: string) => boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({ 
  questions, 
  onBack, 
  onQuestionSelect,
  onLikeQuestion,
  isQuestionLiked = () => false,
  isMyQuestion = () => false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // 最新順にソートされた質問を取得
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [questions]);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '緊急';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '不明';
    }
  };


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
          <h1 className="text-3xl font-black text-gray-900 mb-2">質問一覧</h1>
          <p className="text-gray-600">穿刺技術に関する質問と回答を検索・閲覧できます</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          {/* ビューモード切り替え */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>


      {/* 質問一覧ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            最新の質問 ({sortedQuestions.length}件)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            新しい順に表示しています
          </p>
        </div>
      </div>

      {/* 質問一覧 */}
      {sortedQuestions.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' 
            : 'space-y-6'
        }>
          {sortedQuestions.map((question) => (
            <div key={question.id} className="group">
              <QuestionCard 
                question={question} 
                onLike={() => onLikeQuestion(question.id)}
                onViewDetail={() => onQuestionSelect(question)}
                onViewAnswers={() => onQuestionSelect(question)}
                isLiked={isQuestionLiked(question.id)}
                isMyQuestion={isMyQuestion(question.authorId || '')}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            質問がありません
          </h3>
          <p className="text-gray-500">
            新しい質問を投稿してみてください
          </p>
        </div>
      )}

      {/* ページネーション（将来の拡張用） */}
      {sortedQuestions.length > 0 && (
        <div className="mt-12 text-center">
          <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105">
            さらに質問を読み込む
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;