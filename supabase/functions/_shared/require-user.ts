// 共用:從 Authorization header 取「真實登入使用者」。
// 背景:verify_jwt 只驗 token 有效(anon key 也算有效),不會幫你比對 body 的 userId。
// 沒有這層,任何人拿公開 anon key 就能替別人建訂單/發動扣款。
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthedUser {
  id: string;
  email?: string;
}

export async function requireUser(req: Request): Promise<AuthedUser | null> {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email ?? undefined };
  } catch {
    return null;
  }
}
