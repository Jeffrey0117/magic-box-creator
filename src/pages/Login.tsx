import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const PRODUCTION_URL = "https://magic-box-creator.vercel.app";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo');

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(returnTo || "/creator");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(returnTo || "/creator");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.search]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("登入成功！");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${PRODUCTION_URL}/creator`,
          },
        });
        if (error) throw error;
        toast.success(
          "註冊成功！請至信箱收取驗證信 📧",
          {
            description: "點擊信中的驗證連結即可開始使用",
            duration: 8000,
          }
        );
      }
    } catch (error: any) {
      console.error("登入/註冊錯誤:", error);
      
      let errorMessage = "操作失敗，請稍後再試";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "❌ Email 或密碼錯誤";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "此 Email 已註冊，請直接登入";
      } else if (error.message?.includes("Password should be")) {
        errorMessage = "密碼至少需要 6 個字元";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "請先至信箱點擊驗證連結";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md px-4 md:px-0">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-2">🔑 KeyBox 🔑</h1>
          <p className="text-muted-foreground">創作者平台</p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card">
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setIsLogin(true)}
              variant={isLogin ? "default" : "outline"}
              className={`flex-1 ${isLogin ? 'gradient-magic' : ''}`}
            >
              登入
            </Button>
            <Button
              type="button"
              onClick={() => setIsLogin(false)}
              variant={!isLogin ? "default" : "outline"}
              className={`flex-1 ${!isLogin ? 'gradient-magic' : ''}`}
            >
              註冊
            </Button>
          </div>

          {!isLogin && (
            <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-sm text-accent">
                📧 註冊後請至信箱收取驗證信
              </p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-magic hover:opacity-90 transition-opacity font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  處理中...
                </div>
              ) : (
                isLogin ? "登入" : "註冊"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex gap-3 justify-center text-xs">
              <button
                onClick={() => navigate("/help")}
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                使用說明
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={() => navigate("/privacy")}
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                隱私權政策
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
