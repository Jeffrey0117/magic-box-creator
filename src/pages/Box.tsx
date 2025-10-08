import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Key, Unlock } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WaitlistCard } from "@/components/WaitlistCard";
import { CreatorCard } from "@/components/CreatorCard";
import { PackageImageCarousel } from "@/components/PackageImageCarousel";

const Box = () => {
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boxData, setBoxData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const navigate = useNavigate();
  const { id, shortCode } = useParams();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (id) {
        await redirectToShortCode();
      } else if (shortCode) {
        await fetchBoxData();
        await checkAuthAndAutoUnlock();
      }
    };
    init();
  }, [id, shortCode]);

  const redirectToShortCode = async () => {
    const { data } = await supabase
      .from("keywords")
      .select("short_code")
      .eq("id", id)
      .maybeSingle();
    
    if (data?.short_code) {
      navigate(`/${data.short_code}`, { replace: true });
    } else {
      toast.error("找不到此資料包");
      navigate("/");
    }
  };

  const checkAuthAndAutoUnlock = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    console.log("🔍 Session:", session?.user.email);
    
    if (!session || (!id && !shortCode) || !session.user.email) {
      console.log("⚠️ 未通過檢查:", { hasSession: !!session, hasId: !!id, hasShortCode: !!shortCode, hasEmail: !!session?.user?.email });
      return;
    }

    let query = supabase.from("keywords").select("*");
    
    if (shortCode && !location.pathname.startsWith('/box/')) {
      query = query.eq("short_code", shortCode);
    } else if (id) {
      query = query.eq("id", id);
    }
    
    const { data: keywordData } = await query.maybeSingle();

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
        toast.error("自動解鎖失敗，請稍後再試");
        return;
      }
      console.log("✅ 插入成功:", insertedData);
    }

    setResult(keywordData.content);
    toast.success(existingLog ? "🔓 歡迎回來！" : "🔓 自動解鎖成功！");
  };

  const fetchBoxData = async () => {
    let query = supabase.from("keywords").select("id, keyword, created_at, quota, current_count, expires_at, creator_id, images, package_title, package_description");
    
    if (shortCode && !location.pathname.startsWith('/box/')) {
      query = query.eq("short_code", shortCode);
    } else if (id) {
      query = query.eq("id", id);
    }
    
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      toast.error("找不到此資料包");
      navigate("/");
    } else {
      setBoxData(data);
      
      if (data.quota) {
        setCurrentCount(data.current_count || 0);
      }

      if (data.quota && data.current_count >= data.quota) {
        const { count } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('keyword_id', data.id)
          .eq('status', 'waiting');
        
        setWaitlistCount(count || 0);
      }
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let keywordData;
      
      if (id || shortCode) {
        let query = supabase.from("keywords").select("*");
        
        if (shortCode && !location.pathname.startsWith('/box/')) {
          query = query.eq("short_code", shortCode);
        } else if (id) {
          query = query.eq("id", id);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) {
          toast.error("找不到此資料包，請確認關鍵字是否正確");
          setLoading(false);
          return;
        }

        if (data.keyword !== keyword.toLowerCase().trim()) {
          toast.error("❌ 關鍵字錯誤，請重新輸入");
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
          toast.error("❌ 找不到此關鍵字，請確認是否正確");
          setLoading(false);
          return;
        }

        keywordData = data;
      }

      if (keywordData.quota) {
        const currentCount = keywordData.current_count || 0;
        
        if (currentCount >= keywordData.quota) {
          toast.error("❌ 此資料包已額滿！");
          setLoading(false);
          return;
        }
      }

      const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("keyword_id", keywordData.id)
        .eq("email", email.trim())
        .maybeSingle();

      if (existingLog) {
        setResult(keywordData.content);
        toast.success("🔓 歡迎回來！您已領取過此資料包");
      } else {
        const { error: logError } = await supabase.from("email_logs").insert({
          keyword_id: keywordData.id,
          email: email.trim(),
        });

        if (logError) throw logError;

        setResult(keywordData.content);
        toast.success("🔓 解鎖成功！");
      }
    } catch (error: any) {
      console.error("解鎖錯誤:", error);
      toast.error("解鎖失敗，請稍後再試或聯繫創作者");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setEmail("");
    setResult(null);
  };

  const isExpired = boxData?.expires_at && new Date(boxData.expires_at) < new Date();
  const isCompleted = boxData?.quota !== null && boxData?.current_count >= boxData?.quota;

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">此資料包已過期</h2>
            <p className="text-muted-foreground mb-6">此資料包的領取期限已結束</p>
            <Button onClick={() => navigate("/")} variant="outline">
              返回首頁
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <WaitlistCard keyword={boxData} waitlistCount={waitlistCount} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {!result ? (
          <>
            {boxData && (
              <>
                <CreatorCard creatorId={boxData.creator_id} />

                <div className="flex flex-col md:flex-row items-center gap-3">
                  {boxData.expires_at && (
                    <CountdownTimer expiresAt={boxData.expires_at} />
                  )}
                  {boxData.quota && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg w-full md:w-auto">
                      <p className="text-sm font-medium text-accent">
                        🔥 限量 {boxData.quota} 份 · 剩餘 {Math.max(0, boxData.quota - currentCount)} 份
                      </p>
                    </div>
                  )}
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 w-full md:flex-1">
                    <p className="text-sm font-medium text-accent mb-1">
                      ✨ 註冊會員免輸入關鍵字
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • 登入後自動解鎖，無需輸入關鍵字<br/>
                      • 查看我的領取記錄<br/>
                      • 創建資料包，分享給你的受眾
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(boxData.package_title || boxData.package_description) && (
                    <div className="glass-card rounded-2xl shadow-card p-6">
                      {boxData.package_title && (
                        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                          📦 {boxData.package_title}
                        </h3>
                      )}
                      {boxData.package_description && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {boxData.package_description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="glass-card rounded-2xl shadow-card p-6">
                    <form onSubmit={handleUnlock} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">關鍵字</label>
                        <Input
                          placeholder="輸入關鍵字..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          required
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          💡 請向創作者索取關鍵字（不分大小寫）
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          🔒 僅創作者可見
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full gradient-magic hover:opacity-90 transition-opacity font-medium gap-2"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            解鎖中...
                          </div>
                        ) : (
                          <>
                            <Key className="w-5 h-5" />
                            立即解鎖 🔓
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => navigate(`/login?returnTo=${location.pathname}`)}
                        className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        免費註冊／登入 →
                      </button>
                    </div>
                  </div>
                </div>

                {boxData.images && boxData.images.length > 0 && (
                  <div className="glass-card rounded-2xl shadow-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      🖼️ 資料包預覽圖片
                    </h3>
                    <PackageImageCarousel images={boxData.images} />
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    © 2025 Powered by UPPER |{" "}
                    <button
                      onClick={() => navigate("/help")}
                      className="hover:text-accent transition-colors"
                    >
                      使用說明
                    </button>
                    {" "}
                    <button
                      onClick={() => navigate("/privacy")}
                      className="hover:text-accent transition-colors"
                    >
                      隱私權政策
                    </button>
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card glow">
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
              <p className="text-lg break-all whitespace-pre-line">{result}</p>
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
                {isLoggedIn ? "前往創作者面板 →" : "註冊 KeyBox 創建資料包 →"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Box;
