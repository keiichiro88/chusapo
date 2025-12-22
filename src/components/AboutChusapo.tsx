import React from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Users, 
  Shield, 
  CheckCircle,
  Sparkles,
  Target,
  HandHeart,
  MessageCircle
} from 'lucide-react';

interface AboutChusapoProps {
  onBack: () => void;
}

const AboutChusapo: React.FC<AboutChusapoProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">チューサポについて</h1>
          <p className="text-gray-600 mt-1">注射に悩んだらここ！看護師のための穿刺お助けコミュニティ</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-8">
        {/* ヒーローセクション */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <h2 className="text-3xl font-bold">チューサポとは？</h2>
          </div>
          <p className="text-xl leading-relaxed text-blue-100">
            <strong>注射に悩んだらここ！看護師のための穿刺お助けコミュニティ</strong>
          </p>
          <p className="mt-4 text-blue-100 leading-relaxed">
            チューサポは、穿刺技術で悩む看護師さんたちが安心して質問でき、
            経験豊富な先輩からアドバイスをもらえる特別な場所です。
          </p>
        </div>

        {/* なぜ生まれたのか */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-6 w-6 text-red-500" />
            <h3 className="text-2xl font-bold text-gray-900">なぜ「チューサポ」が生まれたのか</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">こんな悩み、ありませんか？</h4>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 font-medium">💔 新人時代、わずかな教育だけでいきなり注射の現場に</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-orange-800 font-medium">😰 失敗が怖くて、手が震えてしまう</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 font-medium">😔 先輩に聞きたいけど、忙しそうで声をかけられない</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 font-medium">⏰ 教えたいけど、現場が忙しくて時間が取れない</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">現実的なジレンマ</h4>
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  多くの看護師さんが経験する現実...
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-500">•</span>
                    <span>先輩も教えたいけど教えられない</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-500">•</span>
                    <span>後輩は聞きたいけど忙しそうだから聞けない</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-500">•</span>
                    <span>十分な教育を受けられないまま現場に</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-gray-500">•</span>
                    <span>一人で悩みを抱え込んでしまう</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                  <p className="text-purple-800 font-bold text-center">
                    そんなジレンマを解決したくて、チューサポは誕生しました。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 私たちの想い */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <HandHeart className="h-6 w-6 text-emerald-500" />
            <h3 className="text-2xl font-bold text-gray-900">私たちの想い</h3>
          </div>
          
          <div className="space-y-6">
            <p className="text-gray-700 text-lg leading-relaxed">
              注射技術は、患者さんの安全と看護師の自信に直結する大切なスキルです。
              でも現実は、十分な教育を受けられないまま現場に出て、一人で悩みを抱える看護師さんがたくさんいます。
            </p>
            
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h4 className="text-xl font-bold text-emerald-800 mb-4 text-center">
                チューサポは、そんな皆さんの「safe space（安心できる場所）」でありたい。
              </h4>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">失敗を恐れずに質問できる場所</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">経験豊富な先輩からアドバイスをもらえる場所</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">同じ悩みを持つ仲間と支え合える場所</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">いつでも、どこからでもアクセスできる学びの場</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* コミュニティの約束 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-900">コミュニティの約束</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-blue-800">判断せず、支え合う</h4>
                </div>
                <p className="text-blue-700">
                  どんな基本的な質問でも大丈夫。みんな最初は初心者でした。
                </p>
              </div>
              
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-bold text-emerald-800">実践的なアドバイス</h4>
                </div>
                <p className="text-emerald-700">
                  机上の理論ではなく、現場で本当に使える技術とコツを共有。
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Heart className="h-5 w-5 text-red-600" />
                  <h4 className="font-bold text-red-800">患者さんファースト</h4>
                </div>
                <p className="text-red-700">
                  すべては患者さんの安全と看護の質向上のために。
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-purple-800">成長を応援</h4>
                </div>
                <p className="text-purple-700">
                  一人ひとりのスキルアップを、コミュニティ全体で応援します。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* あなたも一緒に */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <MessageCircle className="h-8 w-8 text-yellow-300" />
              <h3 className="text-2xl font-bold">あなたも一緒に</h3>
            </div>
            
            <p className="text-xl text-purple-100 mb-6 leading-relaxed">
              チューサポは、看護師による、看護師のためのコミュニティです。<br />
              あなたの経験、悩み、成功体験すべてが、誰かの助けになります。
            </p>
            
            <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
              <p className="text-2xl font-bold text-yellow-300 mb-2">
                一緒に、注射技術で悩む看護師さんをゼロにしませんか？
              </p>
              <p className="text-purple-100">
                あなたの参加をお待ちしています 💜
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutChusapo;