// 互換用: 既存の import パス（`src/hooks/useSupabaseAuth`）を維持しつつ、
// 実体はContext実装に集約する。
export type { AppUser, SupabaseAuthContextValue } from '../contexts/SupabaseAuthContext';
export { SupabaseAuthProvider, useSupabaseAuth } from '../contexts/SupabaseAuthContext';
