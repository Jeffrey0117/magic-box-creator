import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { Flame } from 'lucide-react';
import { DEFAULT_LAYOUT6_CONFIG } from '@/types/template-config';

export default function TemplateLayout6(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 讀取模板配置，使用預設值作為 fallback
  const config = boxData.template_config?.layout6 || DEFAULT_LAYOUT6_CONFIG;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      
      {/* Left: Dark Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-12 lg:p-20 flex items-center justify-center animate-fade-in">
        <div className="max-w-lg space-y-6">
          <Flame className="w-16 h-16 text-orange-500 animate-pulse" />
          <h1 className="text-5xl font-bold leading-tight">
            {boxData.package_title || '掌握你的技能'}
          </h1>
          <p className="text-xl opacity-90">
            {boxData.package_description || '加入數千位專業人士,透過我們經過驗證的方法改變職業生涯'}
          </p>
          
          {/* 數據展示 */}
          <div className="flex gap-8 pt-6">
            {config.stats.map((stat, index) => {
              const colorMap: Record<string, string> = {
                orange: 'text-orange-500',
                blue: 'text-blue-400',
                green: 'text-green-400',
                purple: 'text-purple-400',
                red: 'text-red-400',
                yellow: 'text-yellow-400',
              };
              const textColor = colorMap[stat.color || 'orange'] || 'text-orange-500';

              return (
                <div key={index}>
                  <div className={`text-4xl font-bold ${textColor}`}>{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* 圖片輪播 (如果有) */}
          {boxData.images && boxData.images.length > 0 && (
            <div className="pt-6">
              <PackageImageCarousel images={boxData.images} />
            </div>
          )}
        </div>
      </div>

      {/* Right: Light Form Section */}
      <div className="bg-white p-12 lg:p-20 flex items-center justify-center animate-fade-in-up">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900">開始使用</h2>
            <p className="text-gray-600 text-lg">
              輸入你的資訊以接收完整指南
            </p>
          </div>
          
          {/* 解鎖表單 */}
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
              isCreatorPreview={props.isCreatorPreview}
            />

            {/* 創作者資訊 */}
            {!boxData.hide_author_info && (
              <CreatorCard
                creatorId={boxData.creator_id}
                isLoggedIn={props.isLoggedIn}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}