/**
 * Supabaseクライアント設定
 *
 * このファイルはSupabaseへの接続を管理します。
 * 認証やデータベース操作はすべてこのクライアントを通じて行います。
 */

import { createClient } from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
// VITE_プレフィックスはViteでフロントエンドから参照するために必要
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合のエラーチェック
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabaseの環境変数が設定されていません。\n' +
    '.envファイルにVITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYを設定してください。'
  );
}

// Supabaseクライアントを作成
// このクライアントを使って認証やデータベース操作を行う
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ローカルストレージにセッションを保存（ブラウザを閉じても維持）
    persistSession: true,
    // セッションの自動更新を有効化
    autoRefreshToken: true,
  },
});

// 型定義（将来のデータベーステーブル用）
// Supabaseのデータベースを設定したら、ここに型を追加します
export type Database = {
  public: {
    Tables: {
      // 例: questions, answers, users テーブルの型をここに追加
    };
  };
};
