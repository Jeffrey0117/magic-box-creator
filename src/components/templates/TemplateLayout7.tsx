import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { Menu, Star, Users, TrendingUp, Lightbulb, Target, Zap, Heart, Award, Shield, Rocket, Gift, Trophy, Sparkles, Crown, Flame, CheckCircle, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_LAYOUT7_CONFIG } from '@/types/template-config';

// 圖示映射表
const iconMap: Record<string, any> = {
  Lightbulb, Target, Zap, Star, Users, TrendingUp, Heart, Award, Shield, Rocket,
  Gift, Trophy, Sparkles, Crown, Flame, CheckCircle, Mail, Phone, Calendar, Clock
};

export default function TemplateLayout7(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 讀取模板配置，使用預設值作為 fallback
  const config = boxData.template_config?.layout7 || DEFAULT_LAYOUT7_CONFIG;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4 animate-fade-in">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              {(() => {
                const BrandIcon = iconMap[config.brand.logo_icon] || Star;
                return <BrandIcon className="w-6 h-6 text-white" />;
              })()}
            </div>
            <span className="text-xl font-bold text-gray-900">{config.brand.name}</span>
          </div>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        
        {/* Section 1: Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg animate-fade-in-up">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            {boxData.package_title || '改變你的事業'}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {boxData.package_description || '探索幫助超過 10,000 家企業擴大營運和增加收入的策略'}
          </p>
          
          {/* 圖片輪播 (如果有) */}
          {boxData.images && boxData.images.length > 0 && (
            <div className="mb-6">
              <PackageImageCarousel images={boxData.images} />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {config.features.map((feature, index) => {
              const FeatureIcon = iconMap[feature.icon] || Star;
              const colors = ['text-purple-600', 'text-orange-500', 'text-blue-600', 'text-green-600', 'text-pink-600', 'text-indigo-600'];
              const color = colors[index % colors.length];

              return (
                <div key={index} className="flex items-start gap-3">
                  <FeatureIcon className={`w-6 h-6 ${color} flex-shrink-0 mt-1`} />
                  <div>
                    <h4 className="font-semibold mb-1 text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Form Section */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-bold mb-3">獲取指南</h2>
          <p className="text-lg opacity-90 mb-8">
            輸入你的資訊以接收完整商業成長指南
          </p>
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

        {/* Footer */}
        <footer className="text-center text-sm text-gray-600 pt-8 pb-4 animate-fade-in">
          <p>© 2024 {config.brand.name}. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            {config.social_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}