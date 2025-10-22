import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';

export default function TemplateLayout2(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 min-h-[60vh] flex items-center justify-center text-center px-6 animate-fade-in">
        <div className="max-w-3xl text-white space-y-6 animate-scale-in">
          <h1 className="text-5xl md:text-6xl font-bold">
            {boxData.package_title || '專屬資料包'}
          </h1>
          {boxData.package_description && (
            <p className="text-xl md:text-2xl opacity-90">
              {boxData.package_description}
            </p>
          )}
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto -mt-16 px-6 pb-20 animate-fade-in-up">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl space-y-6">
          {/* Package Images */}
          {boxData.images && boxData.images.length > 0 && (
            <PackageImageCarousel images={boxData.images} />
          )}

          {/* Unlock Form */}
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

          {/* Creator Info */}
          {!boxData.hide_author_info && (
            <CreatorCard
              creatorId={boxData.creator_id}
              isLoggedIn={props.isLoggedIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}