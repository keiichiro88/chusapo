import { useState, useEffect } from 'react';
import { User } from '../types';

const STORAGE_KEY = 'medconsult_current_user';
const USERS_KEY = 'medconsult_users';

// 初期ユーザーデータ（デモ用）
const initialUsers: User[] = [
  { 
    id: 'user1', 
    name: '田中 美咲', 
    role: '看護師',
    totalGratitude: 5,
    currentTitle: '頼れるアドバイザー',
    notificationSettings: {
      receiveNotifications: true,
      soundNotifications: false
    }
  },
  { 
    id: 'user2', 
    name: '佐藤 健太', 
    role: '小児科医',
    totalGratitude: 25,
    currentTitle: '頼れるアドバイザー',
    notificationSettings: {
      receiveNotifications: true,
      soundNotifications: false
    }
  },
  { 
    id: 'user3', 
    name: '山田 花子', 
    role: '臨床検査技師',
    totalGratitude: 3,
    currentTitle: '初回貢献者',
    notificationSettings: {
      receiveNotifications: true,
      soundNotifications: false
    }
  },
  { 
    id: 'user4', 
    name: '鈴木 健一', 
    role: '看護師長',
    totalGratitude: 45,
    currentTitle: '頼れるアドバイザー',
    notificationSettings: {
      receiveNotifications: true,
      soundNotifications: false
    }
  },
  { 
    id: 'user5', 
    name: '山本 美沙', 
    role: '血管外科医',
    totalGratitude: 67,
    currentTitle: '頼れるアドバイザー',
    notificationSettings: {
      receiveNotifications: true,
      soundNotifications: false
    }
  }
];

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // ローカルストレージからユーザー情報を読み込む
  useEffect(() => {
    const loadUsers = () => {
      try {
        const savedUsers = localStorage.getItem(USERS_KEY);
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          // 既存データに感謝システムフィールドがない場合は初期化
          const usersWithGratitude = parsed.map((user: any) => ({
            ...user,
            totalGratitude: user.totalGratitude || 0,
            currentTitle: user.currentTitle || '',
            notificationSettings: user.notificationSettings || {
              receiveNotifications: true,
              soundNotifications: false
            }
          }));
          setUsers(usersWithGratitude);
          // 更新した内容をLocalStorageに保存
          localStorage.setItem(USERS_KEY, JSON.stringify(usersWithGratitude));
        } else {
          setUsers(initialUsers);
          localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        }
      } catch (error) {
        console.error('ユーザー情報の読み込みに失敗しました:', error);
        setUsers(initialUsers);
      }
    };

    const loadCurrentUser = () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('現在のユーザー情報の読み込みに失敗しました:', error);
      }
    };

    loadUsers();
    loadCurrentUser();
  }, []);

  // ユーザーとしてログイン
  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  // ログアウト
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 新しいユーザーを作成
  const createUser = (name: string, role: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      role,
      totalGratitude: 0,
      currentTitle: '',
      notificationSettings: {
        receiveNotifications: true,
        soundNotifications: false
      }
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    
    return newUser;
  };

  // 質問が現在のユーザーの投稿かチェック
  const isMyQuestion = (questionAuthorId: string) => {
    return currentUser?.id === questionAuthorId;
  };

  // 回答が現在のユーザーの投稿かチェック
  const isMyAnswer = (answerAuthorId: string) => {
    return currentUser?.id === answerAuthorId;
  };

  return {
    currentUser,
    users,
    loginAsUser,
    logout,
    createUser,
    isMyQuestion,
    isMyAnswer
  };
};