import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';
import { Menu, Star, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplateLayout7(props: BoxTemplateProps) {
  const { boxData, result } = props;

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
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">KeyBox</span>
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
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">社群</h4>
                <p className="text-sm text-gray-600">加入 10K+ 會員</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">成長</h4>
                <p className="text-sm text-gray-600">平均 300% ROI</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1 text-gray-900">驗證</h4>
                <p className="text-sm text-gray-600">5 星評分指南</p>
              </div>
            </div>
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

        {/* Footer */}
        <footer className="text-center text-sm text-gray-600 pt-8 pb-4 animate-fade-in">
          <p>© 2024 KeyBox. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-purple-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-purple-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Instagram</a>
          </div>
        </footer>
      </div>
    </div>
  );
}