import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { ChevronDown, Play } from 'lucide-react';
import { DEFAULT_LAYOUT8_CONFIG } from '@/types/template-config';

export default function TemplateLayout8(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 讀取模板配置，使用預設值作為 fallback
  const config = boxData.template_config?.layout8 || DEFAULT_LAYOUT8_CONFIG;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  // 背景圖片邏輯 (使用第一張圖片或預設漸層)
  const bgImage = boxData.images && boxData.images.length > 0 
    ? boxData.images[0] 
    : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920';

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Video/Motion Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9)), url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Animated overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="max-w-3xl space-y-8 animate-fade-in">
          
          {/* Video Play Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 mb-6 animate-pulse hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            {boxData.package_title || '獲得靈感'}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            {boxData.package_description || '透過我們的完整指南,將你的創意願景變成現實'}
          </p>

          {/* Form */}
          <div className="max-w-md mx-auto space-y-4 pt-6">
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

          {/* Scroll indicator */}
          <div className="pt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/60 mx-auto" />
            <p className="text-white/60 text-sm mt-2">向下滾動了解更多</p>
          </div>
        </div>
      </div>

      {/* Additional content section */}
      <div className="relative z-10 bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">你將學到什麼</h2>
          
          {/* 圖片輪播 (如果有多張圖片) */}
          {boxData.images && boxData.images.length > 1 && (
            <div className="max-w-2xl mx-auto mb-8">
              <PackageImageCarousel images={boxData.images} />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {config.learning_points.map((point, idx) => (
              <div key={idx} className="p-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}