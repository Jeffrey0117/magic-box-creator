/**
 * Template Configuration Types
 *
 * Defines the structure for template-specific configurations
 * Used by advanced templates (Layout5-8) to store dynamic content
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * Feature card with icon, title, and description
 * Used by Layout5 and Layout7
 */
export interface FeatureCard {
  icon: string; // Lucide icon name (e.g., "Lightbulb", "Target")
  title: string;
  description: string;
}

/**
 * Statistical data card
 * Used by Layout6
 */
export interface StatCard {
  value: string; // Display value (e.g., "10K+", "95%")
  label: string; // Description label
  color?: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

/**
 * Social media link
 * Used by Layout7
 */
export interface SocialLink {
  platform: 'Twitter' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'GitHub' | 'YouTube';
  url: string;
}

/**
 * Learning point or benefit item
 * Used by Layout7 and Layout8
 */
export interface LearningPoint {
  title: string;
  description: string;
}

/**
 * Brand configuration
 * Used by Layout7
 */
export interface BrandConfig {
  logo_icon: string; // Lucide icon name
  name: string; // Brand name
}

// ============================================================================
// Template-Specific Configs
// ============================================================================

/**
 * Layout5 (Feature Grid) Configuration
 */
export interface Layout5Config {
  features: FeatureCard[]; // Minimum: 3, Maximum: 5
}

/**
 * Layout6 (Contrast Split) Configuration
 */
export interface Layout6Config {
  stats: StatCard[]; // Minimum: 2, Maximum: 4
}

/**
 * Layout7 (Multi-Section Long Page) Configuration
 */
export interface Layout7Config {
  brand: BrandConfig;
  features: FeatureCard[]; // Minimum: 3, Maximum: 6
  learning_points: LearningPoint[]; // Minimum: 3, Maximum: 5
  social_links: SocialLink[]; // Minimum: 1, Maximum: 5
}

/**
 * Layout8 (Video Style) Configuration
 */
export interface Layout8Config {
  learning_points: LearningPoint[]; // Minimum: 3, Maximum: 5
}

// ============================================================================
// Main Template Config Type
// ============================================================================

/**
 * Complete template configuration object
 * Stored in keywords.template_config JSONB column
 */
export interface TemplateConfig {
  layout5?: Layout5Config;
  layout6?: Layout6Config;
  layout7?: Layout7Config;
  layout8?: Layout8Config;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_LAYOUT5_CONFIG: Layout5Config = {
  features: [
    {
      icon: 'Lightbulb',
      title: '智慧策略',
      description: '學習經過驗證的技巧',
    },
    {
      icon: 'Target',
      title: '明確目標',
      description: '實現你的願景',
    },
    {
      icon: 'Zap',
      title: '快速成果',
      description: '看見立即影響',
    },
  ],
};

export const DEFAULT_LAYOUT6_CONFIG: Layout6Config = {
  stats: [
    {
      value: '10K+',
      label: '活躍用戶',
      color: 'orange',
    },
    {
      value: '95%',
      label: '成功率',
      color: 'blue',
    },
  ],
};

export const DEFAULT_LAYOUT7_CONFIG: Layout7Config = {
  brand: {
    logo_icon: 'Star',
    name: 'KeyBox',
  },
  features: [
    {
      icon: 'Users',
      title: '社群導向',
      description: '加入充滿活力的創作者社群',
    },
    {
      icon: 'TrendingUp',
      title: '持續成長',
      description: '透過數據洞察追蹤進度',
    },
    {
      icon: 'Star',
      title: '品質優先',
      description: '獲得專業級的工具與支援',
    },
  ],
  learning_points: [
    {
      title: '願景',
      description: '釐清你的創意目標',
    },
    {
      title: '策略',
      description: '建立可行動的計畫',
    },
    {
      title: '執行',
      description: '將想法變成現實',
    },
  ],
  social_links: [
    {
      platform: 'Twitter',
      url: 'https://twitter.com',
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com',
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com',
    },
  ],
};

export const DEFAULT_LAYOUT8_CONFIG: Layout8Config = {
  learning_points: [
    {
      title: '願景',
      description: '釐清你的創意目標',
    },
    {
      title: '策略',
      description: '建立可行動的計畫',
    },
    {
      title: '執行',
      description: '將想法變成現實',
    },
  ],
};

// ============================================================================
// Available Icons
// ============================================================================

/**
 * List of supported Lucide icons
 * Can be extended as needed
 */
export const AVAILABLE_ICONS = [
  'Lightbulb',
  'Target',
  'Zap',
  'Star',
  'Users',
  'TrendingUp',
  'Heart',
  'Award',
  'Shield',
  'Rocket',
  'Gift',
  'Trophy',
  'Sparkles',
  'Crown',
  'Flame',
  'CheckCircle',
  'Mail',
  'Phone',
  'Calendar',
  'Clock',
] as const;

export type AvailableIcon = (typeof AVAILABLE_ICONS)[number];

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate feature cards array
 */
export const validateFeatureCards = (cards: FeatureCard[], min = 3, max = 5): boolean => {
  if (!Array.isArray(cards)) return false;
  if (cards.length < min || cards.length > max) return false;
  return cards.every((card) => card.icon && card.title && card.description);
};

/**
 * Validate stat cards array
 */
export const validateStatCards = (cards: StatCard[], min = 2, max = 4): boolean => {
  if (!Array.isArray(cards)) return false;
  if (cards.length < min || cards.length > max) return false;
  return cards.every((card) => card.value && card.label);
};

/**
 * Validate learning points array
 */
export const validateLearningPoints = (points: LearningPoint[], min = 3, max = 5): boolean => {
  if (!Array.isArray(points)) return false;
  if (points.length < min || points.length > max) return false;
  return points.every((point) => point.title && point.description);
};

/**
 * Validate social links array
 */
export const validateSocialLinks = (links: SocialLink[], min = 1, max = 5): boolean => {
  if (!Array.isArray(links)) return false;
  if (links.length < min || links.length > max) return false;
  return links.every((link) => link.platform && link.url);
};
