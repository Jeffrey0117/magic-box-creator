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
      toast.error(error.message || "操作失敗，請重試");
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
              {loading ? "處理中..." : isLogin ? "登入" : "註冊"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              ← 回到解鎖頁面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
