import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { 
  Grid2x2, 
  LayoutPanelTop, 
  Square, 
  Image, 
  Grid3x3, 
  Columns2, 
  Layers, 
  Video 
} from "lucide-react";

const Index = () => {
  const layouts = [
    { 
      id: 1, 
      name: "左右分欄型", 
      desc: "經典 Lead Magnet", 
      icon: Columns2,
      path: "/layout-1"
    },
    { 
      id: 2, 
      name: "上下結構型", 
      desc: "Hero → Form", 
      icon: LayoutPanelTop,
      path: "/layout-2"
    },
    { 
      id: 3, 
      name: "中央卡片型", 
      desc: "Centered Focus", 
      icon: Square,
      path: "/layout-3"
    },
    { 
      id: 4, 
      name: "全圖背景型", 
      desc: "半透明表單卡", 
      icon: Image,
      path: "/layout-4"
    },
    { 
      id: 5, 
      name: "圖文卡片組", 
      desc: "Gallery Grid CTA", 
      icon: Grid3x3,
      path: "/layout-5"
    },
    { 
      id: 6, 
      name: "雙欄強對比", 
      desc: "Dark / Light Split", 
      icon: Grid2x2,
      path: "/layout-6"
    },
    { 
      id: 7, 
      name: "卡片堆疊式", 
      desc: "Stacked Cards", 
      icon: Layers,
      path: "/layout-7"
    },
    { 
      id: 8, 
      name: "視覺導向型", 
      desc: "Video / Motion Header", 
      icon: Video,
      path: "/layout-8"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Landing Page Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            8種專業級的 Lead Magnet 頁面布局設計
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {layouts.map((layout, idx) => (
            <Link 
              key={layout.id} 
              to={layout.path}
              className="group"
            >
              <Card 
                className="p-6 h-full hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-card animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <layout.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                      {layout.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{layout.desc}</p>
                  </div>
                  <div className="text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    查看範例 →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="text-center pt-12 space-y-4 animate-fade-in">
          <div className="inline-block bg-card px-6 py-3 rounded-full shadow-card">
            <p className="text-sm text-muted-foreground">
              所有模板均採用響應式設計，支援各種裝置 📱💻
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
