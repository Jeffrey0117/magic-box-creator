import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { Lightbulb, Target, Zap } from 'lucide-react';

export default function TemplateLayout5(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  // 預設特色卡片 (如果創作者未自訂)
  const defaultCards = [
    { icon: Lightbulb, title: '智慧策略', desc: '學習經過驗證的技巧' },
    { icon: Target, title: '明確目標', desc: '實現你的願景' },
    { icon: Zap, title: '快速成果', desc: '看見立即影響' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
        
        {/* 特色網格 */}
        <div className="grid md:grid-cols-3 gap-6">
          {defaultCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{card.title}</h3>
              <p className="text-gray-600">{card.desc}</p>
            </div>
          ))}
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
              keyword={props.keyword}
              setKeyword={props.setKeyword}
              email={props.email}
              setEmail={props.setEmail}
              extraData={props.extraData}
              setExtraData={props.setExtraData}
              onUnlock={props.onUnlock}
              loading={props.loading}
              requireNickname={boxData.required_fields?.nickname || false}
              isCreatorPreview={props.isCreatorPreview}
            />

            {/* 創作者資訊 */}
            <CreatorCard 
              creatorId={boxData.creator_id}
              isLoggedIn={props.isLoggedIn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}