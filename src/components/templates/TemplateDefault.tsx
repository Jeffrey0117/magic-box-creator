import { BoxTemplateProps } from './BaseTemplate';
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { WaitlistCard } from "@/components/WaitlistCard";
import { CreatorCard } from "@/components/CreatorCard";
import { PackageImageCarousel } from "@/components/PackageImageCarousel";
import { BoxUnlockForm } from "@/components/BoxUnlockForm";
import { UnlockSuccessView } from "@/components/UnlockSuccessView";
import { useNavigate, useLocation } from "react-router-dom";

const TemplateDefault = (props: BoxTemplateProps) => {
  const {
    boxData,
    result,
    onReset,
    currentCount,
    waitlistCount,
    isLoggedIn,
    isCreatorPreview,
  } = props;
  
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = boxData?.expires_at && new Date(boxData.expires_at) < new Date();
  const isCompleted = boxData?.quota !== null && boxData?.current_count >= boxData?.quota;

  // 過期狀態
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

  // 額滿狀態
  if (isCompleted && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <WaitlistCard keyword={boxData} waitlistCount={waitlistCount} />
        </div>
      </div>
    );
  }

  // 主畫面
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {!result ? (
          <>
            {boxData && (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full gradient-magic mb-4 glow">
                    <Lock className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-3">
                    KeyBox 🔑
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    輸入關鍵字解鎖內容
                  </p>
                </div>

                {!boxData.hide_author_info && <CreatorCard creatorId={boxData.creator_id} />}

                <div className="flex flex-col items-center gap-3">
                  {boxData.expires_at && (
                    <CountdownTimer expiresAt={boxData.expires_at} />
                  )}
                  {boxData.quota && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg w-full">
                      <p className="text-sm font-medium text-accent">
                        🔥 限量 {boxData.quota} 份 · 剩餘 {Math.max(0, boxData.quota - currentCount)} 份
                      </p>
                    </div>
                  )}
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 w-full">
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

                {(boxData.package_title || boxData.package_description) && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    {boxData.package_title && (
                      <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
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

                {boxData.images && boxData.images.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <PackageImageCarousel images={boxData.images} />
                  </div>
                )}

                <div className="space-y-4">
                  <BoxUnlockForm
                    boxData={boxData}
                    keyword={props.keyword}
                    setKeyword={props.setKeyword}
                    email={props.email}
                    setEmail={props.setEmail}
                    extraData={props.extraData}
                    setExtraData={props.setExtraData}
                    onUnlock={props.onUnlock}
                    loading={props.loading}
                    isCreatorPreview={isCreatorPreview}
                  />

                  <div className="text-center">
                    <button
                      onClick={() => navigate(`/login?returnTo=${location.pathname}`)}
                      className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                    >
                      免費註冊／登入 →
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 text-center">
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
          <UnlockSuccessView 
            result={result} 
            onReset={onReset}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateDefault;