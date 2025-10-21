// 模板註冊中心 - 單一真相來源

import { lazy, ComponentType } from 'react';
import { BoxTemplateProps } from './BaseTemplate';

// 模板定義介面
export interface TemplateConfig {
  id: string;                    // template_type 值
  name: string;                  // 顯示名稱
  description: string;           // 簡短說明
  category?: string;             // 分類 (基礎/進階)
  tier?: 'free' | 'premium';     // 會員等級 (免費/進階)
  thumbnail?: string;            // 縮圖 URL (可選)
  component: ComponentType<BoxTemplateProps>;  // React 元件
  enabled: boolean;              // 是否啟用
}

// 🔥 模板註冊表 (單一真相來源)
export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  // 免費模板 (4 個)
  {
    id: 'default',
    name: '經典樣式',
    description: '原有的 KeyBox 頁面設計',
    category: '基礎',
    tier: 'free',
    component: lazy(() => import('./TemplateDefault')),
    enabled: true,
  },
  {
    id: 'layout1',
    name: '左右分欄型',
    description: '圖片在左,表單在右',
    category: '基礎',
    tier: 'free',
    component: lazy(() => import('./TemplateLayout1')),
    enabled: true,
  },
  {
    id: 'layout2',
    name: 'Hero 卡片',
    description: '頂部 Banner + 下方表單',
    category: '基礎',
    tier: 'free',
    component: lazy(() => import('./TemplateLayout2')),
    enabled: true,
  },
  {
    id: 'layout4',
    name: '玻璃擬態',
    description: '全螢幕漸層背景 + 毛玻璃效果',
    category: '基礎',
    tier: 'free',
    component: lazy(() => import('./TemplateLayout4')),
    enabled: true,
  },
  
  // 進階模板 (4 個)
  {
    id: 'layout5',
    name: '特色網格',
    description: '3 張特色卡片 + CTA 表單',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout5')),
    enabled: true,
  },
  {
    id: 'layout6',
    name: '對比分欄',
    description: '左黑右白對比 + 數據展示',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout6')),
    enabled: true,
  },
  {
    id: 'layout7',
    name: '多段落長頁',
    description: '導航欄 + 多 Section + Footer',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout7')),
    enabled: true,
  },
  {
    id: 'layout8',
    name: '視訊風格',
    description: '全螢幕 + Play 按鈕 + 滾動指示',
    category: '進階',
    tier: 'premium',
    component: lazy(() => import('./TemplateLayout8')),
    enabled: true,
  },
];

// 🔥 工具函數

// 取得模板設定
export const getTemplate = (id: string): TemplateConfig | undefined => {
  return TEMPLATE_REGISTRY.find(t => t.id === id && t.enabled);
};

// 取得所有啟用的模板
export const getEnabledTemplates = (): TemplateConfig[] => {
  return TEMPLATE_REGISTRY.filter(t => t.enabled);
};

// 取得模板元件 (找不到或停用則返回 default)
export const getTemplateComponent = (id: string) => {
  const template = getTemplate(id);
  return template?.component || getTemplate('default')!.component;
};

// 依分類分組
export const getTemplatesByCategory = () => {
  return getEnabledTemplates().reduce((acc, template) => {
    const cat = template.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(template);
    return acc;
  }, {} as Record<string, TemplateConfig[]>);
};