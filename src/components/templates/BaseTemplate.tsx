// 模板元件的基礎 Props 介面

import type { TemplateConfig } from '../../types/template-config';

export interface BoxTemplateProps {
  // 資料包資訊
  boxData: {
    id: string;
    keyword: string;
    content: string;
    quota: number | null;
    current_count: number;
    expires_at: string | null;
    creator_id: string;
    images: string[] | null;
    package_title: string | null;
    package_description: string | null;
    required_fields: { nickname?: boolean } | null;
    short_code: string;
    template_type: string;
    template_config?: TemplateConfig; // 模板專屬配置（進階模板使用）
  };
  
  // 表單狀態
  keyword: string;
  setKeyword: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  extraData: { nickname: string };
  setExtraData: (v: any) => void;
  
  // 功能回調
  onUnlock: (e: React.FormEvent) => void;
  onReset: () => void;
  
  // UI 狀態
  loading: boolean;
  result: string | null;
  currentCount: number;
  waitlistCount: number;
  isLoggedIn: boolean;
  isCreatorPreview: boolean;
}