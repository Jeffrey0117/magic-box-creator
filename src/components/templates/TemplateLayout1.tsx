import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { CountdownTimer } from '@/components/CountdownTimer';
import { BookOpen, Lock } from 'lucide-react';

const TemplateLayout1 = (props: BoxTemplateProps) => {
  const {
    boxData,
    result,
    onReset,
    currentCount,
    isLoggedIn,
    isCreatorPreview,
    ...formProps
  } = props;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-0 shadow-elegant rounded-2xl overflow-hidden animate-fade-in">
          
          {/* 左側:品牌視覺區 */}
          <div className="relative bg-gradient-primary min-h-[400px] lg:min-h-[600px] flex flex-col items-center justify-center p-12 text-white">
            <div className="text-center animate-scale-in space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 animate-glow-pulse">
                {boxData?.package_title ? (
                  <BookOpen className="w-12 h-12" />
                ) : (
                  <Lock className="w-12 h-12" />
                )}
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                {boxData?.package_title || 'KeyBox 資料包'}
              </h2>
              
              <p className="text-xl opacity-90">
                {boxData?.package_description || '輸入關鍵字解鎖專屬內容'}
              </p>

              {/* 額度顯示 */}
              {boxData?.quota && (
                <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                  <p className="text-sm font-medium">
                    🔥 限量 {boxData.quota} 份 · 剩餘 {Math.max(0, boxData.quota - currentCount)} 份
                  </p>
                </div>
              )}

              {/* 倒數計時 */}
              {boxData?.expires_at && (
                <div className="mt-4">
                  <CountdownTimer expiresAt={boxData.expires_at} />
                </div>
              )}
            </div>

            {/* 圖片輪播 (如果有) */}
            {boxData?.images && boxData.images.length > 0 && (
              <div className="mt-8 w-full max-w-md">
                <PackageImageCarousel images={boxData.images} />
              </div>
            )}

            {/* 創作者資訊 */}
            <div className="mt-auto w-full">
              <CreatorCard creatorId={boxData?.creator_id} variant="light" />
            </div>
          </div>

          {/* 右側:解鎖表單區 */}
          <div className="bg-card p-8 md:p-12 flex flex-col justify-center">
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  解鎖內容
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  輸入關鍵字與 Email 即可領取專屬資料包
                </p>
              </div>
              
              <BoxUnlockForm
                {...formProps}
                boxData={boxData}
                variant="default"
                isCreatorPreview={isCreatorPreview}
              />

              <div className="pt-4 border-t border-border/50 text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 您的資料僅創作者可見 · 僅用於發送內容
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 解鎖成功畫面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-2xl">
        <UnlockSuccessView 
          result={result} 
          onReset={onReset}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
};

export default TemplateLayout1;