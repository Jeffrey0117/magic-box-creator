import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Sparkles } from "lucide-react";

const Box = () => {
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Search for keyword
      const { data: keywordData, error: searchError } = await supabase
        .from("keywords")
        .select("*")
        .eq("keyword", keyword.toLowerCase().trim())
        .maybeSingle();

      if (searchError) throw searchError;

      if (!keywordData) {
        toast.error("找不到此關鍵字，請重新輸入");
        setLoading(false);
        return;
      }

      // Log the email
      const { error: logError } = await supabase.from("email_logs").insert({
        keyword_id: keywordData.id,
        email: email.trim(),
      });

      if (logError) throw logError;

      // Show result
      setResult(keywordData.content);
      toast.success("解鎖成功！");
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
                Magic Box
              </h1>
              <p className="text-muted-foreground text-lg">
                ✦ 解鎖你的專屬內容 ✦
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
                      <Sparkles className="w-5 h-5" />
                      Unlock ✦
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
                <Sparkles className="w-8 h-8 text-accent" />
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
                onClick={() => navigate("/login")}
                variant="outline"
                className="flex-1"
              >
                登入管理
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Box;
