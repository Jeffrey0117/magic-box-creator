import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  id: number;
  title: string;
  content: React.ReactNode;
  bgClass: string;
}

const EducationCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: CarouselSlide[] = [
    {
      id: 1,
      title: "為什麼要收集 Email？",
      bgClass: "bg-gradient-to-br from-purple-500 to-blue-500",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center h-full px-4">
          <div className="slide-visual text-center">
            <div className="text-6xl mb-6">
              📧 → 💰 → 🚀
            </div>
          </div>
          <div className="slide-content">
            <h2 className="text-3xl font-bold mb-6 text-white">為什麼要收集 Email？</h2>
            <ul className="benefits-list space-y-3">
              <li className="flex items-center text-lg text-white border-b border-white/20 pb-3">
                💎 建立專屬的潛在客戶資料庫
              </li>
              <li className="flex items-center text-lg text-white border-b border-white/20 pb-3">
                🎯 直接觸及真正感興趣的受眾
              </li>
              <li className="flex items-center text-lg text-white border-b border-white/20 pb-3">
                📈 Email 行銷 ROI 高達 4200%
              </li>
              <li className="flex items-center text-lg text-white border-b border-white/20 pb-3">
                🔐 擁有自己的流量，不受平台演算法影響
              </li>
              <li className="flex items-center text-lg text-white">
                💌 持續培養關係，提升轉換率
              </li>
            </ul>
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <p className="text-white/90 text-base">
                <strong>Email 行銷投資報酬率平均 4200%</strong><br/>
                立即開始建立你的名單
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "如何提供價值資料？",
      bgClass: "bg-gradient-to-br from-green-400 to-emerald-500",
      content: (
        <div className="text-center h-full flex flex-col justify-center px-4">
          <h2 className="text-3xl font-bold mb-8 text-white">提供價值的 5 個層次</h2>
          <div className="value-ladder max-w-3xl mx-auto space-y-3">
            <div className="ladder-step bg-white/10 backdrop-blur-sm p-4 rounded-xl border-l-4 border-white/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">1對1 客製化服務</h3>
                  <p className="text-white/90 text-sm">深度諮詢、專屬方案</p>
                </div>
              </div>
            </div>
            <div className="ladder-step bg-white/10 backdrop-blur-sm p-4 rounded-xl border-l-4 border-white/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">💼</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">付費課程/產品</h3>
                  <p className="text-white/90 text-sm">完整系統化內容</p>
                </div>
              </div>
            </div>
            <div className="ladder-step bg-white/10 backdrop-blur-sm p-4 rounded-xl border-l-4 border-white/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎓</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">進階教學資源</h3>
                  <p className="text-white/90 text-sm">實戰案例、模板工具</p>
                </div>
              </div>
            </div>
            <div className="ladder-step bg-white/10 backdrop-blur-sm p-4 rounded-xl border-l-4 border-white/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">基礎知識內容</h3>
                  <p className="text-white/90 text-sm">電子書、快速指南</p>
                </div>
              </div>
            </div>
            <div className="ladder-step bg-white/25 backdrop-blur-sm p-4 rounded-xl border-l-4 border-yellow-400 shadow-lg shadow-yellow-400/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎁</span>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">免費誘因 (Lead Magnet)</h3>
                  <p className="text-white/90 text-sm">清單、範本、速查表 ← <strong>KeyBox 從這裡開始</strong></p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white/90 text-base font-medium">
              高價值感 + 立即可用 + 解決具體問題 = 有效的 Lead Magnet
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "如何行銷貼文吸引潛在客戶？",
      bgClass: "bg-gradient-to-br from-orange-400 to-yellow-500",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center px-4">
          <div className="post-examples space-y-4">
            <div className="social-post-card bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-3">Facebook 貼文範本</h4>
              <div className="space-y-1 text-white/90 text-sm">
                <p>🎁 免費領取【社群經營 10 大秘訣】！</p>
                <p>只要輸入關鍵字「成長」就能解鎖</p>
                <p>👉 [KeyBox 連結]</p>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-lg font-medium mt-2 text-xs">
                  立即領取 →
                </span>
              </div>
            </div>
            <div className="social-post-card bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-3">Instagram 貼文範本</h4>
              <div className="space-y-1 text-white/90 text-sm">
                <p>✨ 限時免費！設計師必備色彩指南</p>
                <p>留言「設計」+ 點擊連結領取</p>
                <p>🔗 連結在個人簡介</p>
              </div>
            </div>
          </div>
          <div className="marketing-tips">
            <h3 className="text-2xl font-bold text-white mb-6">貼文吸睛 5 步驟</h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                <div>
                  <strong className="text-white text-base">🎯 鉤子開場</strong>
                  <p className="text-white/90 text-sm">用問題/數據/emoji 抓住注意力</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                <div>
                  <strong className="text-white text-base">💎 價值承諾</strong>
                  <p className="text-white/90 text-sm">明確說明能獲得什麼</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                <div>
                  <strong className="text-white text-base">⚡ 製造急迫性</strong>
                  <p className="text-white/90 text-sm">限時/限量增加行動動力</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">4</span>
                <div>
                  <strong className="text-white text-base">✅ 簡單指示</strong>
                  <p className="text-white/90 text-sm">清楚告知如何領取</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">5</span>
                <div>
                  <strong className="text-white text-base">🚀 強烈 CTA</strong>
                  <p className="text-white/90 text-sm">呼籲立即行動</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "成功案例示範",
      bgClass: "bg-gradient-to-br from-blue-500 to-purple-600",
      content: (
        <div className="h-full flex flex-col justify-center px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-8">真實成功案例</h2>
          <div className="case-studies-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="case-card bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="case-header flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
                  🎥
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">科技 YouTuber - 小明</h3>
                  <p className="text-white/80 text-xs">訂閱數：5 萬</p>
                </div>
              </div>
              <div className="case-results grid grid-cols-3 gap-2 mb-4">
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">8K+</span>
                  <span className="text-white/80 text-xs">Email</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">35%</span>
                  <span className="text-white/80 text-xs">開信率</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">$12K</span>
                  <span className="text-white/80 text-xs">月營收</span>
                </div>
              </div>
              <div className="case-strategy mb-3">
                <h4 className="font-bold text-white mb-1 text-sm">策略</h4>
                <p className="text-white/90 text-xs">提供「程式碼範例包」，3 個月收集 8000+ 精準受眾</p>
              </div>
              <div className="quote text-white/90 text-xs italic border-l-2 border-yellow-400 pl-2">
                "KeyBox 讓我從廣告收入轉向課程銷售，月收翻了 3 倍！"
              </div>
            </div>

            <div className="case-card bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="case-header flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-lg">
                  📝
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">部落格作家 - 美華</h3>
                  <p className="text-white/80 text-xs">月流量：3 萬</p>
                </div>
              </div>
              <div className="case-results grid grid-cols-3 gap-2 mb-4">
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">5K+</span>
                  <span className="text-white/80 text-xs">Email</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">22%</span>
                  <span className="text-white/80 text-xs">轉換率</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">300%</span>
                  <span className="text-white/80 text-xs">互動提升</span>
                </div>
              </div>
              <div className="case-strategy mb-3">
                <h4 className="font-bold text-white mb-1 text-sm">策略</h4>
                <p className="text-white/90 text-xs">提供「寫作模板大全」，搭配每週電子報培養鐵粉</p>
              </div>
              <div className="quote text-white/90 text-xs italic border-l-2 border-yellow-400 pl-2">
                "讀者從匿名訪客變成真實朋友，這是最棒的轉變！"
              </div>
            </div>

            <div className="case-card bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="case-header flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                  🎨
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">設計師 - 小傑</h3>
                  <p className="text-white/80 text-xs">IG 粉絲：2 萬</p>
                </div>
              </div>
              <div className="case-results grid grid-cols-3 gap-2 mb-4">
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">3.2K+</span>
                  <span className="text-white/80 text-xs">Email</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">45%</span>
                  <span className="text-white/80 text-xs">購買率</span>
                </div>
                <div className="metric text-center">
                  <span className="block text-lg font-bold text-yellow-400">6 個月</span>
                  <span className="text-white/80 text-xs">回本</span>
                </div>
              </div>
              <div className="case-strategy mb-3">
                <h4 className="font-bold text-white mb-1 text-sm">策略</h4>
                <p className="text-white/90 text-xs">分享「配色靈感庫」，後續推出付費設計課程</p>
              </div>
              <div className="quote text-white/90 text-xs italic border-l-2 border-yellow-400 pl-2">
                "從免費資源建立信任，轉換成付費學員超順利！"
              </div>
            </div>
          </div>
          
          <div className="success-formula bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-xl font-bold text-white text-center mb-4">成功公式</h3>
            <div className="formula-flow flex items-center justify-center gap-2 text-white flex-wrap">
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">有價值的免費資源</span>
              <span className="text-lg">→</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">建立信任與關係</span>
              <span className="text-lg">→</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">推出付費產品</span>
              <span className="text-lg">→</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">持續營收成長</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Auto play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setActiveSlide(prev => prev === 0 ? slides.length - 1 : prev - 1);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setActiveSlide(index);
  };

  return (
    <section
      className="py-12"
      style={{ backgroundColor: '#F8F7F5' }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* 輪播主體 */}
        <div className="carousel-container relative mx-auto" style={{ width: '1000px', height: '600px' }}>
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${slide.bgClass} ${index === activeSlide ? 'block' : 'hidden'}
                         rounded-2xl p-8 text-white relative overflow-hidden
                         transition-all duration-500 ease-in-out`}
              style={{ width: '1000px', height: '600px' }}
            >
              {/* 背景裝飾 */}
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                {slide.content}
              </div>
            </div>
          ))}
        </div>

        {/* 導航控制 */}
        <div className="carousel-controls flex justify-center items-center gap-8 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={prevSlide}
            className="bg-white/90 hover:bg-white text-slate-700 border-slate-200"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            上一頁
          </Button>
          
          <div className="dots flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeSlide 
                    ? 'bg-green-500 scale-150' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={nextSlide}
            className="bg-white/90 hover:bg-white text-slate-700 border-slate-200"
          >
            下一頁
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* 自動播放進度條 */}
        <div className="auto-play-progress mt-4 max-w-md mx-auto">
          <div className="w-full bg-slate-200 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default EducationCarousel;