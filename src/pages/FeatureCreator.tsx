import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Users, 
  TrendingUp, 
  Package, 
  Target, 
  BarChart3, 
  Clock, 
  Shield, 
  Globe, 
  UserCheck, 
  Sparkles,
  Video,
  BookOpen,
  Briefcase,
  FileText,
  Palette,
  Rocket,
  ChevronDown,
  Check,
  Star,
  ArrowRight,
  Zap,
  Heart,
  Award
} from "lucide-react";

const FeatureCreator = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: "多樣化模板",
      description: "8+ 精美模板任選，支援圖片、影片、連結，完全響應式設計"
    },
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: "精準收集名單",
      description: "自動收集 Email，支援額外欄位，防重複領取機制"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: "即時數據分析",
      description: "領取趨勢分析、來源追蹤、CSV 匯出功能"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "靈活控制機制",
      description: "限量發放設定、時效性控制、候補名單功能"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: "內容保護",
      description: "關鍵字驗證機制、創作者專屬後台、安全的資料傳輸"
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-500" />,
      title: "跨平台分享",
      description: "短連結自動生成、社群媒體優化、一鍵複製分享"
    },
    {
      icon: <UserCheck className="w-8 h-8 text-teal-500" />,
      title: "會員自動解鎖",
      description: "登入用戶自動識別、歷史記錄查詢、無縫使用體驗"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "創新互動體驗",
      description: "解鎖動畫效果、個人化感謝頁面、品牌客製化選項"
    }
  ];

  const useCases = [
    {
      icon: <Video className="w-12 h-12 text-red-500" />,
      title: "影片創作者",
      description: "在 YouTube 影片描述放上關鍵字，直接收集觀眾 Email",
      examples: "免費素材包、專屬教學內容"
    },
    {
      icon: <BookOpen className="w-12 h-12 text-blue-500" />,
      title: "線上教育者",
      description: "課程資源限時領取，建立學員資料庫",
      examples: "課程講義、額外習題、獨家資源"
    },
    {
      icon: <Briefcase className="w-12 h-12 text-purple-500" />,
      title: "數位產品開發者",
      description: "Beta 測試邀請、早鳥優惠發放",
      examples: "測試碼分發、產品預覽、用戶調研"
    },
    {
      icon: <FileText className="w-12 h-12 text-green-500" />,
      title: "內容創作者",
      description: "部落格讀者專屬內容，提升忠誠度",
      examples: "電子書、模板下載、會員內容"
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      title: "設計師 & 藝術家",
      description: "作品集、設計資源限定分享",
      examples: "設計模板、色彩搭配、創作工具"
    },
    {
      icon: <Rocket className="w-12 h-12 text-orange-500" />,
      title: "新創團隊",
      description: "產品發布、用戶反饋收集",
      examples: "MVP 測試、市場調研、早期採用者招募"
    }
  ];

  const templates = [
    { name: "簡潔經典", tag: "推薦", description: "適合所有類型內容" },
    { name: "卡片風格", tag: "熱門", description: "現代感設計" },
    { name: "極簡主義", tag: "簡約", description: "突出核心內容" },
    { name: "圖片焦點", tag: "視覺", description: "圖像驅動展示" },
    { name: "列表式", tag: "清晰", description: "條理分明" },
    { name: "雜誌風格", tag: "專業", description: "媒體級質感" },
    { name: "社群媒體風", tag: "互動", description: "社交友善" },
    { name: "專業商務", tag: "企業", description: "商務場合適用" }
  ];

  const faqs = [
    {
      question: "KeyBox 與其他平台有什麼不同？",
      answer: "我們專注於關鍵字解鎖機制，讓內容分發更有趣味性，同時確保只有真正感興趣的用戶才能獲得內容。"
    },
    {
      question: "免費版有什麼限制？",
      answer: "免費版可建立 3 個資料包，享有基礎功能。升級後可享受無限資料包和進階功能。"
    },
    {
      question: "如何追蹤成效？",
      answer: "內建完整的分析儀表板，包含領取趨勢、來源分析、轉換率等關鍵指標。"
    },
    {
      question: "是否支援自訂網域？",
      answer: "專業版以上支援自訂網域和白標功能。"
    },
    {
      question: "資料安全如何保障？",
      answer: "我們使用企業級加密技術，符合 GDPR 等隱私法規要求。"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Key className="w-16 h-16 text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-700">
              <span className="text-green-500">
                KeyBox
              </span>
              <br />
              讓你的內容創造真正價值
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              用關鍵字解鎖機制，輕鬆建立專屬資料包，收集潛在客戶，提升內容變現效率
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold px-8 py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                免費開始使用 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
              >
                觀看 3 分鐘介紹 <Video className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              免費試用 • 無需信用卡 • 隨時取消
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-[#EEF5FF] border-2 border-yellow-300">
              <CardContent className="pt-6">
                <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-slate-600">創作者正在使用</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-[#EEF5FF] border-2 border-yellow-300">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <p className="text-slate-600">資料包已分發</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-[#EEF5FF] border-2 border-yellow-300">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">300%</div>
                <p className="text-slate-600">平均提升轉換率</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">簡單三步驟，開始你的內容變現之旅</h2>
            <p className="text-xl text-slate-600">從創建到成長，KeyBox 讓一切變得簡單</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-500">🎨 建立</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• 選擇精美模板</li>
                <li>• 設定關鍵字與內容</li>
                <li>• 客製化樣式與欄位</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-500">🚀 分享</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• 一鍵生成專屬連結</li>
                <li>• 多平台輕鬆分享</li>
                <li>• 即時追蹤點擊狀況</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-500">📊 成長</h3>
              <ul className="space-y-2 text-slate-600">
                <li>• 收集潛在客戶資料</li>
                <li>• 分析用戶行為數據</li>
                <li>• 優化內容策略</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">強大功能，滿足所有需求</h2>
            <p className="text-xl text-slate-600">從模板選擇到數據分析，一站式解決方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-50 shadow-lg shadow-purple-200/40 hover:shadow-xl hover:shadow-purple-200/50 transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-700">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">誰在使用 KeyBox？</h2>
            <p className="text-xl text-slate-600">各行各業的創作者都在用 KeyBox 提升內容價值</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-[#EEF5FF] shadow-lg shadow-blue-200/40 hover:shadow-xl hover:shadow-blue-200/50 transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-700">{useCase.title}</h3>
                  <p className="text-slate-600 mb-4">{useCase.description}</p>
                  <div className="text-sm">
                    <span className="font-medium text-green-500">使用案例：</span>
                    <span className="text-slate-600">{useCase.examples}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">精美模板，隨心選擇</h2>
            <p className="text-xl text-slate-600">8+ 專業設計模板，適應各種使用場景</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="bg-slate-50 border-2 border-yellow-300 hover:border-yellow-400 transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="aspect-square bg-[#EEF5FF] rounded-lg mb-4 flex items-center justify-center border border-blue-200">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-700">{template.name}</h3>
                    <Badge variant="secondary" className="text-xs">{template.tag}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">選擇適合你的方案</h2>
            <p className="text-xl text-slate-600">從個人創作者到企業團隊，我們都有完美方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Free Plan */}
            <Card className="relative bg-slate-50 shadow-lg shadow-purple-200/40">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-700">🆓 免費版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-700">免費</span>
                  </div>
                  <p className="text-slate-600 mt-2">適合初學者試用</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 3 個資料包</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 基礎模板</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 基本數據分析</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 社群支援</li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => navigate("/login")}>
                  開始使用
                </Button>
              </CardContent>
            </Card>

            {/* Standard Plan */}
            <Card className="relative border-2 border-green-500 bg-[#EEF5FF] shadow-xl shadow-purple-200/50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white">最受歡迎</Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-700">⭐ 標準版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-green-500">$29</span>
                    <span className="text-slate-600">/月</span>
                  </div>
                  <p className="text-slate-600 mt-2">適合專業創作者</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 無限資料包</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 全部模板</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 進階數據分析</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> Email 支援</li>
                </ul>
                <Button className="w-full gradient-magic" onClick={() => navigate("/login")}>
                  選擇方案
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="relative bg-slate-50 shadow-lg shadow-purple-200/40">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-slate-700">💎 專業版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-700">$99</span>
                    <span className="text-slate-600">/月</span>
                  </div>
                  <p className="text-slate-600 mt-2">適合企業團隊</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 所有功能</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> API 整合</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 優先客服</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" /> 白標選項</li>
                </ul>
                <Button className="w-full" variant="outline">
                  聯繫銷售
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <p className="text-slate-600">
              <strong>企業版</strong>：客製化需求，請聯繫我們獲取專屬方案
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">用戶怎麼說</h2>
            <p className="text-xl text-slate-600">真實用戶的成功故事</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-[#EEF5FF] shadow-lg shadow-blue-200/40">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "KeyBox 讓我的 YouTube 頻道訂閱數在三個月內成長了 200%，關鍵字解鎖機制真的很有趣！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    張
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">張小明</p>
                    <p className="text-sm text-slate-600">科技 YouTuber</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 bg-[#EEF5FF] shadow-lg shadow-blue-200/40">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "透過 KeyBox，我成功建立了 5000+ 的精準讀者名單，轉換率比其他方式高出 3 倍！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    李
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">李美華</p>
                    <p className="text-sm text-slate-600">部落格作家</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6 bg-[#EEF5FF] shadow-lg shadow-blue-200/40">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-green-400 text-green-400" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">
                  "課程資源分發變得超級簡單，學員滿意度大幅提升，後台數據分析也很實用！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    王
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">王教授</p>
                    <p className="text-sm text-slate-600">線上教育講師</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">常見問題</h2>
            <p className="text-xl text-slate-600">快速解答你的疑問</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="cursor-pointer bg-slate-50 hover:shadow-md transition-shadow" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-slate-700">{faq.question}</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                  </div>
                  {openFaq === index && (
                    <p className="mt-4 text-slate-600">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-500">準備開始了嗎？</h2>
          <p className="text-xl mb-8 text-slate-600">加入 500+ 創作者的行列，讓你的內容創造更大價值</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              免費註冊 KeyBox <Heart className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
            >
              預約產品演示
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-4">
            免費試用 • 無需信用卡 • 隨時取消
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#EEF5FF] text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Key className="w-8 h-8 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-slate-700">KeyBox</span>
            </div>
            <p className="text-slate-600 mb-6">用關鍵字解鎖無限可能</p>
            <div className="flex justify-center space-x-6 mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/help")}>
                使用說明
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/privacy")}>
                隱私權政策
              </Button>
              <Button variant="ghost" size="sm">
                聯繫我們
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              © 2024 KeyBox. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeatureCreator;