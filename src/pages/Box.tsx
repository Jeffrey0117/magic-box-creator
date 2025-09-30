import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Key, Unlock } from "lucide-react";

const Box = () => {
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boxData, setBoxData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const init = async () => {
      if (id) {
        await fetchBoxData();
        await checkAuthAndAutoUnlock();
      }
    };
    init();
  }, [id]);

  const checkAuthAndAutoUnlock = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    console.log("🔍 Session:", session?.user.email);
    
    if (!session || !id || !session.user.email) {
      console.log("⚠️ 未通過檢查:", { hasSession: !!session, hasId: !!id, hasEmail: !!session?.user?.email });
      return;
    }

    const { data: keywordData } = await supabase
      .from("keywords")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    console.log("📦 Keyword data:", keywordData);
    if (!keywordData) return;

    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("id")
      .eq("keyword_id", keywordData.id)
      .eq("email", session.user.email)
      .maybeSingle();

    console.log("📋 Existing log:", existingLog);

    if (!existingLog) {
      console.log("✍️ 準備插入:", { keyword_id: keywordData.id, email: session.user.email });
      const { data: insertedData, error } = await supabase.from("email_logs").insert({
        keyword_id: keywordData.id,
        email: session.user.email,
      }).select();

      if (error) {
        console.error("❌ 插入失敗:", JSON.stringify(error, null, 2));
        console.error("❌ Error details:", error);
        toast.error(`自動解鎖失敗: ${error.message || "未知錯誤"}`);
        return;
      }
      console.log("✅ 插入成功:", insertedData);
    }

    setResult(keywordData.content);
    toast.success(existingLog ? "🔓 歡迎回來！" : "🔓 自動解鎖成功！");
  };

  const fetchBoxData = async () => {
    const { data, error } = await supabase
      .from("keywords")
      .select("id, keyword, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast.error("找不到此資料包");
      navigate("/");
    } else {
      setBoxData(data);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let keywordData;
      
      if (id) {
        const { data, error: fetchError } = await supabase
          .from("keywords")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) {
          toast.error("找不到此資料包");
          setLoading(false);
          return;
        }

        if (data.keyword !== keyword.toLowerCase().trim()) {
          toast.error("關鍵字錯誤，請重新輸入");
          setLoading(false);
          return;
        }

        keywordData = data;
      } else {
        const { data, error: searchError } = await supabase
          .from("keywords")
          .select("*")
          .eq("keyword", keyword.toLowerCase().trim())
          .maybeSingle();

        if (searchError) throw searchError;

        if (!data) {
          toast.error("找不到此關鍵字，請重新輸入");
          setLoading(false);
          return;
        }

        keywordData = data;
      }

      const { error: logError } = await supabase.from("email_logs").insert({
        keyword_id: keywordData.id,
        email: email.trim(),
      });

      if (logError) throw logError;

      setResult(keywordData.content);
      toast.success("🔓 解鎖成功！");
    } catch (error: any) {
      toast.error(error.message || "解鎖失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setEmail("");
    setResult(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {!result ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-magic mb-4 glow">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">
                KeyBox 🔑
              </h1>
              <p className="text-muted-foreground text-lg">
                輸入關鍵字解鎖內容
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 shadow-card glow">
              <form onSubmit={handleUnlock} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    關鍵字
                  </label>
                  <Input
                    placeholder="輸入關鍵字..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-magic hover:opacity-90 transition-opacity font-medium text-lg h-12 gap-2"
                >
                  {loading ? "解鎖中..." : (
                    <>
                      <Key className="w-5 h-5" />
                      Unlock 🔓
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  創作者登入 →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card rounded-2xl p-8 shadow-card glow">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
                <Unlock className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-accent mb-2">
                ✅ 解鎖成功！
              </h2>
              <p className="text-muted-foreground">這是您的專屬內容：</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="text-lg break-all">{result}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleReset}
                className="flex-1 gradient-magic"
              >
                重新查詢
              </Button>
              <Button
                onClick={() => navigate(isLoggedIn ? "/creator" : "/login")}
                variant="outline"
                className="flex-1"
              >
                {isLoggedIn ? "查看我的管理面板 →" : "註冊 KeyBox 免費查看 →"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Box;
