import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

const LOCAL_BLOCKS_KEY = 'medconsult_blocked_users';

function loadLocalBlocks(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_BLOCKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === 'string');
  } catch {
    return [];
  }
}

function saveLocalBlocks(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_BLOCKS_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // no-op
  }
}

export function useBlocks() {
  const { isAuthenticated, supabaseUser } = useSupabaseAuth();

  const [blockedIds, setBlockedIds] = useState<string[]>(() => loadLocalBlocks());
  const blockedSet = useMemo(() => new Set(blockedIds), [blockedIds]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !supabaseUser) {
      setBlockedIds(loadLocalBlocks());
      return;
    }

    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', supabaseUser.id);

    if (error) {
      console.error('Failed to fetch blocks:', error);
      return;
    }

    setBlockedIds((data || []).map((row: any) => row.blocked_id).filter((v: any) => typeof v === 'string'));
  }, [isAuthenticated, supabaseUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isBlocked = useCallback((userId: string | undefined | null) => {
    if (!userId) return false;
    return blockedSet.has(userId);
  }, [blockedSet]);

  const blockUser = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId) return { success: false, error: 'ユーザーIDが不正です' };
      if (isAuthenticated) {
        if (!supabaseUser) return { success: false, error: 'ログイン情報の取得に失敗しました' };
        if (supabaseUser.id === targetUserId) return { success: false, error: '自分自身はブロックできません' };

        // 楽観更新
        setBlockedIds((prev) => (prev.includes(targetUserId) ? prev : [targetUserId, ...prev]));

        const { error } = await supabase.from('blocks').insert({
          blocker_id: supabaseUser.id,
          blocked_id: targetUserId,
        });

        if (error) {
          console.error('Failed to block user:', error);
          // ロールバック
          setBlockedIds((prev) => prev.filter((id) => id !== targetUserId));
          return { success: false, error: 'ブロックに失敗しました' };
        }
        return { success: true };
      }

      // LocalStorage（未ログイン/デモ用）
      const next = blockedSet.has(targetUserId) ? blockedIds : [targetUserId, ...blockedIds];
      setBlockedIds(next);
      saveLocalBlocks(next);
      return { success: true };
    },
    [blockedIds, blockedSet, isAuthenticated, supabaseUser]
  );

  const unblockUser = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId) return { success: false, error: 'ユーザーIDが不正です' };
      if (isAuthenticated) {
        if (!supabaseUser) return { success: false, error: 'ログイン情報の取得に失敗しました' };

        // 楽観更新
        setBlockedIds((prev) => prev.filter((id) => id !== targetUserId));

        const { error } = await supabase
          .from('blocks')
          .delete()
          .eq('blocker_id', supabaseUser.id)
          .eq('blocked_id', targetUserId);

        if (error) {
          console.error('Failed to unblock user:', error);
          // ロールバック
          setBlockedIds((prev) => (prev.includes(targetUserId) ? prev : [targetUserId, ...prev]));
          return { success: false, error: 'ブロック解除に失敗しました' };
        }
        return { success: true };
      }

      const next = blockedIds.filter((id) => id !== targetUserId);
      setBlockedIds(next);
      saveLocalBlocks(next);
      return { success: true };
    },
    [blockedIds, isAuthenticated, supabaseUser]
  );

  return {
    blockedUserIds: blockedIds,
    isBlocked,
    blockUser,
    unblockUser,
    refreshBlocks: refresh,
  };
}


