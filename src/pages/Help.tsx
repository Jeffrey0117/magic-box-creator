import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Help = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            💡 使用說明
          </h1>
          <p className="text-muted-foreground">快速上手 KeyBox</p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-accent">👤 創作者使用指南</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">1️⃣ 註冊帳號</h3>
                <p className="text-sm text-muted-foreground">
                  點擊「註冊/登入」，填寫 Email 和密碼，至信箱收取驗證信後即可開始使用
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">2️⃣ 建立資料包</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  在管理面板點擊「新增關鍵字」，填寫：
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li><strong>關鍵字</strong>：使用者需要輸入的密碼（例如：secret2025）</li>
                  <li><strong>回覆內容</strong>：解鎖後顯示的內容（例如：雲端連結、優惠碼）</li>
                </ul>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">3️⃣ 分享給粉絲</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  點擊「複製文案」，系統會自動產生完整的分享訊息：
                </p>
                <div className="bg-background rounded p-3 text-xs mt-2">
                  🎁 我為你準備了一份專屬資料包！<br/>
                  輸入關鍵字「secret2025」即可免費領取：<br/>
                  https://keybox.com/abc123<br/>
                  👉 立即解鎖專屬內容！
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">4️⃣ 查看領取記錄</h3>
                <p className="text-sm text-muted-foreground">
                  點擊「查看記錄」查看有哪些人領取了你的資料包，還可以匯出 CSV 檔案
                </p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border">
            <h2 className="text-2xl font-semibold mb-4 text-accent">🎁 粉絲領取指南</h2>
            
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">方式 1️⃣ 訪客領取（快速）</h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>點擊創作者分享的連結</li>
                  <li>輸入關鍵字和 Email</li>
                  <li>立即解鎖內容</li>
                </ol>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2">方式 2️⃣ 會員領取（推薦）</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  註冊 KeyBox 會員後享受：
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>✅ 自動解鎖，無需重複輸入 Email</li>
                  <li>✅ 查看所有領取過的資料包</li>
                  <li>✅ 一鍵管理所有內容</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border">
            <h2 className="text-2xl font-semibold mb-4 text-accent">❓ 常見問題</h2>
            
            <div className="space-y-3">
              <details className="bg-muted/30 rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">關鍵字有分大小寫嗎？</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  不分大小寫，系統會自動將關鍵字轉為小寫處理
                </p>
              </details>

              <details className="bg-muted/30 rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">Email 會被如何使用？</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  您的 Email 僅用於領取記錄，創作者可見，我們不會轉售給第三方。詳見<a href="/privacy" className="text-accent hover:underline">隱私權政策</a>
                </p>
              </details>

              <details className="bg-muted/30 rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">可以重複領取同一個資料包嗎？</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  同一個 Email 只能領取一次，但您隨時可以返回查看已領取的內容
                </p>
              </details>

              <details className="bg-muted/30 rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">忘記關鍵字怎麼辦？</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  請聯繫創作者索取關鍵字，我們無法查看創作者設定的關鍵字
                </p>
              </details>

              <details className="bg-muted/30 rounded-lg p-4 cursor-pointer">
                <summary className="font-semibold">如何刪除我的資料？</summary>
                <p className="text-sm text-muted-foreground mt-2">
                  如需刪除帳號或領取記錄，請聯繫我們：keybox.support@example.com
                </p>
              </details>
            </div>
          </section>
        </div>

        <div className="flex gap-4 justify-center mt-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
          >
            前往解鎖頁面
          </Button>
          <Button
            onClick={() => navigate("/login")}
            className="gradient-magic"
          >
            註冊 / 登入
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Help;