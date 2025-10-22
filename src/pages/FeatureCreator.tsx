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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Key className="w-16 h-16 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                KeyBox
              </span>
              <br />
              讓你的內容創造真正價值
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              用關鍵字解鎖機制，輕鬆建立專屬資料包，收集潛在客戶，提升內容變現效率
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                免費開始使用 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
              >
                觀看 3 分鐘介紹 <Video className="ml-2 w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-blue-200">
              免費試用 • 無需信用卡 • 隨時取消
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="pt-6">
                <Package className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
                <p className="text-muted-foreground">創作者正在使用</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <p className="text-muted-foreground">資料包已分發</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">300%</div>
                <p className="text-muted-foreground">平均提升轉換率</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">簡單三步驟，開始你的內容變現之旅</h2>
            <p className="text-xl text-muted-foreground">從創建到成長，KeyBox 讓一切變得簡單</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">🎨 建立</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 選擇精美模板</li>
                <li>• 設定關鍵字與內容</li>
                <li>• 客製化樣式與欄位</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">🚀 分享</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 一鍵生成專屬連結</li>
                <li>• 多平台輕鬆分享</li>
                <li>• 即時追蹤點擊狀況</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">📊 成長</h3>
              <ul className="space-y-2 text-muted-foreground">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">強大功能，滿足所有需求</h2>
            <p className="text-xl text-muted-foreground">從模板選擇到數據分析，一站式解決方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">誰在使用 KeyBox？</h2>
            <p className="text-xl text-muted-foreground">各行各業的創作者都在用 KeyBox 提升內容價值</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="text-sm">
                    <span className="font-medium text-accent">使用案例：</span>
                    <span className="text-muted-foreground">{useCase.examples}</span>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">精美模板，隨心選擇</h2>
            <p className="text-xl text-muted-foreground">8+ 專業設計模板，適應各種使用場景</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">🎨</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant="secondary" className="text-xs">{template.tag}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">選擇適合你的方案</h2>
            <p className="text-xl text-muted-foreground">從個人創作者到企業團隊，我們都有完美方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">🆓 免費版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">免費</span>
                  </div>
                  <p className="text-muted-foreground mt-2">適合初學者試用</p>
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
            <Card className="relative border-2 border-accent">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground">最受歡迎</Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">⭐ 標準版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                  <p className="text-muted-foreground mt-2">適合專業創作者</p>
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
            <Card className="relative">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">💎 專業版</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-muted-foreground">/月</span>
                  </div>
                  <p className="text-muted-foreground mt-2">適合企業團隊</p>
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
            <p className="text-muted-foreground">
              <strong>企業版</strong>：客製化需求，請聯繫我們獲取專屬方案
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">用戶怎麼說</h2>
            <p className="text-xl text-muted-foreground">真實用戶的成功故事</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "KeyBox 讓我的 YouTube 頻道訂閱數在三個月內成長了 200%，關鍵字解鎖機制真的很有趣！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    張
                  </div>
                  <div>
                    <p className="font-semibold">張小明</p>
                    <p className="text-sm text-muted-foreground">科技 YouTuber</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "透過 KeyBox，我成功建立了 5000+ 的精準讀者名單，轉換率比其他方式高出 3 倍！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    李
                  </div>
                  <div>
                    <p className="font-semibold">李美華</p>
                    <p className="text-sm text-muted-foreground">部落格作家</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "課程資源分發變得超級簡單，學員滿意度大幅提升，後台數據分析也很實用！"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    王
                  </div>
                  <div>
                    <p className="font-semibold">王教授</p>
                    <p className="text-sm text-muted-foreground">線上教育講師</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">常見問題</h2>
            <p className="text-xl text-muted-foreground">快速解答你的疑問</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="cursor-pointer" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                  </div>
                  {openFaq === index && (
                    <p className="mt-4 text-muted-foreground">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">準備開始了嗎？</h2>
          <p className="text-xl mb-8">加入 500+ 創作者的行列，讓你的內容創造更大價值</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
            >
              免費註冊 KeyBox <Heart className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              預約產品演示
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            免費試用 • 無需信用卡 • 隨時取消
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Key className="w-8 h-8 text-yellow-400 mr-2" />
              <span className="text-2xl font-bold text-white">KeyBox</span>
            </div>
            <p className="text-slate-400 mb-6">用關鍵字解鎖無限可能</p>
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
            <p className="text-sm text-slate-500">
              © 2024 KeyBox. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeatureCreator;