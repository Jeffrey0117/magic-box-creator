import { getTemplatesByCategory } from '@/components/templates/registry';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

interface TemplateSelectorProps {
  currentTemplate: string;
  onSelect: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
  packageShortCode?: string;
}

export const TemplateSelector = ({ 
  currentTemplate, 
  onSelect,
  onPreview,
  packageShortCode
}: TemplateSelectorProps) => {
  const templatesByCategory = getTemplatesByCategory();
  const [userProfile, setUserProfile] = useState<Tables<'user_profiles'> | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    setUserProfile(data || null);
  };

  const userTier = userProfile?.membership_tier || 'free';

  const handlePreview = () => {
    if (packageShortCode) {
      // 在新視窗預覽
      window.open(`/${packageShortCode}`, '_blank');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const allTemplates = Object.values(templatesByCategory).flat();
    const template = allTemplates.find(t => t.id === templateId);
    
    // 檢查是否為進階模板且使用者為免費會員
    if (template?.tier === 'premium' && userTier !== 'premium') {
      // 未來可以顯示升級提示或開啟付費頁面
      alert('🔒 此模板為進階會員專屬\n\n即將開放付費功能,敬請期待!');
      return;
    }

    onSelect(templateId);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">選擇模板</label>
        <Select value={currentTemplate} onValueChange={handleSelectTemplate}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="選擇模板樣式" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  {category}
                </div>
                {templates.map(template => {
                  const isLocked = template.tier === 'premium' && userTier !== 'premium';
                  
                  return (
                    <SelectItem 
                      key={template.id} 
                      value={template.id}
                      disabled={isLocked}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            {template.tier === 'premium' && (
                              <Badge 
                                variant={isLocked ? "outline" : "default"}
                                className="text-xs"
                              >
                                {isLocked ? '🔒 進階' : '⭐ 進階'}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {template.description}
                          </span>
                        </div>
                        {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </SelectItem>
                  );
                })}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* 會員等級提示 */}
        <div className="mt-2 text-xs text-muted-foreground">
          目前方案: {userTier === 'premium' ? '⭐ 進階會員' : '免費會員'}
        </div>
      </div>
      
      {packageShortCode && (
        <Button 
          variant="outline" 
          onClick={handlePreview}
          className="w-full gap-2"
        >
          <Eye className="w-4 h-4" />
          預覽效果
        </Button>
      )}

      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs text-muted-foreground">
          💡 選擇後會立即儲存並生效。您可以隨時切換模板樣式。
        </p>
      </div>
    </div>
  );
};