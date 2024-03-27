import { createBrowserClient } from "@supabase/ssr";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

let userId: string | null = null;

// ユーザーの認証状態が変更された場合に呼び出される関数
const handleAuthChange = (event: AuthChangeEvent, session: Session | null) => {
  if (session) {
    // 認証されたユーザーが存在する場合、ユーザーIDを取得する
    userId = session.user?.id || null;
  } else {
    // 認証されたユーザーが存在しない場合、ユーザーIDをnullに設定する
    userId = null;
  }
};

// ユーザーの認証状態の変更を監視する
supabase.auth.onAuthStateChange(handleAuthChange);


// createClient関数をエクスポートする
export const createClient = () => supabase;

// ユーザーIDを取得する関数をエクスポートする
export const getUserId = () => userId;