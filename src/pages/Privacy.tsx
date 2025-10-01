const Privacy = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
            🔒 隱私權政策
          </h1>
          <p className="text-muted-foreground">最後更新：2025 年 10 月 2 日</p>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">我們收集的資料</h2>
            <p className="text-muted-foreground leading-relaxed">
              KeyBox 僅收集使用者主動提供的最少必要資料：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Email 地址：用於帳號註冊與領取記錄</li>
              <li>密碼：經加密儲存於 Supabase</li>
              <li>領取時間：記錄您的解鎖操作</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">資料使用方式</h2>
            <p className="text-muted-foreground leading-relaxed">
              您的 Email 地址僅用於以下用途：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>創作者可查看領取記錄中的 Email</li>
              <li>用於帳號登入驗證</li>
              <li>顯示於您的管理面板</li>
            </ul>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              <strong className="text-foreground">我們不會：</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>將您的 Email 轉售給第三方</li>
              <li>寄送未經同意的廣告信件</li>
              <li>在未告知的情況下將資料用於其他用途</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">資料安全</h2>
            <p className="text-muted-foreground leading-relaxed">
              我們使用 Supabase 作為資料庫服務，所有資料均經過加密處理。密碼採用業界標準的雜湊演算法儲存，任何人（包括我們）都無法看到您的明文密碼。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">您的權利</h2>
            <p className="text-muted-foreground leading-relaxed">
              您有權利：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>查看自己的領取記錄</li>
              <li>隨時刪除自己建立的關鍵字</li>
              <li>要求我們刪除您的帳號資料</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">Cookie 使用</h2>
            <p className="text-muted-foreground leading-relaxed">
              KeyBox 僅使用必要的 Cookie 來維持您的登入狀態，不使用追蹤或廣告 Cookie。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-accent">政策更新</h2>
            <p className="text-muted-foreground leading-relaxed">
              我們可能會不定期更新此隱私權政策。重大變更時，我們會在網站上顯著提示。
            </p>
          </section>

          <section className="pt-4 border-t border-border">
            <h2 className="text-xl font-semibold mb-3 text-accent">聯絡我們</h2>
            <p className="text-muted-foreground leading-relaxed">
              如果您對隱私權政策有任何疑問，或希望行使您的資料權利，請透過以下方式聯繫：
            </p>
            <p className="text-accent mt-2">keybox.support@example.com</p>
          </section>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            ← 返回上一頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;