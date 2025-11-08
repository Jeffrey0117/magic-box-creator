import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Navigation Link to Full Homepage */}
        <div className="text-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            查看完整版首頁 →
          </Button>
        </div>

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full gradient-magic mb-4 glow">
            <Lock className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3">
            KeyBox 🔑
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            關鍵字解鎖 Email 收集工具
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            讓創作者輕鬆分享資料包，使用者輸入關鍵字即可解鎖內容
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🙌</div>
              <h3 className="text-2xl font-bold mb-4">我是使用者</h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>收到創作者分享的 KeyBox 連結</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>輸入關鍵字和 Email</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>立即解鎖資料包內容</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent transition-colors">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-2xl font-bold mb-4">我是創作者</h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>註冊登入後建立資料包</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>設定關鍵字並填入內容連結</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>分享短網址，自動收集 Email 名單</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="text-lg px-8 py-6"
          >
            開始使用 KeyBox
          </Button>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/help")}
              className="hover:text-accent transition-colors"
            >
              使用說明
            </button>
            <span>•</span>
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-accent transition-colors"
            >
              隱私權政策
            </button>
          </div>
        </div>

        <div className="mt-16 p-6 bg-secondary/30 rounded-lg">
          <h4 className="font-bold mb-3 text-center">💡 適合場景</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div>📱 Threads / IG 限動</div>
            <div>📚 知識型創作者</div>
            <div>🎨 設計師素材分享</div>
            <div>📹 YouTuber 獨家內容</div>
            <div>💼 課程教材發放</div>
            <div>📧 Newsletter 訂閱</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
