import React, { useState } from 'react';
import { User, LogOut, Plus, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
}

interface UserSelectorProps {
  currentUser: User | null;
  users: User[];
  onLogin: (user: User) => void;
  onLogout: () => void;
  onCreateUser: (name: string, role: string) => User;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  currentUser,
  users,
  onLogin,
  onLogout,
  onCreateUser
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', role: '' });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserData.name && newUserData.role) {
      const newUser = onCreateUser(newUserData.name, newUserData.role);
      onLogin(newUser);
      setNewUserData({ name: '', role: '' });
      setShowCreateUser(false);
      setShowUserModal(false);
    }
  };

  return (
    <>
      {/* ユーザー情報表示 */}
      <div className="flex items-center space-x-3">
        {currentUser ? (
          <div className="flex items-center space-x-3">
            {/* デスクトップ版ユーザー情報 */}
            <div className="hidden sm:flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-600">{currentUser.role}</p>
              </div>
            </div>
            
            {/* モバイル版ユーザー情報（アイコンのみ） */}
            <div className="sm:hidden flex items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="ログアウト"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* デスクトップ版ログインボタン */}
            <button
              onClick={() => setShowUserModal(true)}
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl border border-blue-300 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">ユーザーを選択</span>
            </button>
            
            {/* モバイル版ログインボタン（アイコンのみ） */}
            <button
              onClick={() => setShowUserModal(true)}
              className="sm:hidden p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              title="ログイン"
            >
              <User className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* ユーザー選択モーダル */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">ユーザーを選択</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showCreateUser ? (
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onLogin(user);
                        setShowUserModal(false);
                      }}
                      className="w-full flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCreateUser(true)}
                  className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">新しいユーザーを作成</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    お名前
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="例: 山田 太郎"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    職種・役職
                  </label>
                  <input
                    type="text"
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="例: 看護師、医師など"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    戻る
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    作成
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserSelector;