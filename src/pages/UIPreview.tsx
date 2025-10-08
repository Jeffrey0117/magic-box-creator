import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const MOCK_CREATOR = {
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  display_name: "Felix 設計師",
  email: "felix.designer@example.com",
  bio: "分享免費設計資源 | Notion 模板愛好者",
};

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=500&h=500&fit=crop",
];

const CreatorCardPreview = () => {
  return (
    <div className="bg-white border border-[#dbdbdb] rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <img
          src={MOCK_CREATOR.avatar_url}
          alt="Creator Avatar"
          className="w-16 h-16 rounded-full border-2 border-[#dbdbdb]"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-[#262626] text-base">
            {MOCK_CREATOR.display_name}
          </h3>
          <p className="text-xs text-[#8e8e8e] mt-0.5">
            {MOCK_CREATOR.email}
          </p>
          <p className="text-sm text-[#8e8e8e] mt-1">
            {MOCK_CREATOR.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

const PackageImageCarouselPreview = ({ images }: { images: string[] }) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="bg-white border border-[#dbdbdb] rounded-lg overflow-hidden mb-4">
        <img
          src={images[0]}
          alt="Package"
          className="w-full aspect-square object-cover"
        />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dbdbdb] rounded-lg overflow-hidden mb-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <img
                src={img}
                alt={`Package ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      <div className="flex justify-center gap-1.5 py-2">
        {images.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#0095f6]"
          />
        ))}
      </div>
    </div>
  );
};

const UIPreview = () => {
  const [imageCount, setImageCount] = useState(3);

  const getCurrentImages = () => {
    return MOCK_IMAGES.slice(0, imageCount);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📱 Instagram 2010 風格預覽</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => setImageCount(0)}
                variant={imageCount === 0 ? "default" : "outline"}
                size="sm"
              >
                0 張圖
              </Button>
              <Button
                onClick={() => setImageCount(1)}
                variant={imageCount === 1 ? "default" : "outline"}
                size="sm"
              >
                1 張圖
              </Button>
              <Button
                onClick={() => setImageCount(2)}
                variant={imageCount === 2 ? "default" : "outline"}
                size="sm"
              >
                2 張圖
              </Button>
              <Button
                onClick={() => setImageCount(3)}
                variant={imageCount === 3 ? "default" : "outline"}
                size="sm"
              >
                3 張圖
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              點擊按鈕切換不同圖片數量預覽效果
            </p>
          </CardContent>
        </Card>

        <div className="space-y-0">
          <CreatorCardPreview />
          <PackageImageCarouselPreview images={getCurrentImages()} />
          
          <div className="bg-white border border-[#dbdbdb] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#262626] mb-2">
              📦 免費 Notion 模板包
            </h2>
            <p className="text-sm text-[#8e8e8e] mb-4">
              輸入關鍵字「notion2024」即可免費領取
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="請輸入您的 Email"
                className="w-full px-3 py-2 border border-[#dbdbdb] rounded-lg text-sm focus:outline-none focus:border-[#0095f6]"
              />
              <input
                type="text"
                placeholder="輸入關鍵字解鎖"
                className="w-full px-3 py-2 border border-[#dbdbdb] rounded-lg text-sm focus:outline-none focus:border-[#0095f6]"
              />
              <button className="w-full bg-[#0095f6] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1877f2] transition-colors">
                🔓 立即解鎖
              </button>
            </div>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎨 設計說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ 創作者卡片：圓形頭像 + 暱稱 + Email + 簡介</p>
            <p>✅ 圖片展示：0張不顯示 / 1張靜態 / 2+張輪播</p>
            <p>✅ 解鎖表單：保留 Email 輸入 + 關鍵字輸入</p>
            <p>✅ Instagram 風格：白底 (#ffffff) + 淺灰邊框 (#dbdbdb)</p>
            <p>✅ 正方形圖片：1:1 比例裁切</p>
            <p>✅ 指示點 & 按鈕：IG 藍 (#0095f6)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UIPreview;