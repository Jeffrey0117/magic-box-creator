import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { Lightbulb, Target, Zap, Star, Users, TrendingUp, Heart, Award, Shield, Rocket, Gift, Trophy, Sparkles, Crown, Flame, CheckCircle, Mail, Phone, Calendar, Clock } from 'lucide-react';
import { DEFAULT_LAYOUT5_CONFIG } from '@/types/template-config';

// 圖示映射表
const iconMap: Record<string, any> = {
  Lightbulb, Target, Zap, Star, Users, TrendingUp, Heart, Award, Shield, Rocket,
  Gift, Trophy, Sparkles, Crown, Flame, CheckCircle, Mail, Phone, Calendar, Clock
};

export default function TemplateLayout5(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  // 讀取模板配置，使用預設值作為 fallback
  const config = boxData.template_config?.layout5 || DEFAULT_LAYOUT5_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
        
        {/* 特色網格 */}
        <div className="grid md:grid-cols-3 gap-6">
          {config.features.map((feature, idx) => {
            const FeatureIcon = iconMap[feature.icon] || Lightbulb;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                  <FeatureIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6 bg-white p-10 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            {boxData.package_title || '獲取完整指南'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {boxData.package_description || '你需要掌握這些技能的一切'}
          </p>

          {/* 圖片輪播 (如果有) */}
          {boxData.images && boxData.images.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <PackageImageCarousel images={boxData.images} />
            </div>
          )}

          {/* 解鎖表單 */}
          <div className="max-w-xl mx-auto space-y-4">
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