import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './useSupabaseAuth';

export type ReportTargetType = 'question' | 'answer' | 'user';

const LOCAL_REPORTS_KEY = 'medconsult_reports';

type LocalReport = {
  id: string;
  createdAt: string;
  reporterId?: string;
  targetType: ReportTargetType;
  targetId?: string;
  reportedUserId?: string;
  reason: string;
  details?: string;
};

function appendLocalReport(report: LocalReport) {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    const list = raw ? (JSON.parse(raw) as LocalReport[]) : [];
    const next = Array.isArray(list) ? [report, ...list].slice(0, 200) : [report];
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(next));
  } catch {
    // no-op
  }
}

export function useReports() {
  const { isAuthenticated, supabaseUser } = useSupabaseAuth();

  const report = useCallback(
    async (params: {
      targetType: ReportTargetType;
      targetId?: string;
      reportedUserId?: string;
      reason: string;
      details?: string;
    }) => {
      const { targetType, targetId, reportedUserId, reason, details } = params;
      if (!reason?.trim()) return { success: false, error: '通報理由を選択してください' };

      // Supabase（ログイン時はDBへ）
      if (isAuthenticated && supabaseUser) {
        const { error } = await supabase.from('reports').insert({
          reporter_id: supabaseUser.id,
          target_type: targetType,
          target_id: targetId || null,
          reported_user_id: reportedUserId || null,
          reason,
          details: details || null,
        });
        if (error) {
          console.error('Failed to create report:', error);
          return { success: false, error: '通報に失敗しました' };
        }
        return { success: true };
      }

      // ローカル（未ログイン/デモ用）
      appendLocalReport({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        reporterId: supabaseUser?.id,
        targetType,
        targetId,
        reportedUserId,
        reason,
        details,
      });
      return { success: true };
    },
    [isAuthenticated, supabaseUser]
  );

  return { report };
}


