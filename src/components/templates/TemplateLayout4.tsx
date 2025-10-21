import { BoxTemplateProps } from './BaseTemplate';
import { BoxUnlockForm } from '@/components/BoxUnlockForm';
import { UnlockSuccessView } from '@/components/UnlockSuccessView';
import { CreatorCard } from '@/components/CreatorCard';
import { PackageImageCarousel } from '@/components/PackageImageCarousel';

export default function TemplateLayout4(props: BoxTemplateProps) {
  const { boxData, result } = props;

  // 成功畫面
  if (result) {
    return <UnlockSuccessView result={result} onReset={props.onReset} />;
  }

  // 背景圖片邏輯 (使用第一張圖片或預設漸層)
  const bgImage = boxData.images && boxData.images.length > 0
    ? boxData.images[0]
    : null;

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-6 py-12"
      style={{
        backgroundImage: bgImage
          ? `linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9)), url('${bgImage}')`
          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Semi-transparent Form Card */}
      <div className="max-w-lg w-full backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl animate-scale-in">
        <div className="text-center text-white space-y-6">
          <h1 className="text-4xl font-bold">{boxData.package_title || '專屬資料包'}</h1>
          {boxData.package_description && (
            <p className="text-lg opacity-90 mb-8">{boxData.package_description}</p>
          )}

          <div className="space-y-4">
            {/* Package Images - 顯示在表單上方 (如果有多張圖) */}
            {boxData.images && boxData.images.length > 1 && (
              <div className="backdrop-blur-sm bg-white/5 p-4 rounded-2xl">
                <PackageImageCarousel images={boxData.images} />
              </div>
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