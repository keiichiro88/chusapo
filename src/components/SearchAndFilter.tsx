import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X,
  Syringe,
  TestTube,
  Cable,
  Activity,
  CircleDot,
  Loader2
} from 'lucide-react';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  filters: FilterOptions;
}

export interface FilterOptions {
  category: string;
  // AnswerQuestions で使用する拡張フィールド（オプショナル）
  hasAcceptedAnswer?: boolean | null;
  sortBy?: 'newest' | 'oldest' | 'likes' | 'answers';
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  onSearch, 
  onFilterChange, 
  filters 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // デバウンス検索（300ms）
  useEffect(() => {
    // 検索中表示
    if (searchQuery.length > 0) {
      setIsSearching(true);
    }

    // 前回のタイマーをクリア
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 新しいタイマーを設定
    debounceTimerRef.current = setTimeout(() => {
      onSearch(searchQuery);
      setIsSearching(false);
    }, 300);

    // クリーンアップ
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, onSearch]);

  const categories = [
    { name: '注射', icon: Syringe, color: 'text-red-600 hover:bg-red-50' },
    { name: '採血', icon: TestTube, color: 'text-blue-600 hover:bg-blue-50' },
    { name: 'ルート確保', icon: Cable, color: 'text-emerald-600 hover:bg-emerald-50' },
    { name: '動脈穿刺', icon: Activity, color: 'text-purple-600 hover:bg-purple-50' },
    { name: 'その他', icon: CircleDot, color: 'text-gray-600 hover:bg-gray-50' }
  ];

  // フォーム送信時（Enter キー）は即時検索
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // デバウンスタイマーをキャンセルして即時実行
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch(searchQuery);
    setIsSearching(false);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      category: ''
    });
    setSearchQuery('');
    onSearch('');
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== ''
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* 検索バー */}
      <form onSubmit={handleSearchSubmit} className="mb-3">
        <div className="relative">
          {/* 検索アイコン / ローディング */}
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="質問を検索..."
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
          />
          {/* 検索クリアボタン */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* カテゴリーアイコン */}
      <div className="flex items-center justify-evenly">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = filters.category === category.name;
          return (
            <button
              key={category.name}
              onClick={() => {
                if (isActive) {
                  handleFilterChange('category', '');
                } else {
                  handleFilterChange('category', category.name);
                }
              }}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `${category.color.split(' ')[0]} ${category.color.includes('red') ? 'bg-red-100' : category.color.includes('blue') ? 'bg-blue-100' : category.color.includes('emerald') ? 'bg-emerald-100' : category.color.includes('purple') ? 'bg-purple-100' : 'bg-gray-100'} scale-110` 
                  : `text-gray-400 hover:text-gray-600 ${category.color.split(' ')[1]}`
              }`}
              title={category.name}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{category.name}</span>
            </button>
          );
        })}
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-50 transition-all duration-200"
            title="クリア"
          >
            <X className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">クリア</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default SearchAndFilter;