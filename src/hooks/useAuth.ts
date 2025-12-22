import { useState, useEffect } from 'react';
import { SignupData } from '../components/auth/SignupModal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tier: 'basic' | 'verified' | 'expert';
  isEmailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

const STORAGE_KEY = 'medconsult_auth';
const USERS_KEY = 'medconsult_users';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ローカルストレージからユーザー情報を読み込む
  useEffect(() => {
    const loadAuth = () => {
      try {
        // 現在のユーザー
        const savedAuth = localStorage.getItem(STORAGE_KEY);
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          const userWithDates = {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            lastLoginAt: new Date(parsed.lastLoginAt)
          };
          setCurrentUser(userWithDates);
        }

        // 全ユーザー
        const savedUsers = localStorage.getItem(USERS_KEY);
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          const usersWithDates = parsed.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt),
            lastLoginAt: new Date(user.lastLoginAt)
          }));
          setUsers(usersWithDates);
        } else {
          // 初期ユーザーデータを設定
          const initialUsers = createInitialUsers();
          setUsers(initialUsers);
          localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        }
      } catch (error) {
        console.error('認証情報の読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // 初期ユーザーデータを作成
  const createInitialUsers = (): User[] => {
    return [
      {
        id: 'user1',
        email: 'tanaka@example.com',
        name: '田中 美咲',
        role: '循環器内科医',
        tier: 'expert',
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'user2',
        email: 'sato@example.com',
        name: '佐藤 健太',
        role: '救急科医師',
        tier: 'verified',
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: 'user3',
        email: 'yamada@example.com',
        name: '山田 花子',
        role: '看護師',
        tier: 'verified',
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: 'user4',
        email: 'suzuki@example.com',
        name: '鈴木 健一',
        role: '看護師長',
        tier: 'verified',
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'user5',
        email: 'yamamoto@example.com',
        name: '山本 美沙',
        role: '血管外科医',
        tier: 'expert',
        isEmailVerified: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
  };

  // ユーザー登録
  const signup = async (signupData: SignupData): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // メールアドレスの重複チェック
          const existingUser = users.find(user => user.email === signupData.email);
          if (existingUser) {
            reject(new Error('このメールアドレスは既に登録されています'));
            return;
          }

          // 新しいユーザーを作成
          const newUser: User = {
            id: `user_${Date.now()}`,
            email: signupData.email,
            name: signupData.name,
            role: '医療従事者', // 初期値
            tier: 'basic',
            isEmailVerified: false, // 実際のシステムではメール認証が必要
            createdAt: new Date(),
            lastLoginAt: new Date()
          };

          const updatedUsers = [...users, newUser];
          setUsers(updatedUsers);
          setCurrentUser(newUser);

          // ローカルストレージに保存
          localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

          resolve(newUser);
        } catch (error) {
          reject(error);
        }
      }, 1000); // 実際のAPIコールをシミュレート
    });
  };

  // ログイン
  const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = users.find(u => u.email === email);
          if (!user) {
            reject(new Error('ユーザーが見つかりません'));
            return;
          }

          // 実際のシステムではパスワード認証が必要
          // ここではダミー認証として常に成功
          const updatedUser = {
            ...user,
            lastLoginAt: new Date()
          };

          setCurrentUser(updatedUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

          // ユーザーリストも更新
          const updatedUsers = users.map(u => 
            u.id === user.id ? updatedUser : u
          );
          setUsers(updatedUsers);
          localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

          resolve(updatedUser);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // ログアウト
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // プロフィール更新
  const updateProfile = (userData: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    // ユーザーリストも更新
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  };

  // メール認証（ダミー実装）
  const verifyEmail = () => {
    if (!currentUser) return;
    updateProfile({ isEmailVerified: true });
  };

  // ユーザーティアの判定
  const getUserTierInfo = (tier: User['tier']) => {
    switch (tier) {
      case 'basic':
        return {
          label: '一般ユーザー',
          badge: null,
          color: 'text-gray-600'
        };
      case 'verified':
        return {
          label: '認証済み医療従事者',
          badge: '認証済み',
          color: 'text-blue-600'
        };
      case 'expert':
        return {
          label: '検証済み専門家',
          badge: '専門家',
          color: 'text-yellow-600'
        };
    }
  };

  // 投稿者かどうかの判定
  const isMyContent = (authorId: string) => {
    return currentUser?.id === authorId;
  };

  return {
    currentUser,
    users,
    isLoading,
    signup,
    login,
    logout,
    updateProfile,
    verifyEmail,
    getUserTierInfo,
    isMyContent
  };
};