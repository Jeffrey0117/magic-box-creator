import { useState, useEffect, Suspense } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTemplateComponent } from "@/components/templates/registry";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const Box = () => {
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boxData, setBoxData] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [extraData, setExtraData] = useState({ nickname: '' });
  const [templateType, setTemplateType] = useState('default');
  const [isCreatorPreview, setIsCreatorPreview] = useState(false);
  const navigate = useNavigate();
  const { id, shortCode } = useParams();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (id) {
        await redirectToShortCode();
      } else if (shortCode) {
        await fetchBoxData();
        await checkAuthAndAutoUnlock();
      }
    };
    init();
  }, [id, shortCode]);

  const redirectToShortCode = async () => {
    const { data } = await supabase
      .from("keywords")
      .select("short_code")
      .eq("id", id)
      .maybeSingle();
    
    if (data?.short_code) {
      navigate(`/${data.short_code}`, { replace: true });
    } else {
      toast.error("找不到此資料包");
      navigate("/");
    }
  };

  const checkAuthAndAutoUnlock = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    console.log("🔍 Session:", session?.user.email);
    
    if (!session || (!id && !shortCode) || !session.user.email) {
      console.log("⚠️ 未通過檢查:", { hasSession: !!session, hasId: !!id, hasShortCode: !!shortCode, hasEmail: !!session?.user?.email });
      return;
    }

    let query = supabase.from("keywords").select("*");
    
    if (shortCode && !location.pathname.startsWith('/box/')) {
      query = query.eq("short_code", shortCode);
    } else if (id) {
      query = query.eq("id", id);
    }
    
    const { data: keywordData } = await query.maybeSingle();

    console.log("📦 Keyword data:", keywordData);
    if (!keywordData) return;

    // 🎯 檢查是否為創作者本人 (改為預覽模式,不再 redirect)
    if (session.user.id === keywordData.creator_id) {
      console.log("👤 創作者本人訪問,啟用預覽模式");
      setIsCreatorPreview(true);
      return; // 不自動解鎖,但繼續顯示頁面
    }

    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("id")
      .eq("keyword_id", keywordData.id)
      .eq("email", session.user.email)
      .maybeSingle();

    console.log("📋 Existing log:", existingLog);

    if (!existingLog) {
      console.log("✍️ 準備插入:", { keyword_id: keywordData.id, email: session.user.email });
      const { data: insertedData, error } = await supabase.from("email_logs").insert({
        keyword_id: keywordData.id,
        email: session.user.email,
      }).select();

      if (error) {
        console.error("❌ 插入失敗:", JSON.stringify(error, null, 2));
        console.error("❌ Error details:", error);
        toast.error("自動解鎖失敗，請稍後再試");
        return;
      }
      console.log("✅ 插入成功:", insertedData);
    }

    setResult(keywordData.content);
    toast.success(existingLog ? "🔓 歡迎回來！" : "🔓 自動解鎖成功！");
  };

  const fetchBoxData = async () => {
    let query = supabase.from("keywords").select("id, keyword, created_at, quota, current_count, expires_at, creator_id, images, package_title, package_description, required_fields, short_code, template_type, template_config, hide_author_info, unlock_rule_enabled, unlock_rule_json");
    
    if (shortCode && !location.pathname.startsWith('/box/')) {
      query = query.eq("short_code", shortCode);
    } else if (id) {
      query = query.eq("id", id);
    }
    
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      toast.error("找不到此資料包");
      navigate("/");
    } else {
      setBoxData(data);
      setTemplateType(data.template_type || 'default');
      
      if (data.quota) {
        setCurrentCount(data.current_count || 0);
      }

      if (data.quota && data.current_count >= data.quota) {
        const { count } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('keyword_id', data.id)
          .eq('status', 'waiting');
        
        setWaitlistCount(count || 0);
      }
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let keywordData;
      let matchedRule: any = null;
      
      if (id || shortCode) {
        let query = supabase.from("keywords").select("*");
        
        if (shortCode && !location.pathname.startsWith('/box/')) {
          query = query.eq("short_code", shortCode);
        } else if (id) {
          query = query.eq("id", id);
        }
        
        const { data, error: fetchError } = await query.maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) {
          toast.error("找不到此資料包，請確認關鍵字是否正確");
          setLoading(false);
          return;
        }

        // 進階規則驗證（多關鍵字）
        if (data.unlock_rule_enabled) {
          const raw = keyword.trim();
          const values = raw
            .split(/[,\s]+/)
            .map(v => v.toLowerCase().trim())
            .filter(Boolean);
 
          // 先讀取正規化資料表的規則，若無則回退至 JSON 欄位（向後相容）
          let rules: any[] = [];
          try {
            const { data: tableRules } = await supabase
              .from("unlock_rules")
              .select("*")
              .eq("package_id", data.id);

            if (tableRules && tableRules.length > 0) {
              rules = tableRules.map((r: any) => ({
                id: r.id,
                name: r.name,
                keywords: r.keywords || [],
                matchMode: r.match_mode,
                quota: r.quota,
                startAt: r.start_at,
                endAt: r.end_at,
                errorMessage: r.error_message,
              }));
            } else {
              rules = (data.unlock_rule_json as any[]) || [];
            }
          } catch {
            rules = (data.unlock_rule_json as any[]) || [];
          }
 
          const normalize = (arr: string[]) => arr.map(s => s.toLowerCase().trim()).filter(Boolean);
          const isRuleActive = (rule: any) => {
            const now = Date.now();
            const start = rule.startAt ? new Date(rule.startAt).getTime() : null;
            const end = rule.endAt ? new Date(rule.endAt).getTime() : null;
            if (start && now < start) return false;
            if (end && now > end) return false;
            return true;
          };
 
          const matchRule = (rule: any) => {
            const kws = normalize(rule.keywords || []);
            if (kws.length === 0) return false;
 
            const mode = (rule.matchMode || 'AND').toUpperCase();
            if (mode === 'AND') {
              return kws.every(k => values.includes(k));
            }
            if (mode === 'OR') {
              return kws.some(k => values.includes(k));
            }
            if (mode === 'ORDER') {
              // 必須完全相同順序匹配（忽略大小寫與空白）
              const v = values.join('|');
              const k = kws.join('|');
              return v === k;
            }
            return false;
          };
 
          const activeRules = rules.filter(isRuleActive);
          const hit = activeRules.find(matchRule);
 
          if (!hit) {
            const msg = rules.find(r => r?.errorMessage)?.errorMessage || "❌ 關鍵字組合不正確，請重新輸入";
            toast.error(msg);
            setLoading(false);
            return;
          }
 
          // 規則級配額檢查（以 email_logs.extra_data.rule_id 統計）
          if (hit?.quota != null) {
            const { count: ruleCount } = await supabase
              .from("email_logs")
              .select("*", { count: "exact", head: true })
              .eq("keyword_id", data.id)
              .contains("extra_data", { rule_id: hit.id });
            if ((ruleCount || 0) >= hit.quota) {
              toast.error("❌ 此規則配額已用完");
              setLoading(false);
              return;
            }
          }
 
          matchedRule = hit;
        } else {
          // 單一關鍵字驗證
          if (data.keyword !== keyword.toLowerCase().trim()) {
            toast.error("❌ 關鍵字錯誤，請重新輸入");
            setLoading(false);
            return;
          }
        }

        keywordData = data;
      } else {
        const { data, error: searchError } = await supabase
          .from("keywords")
          .select("*")
          .eq("keyword", keyword.toLowerCase().trim())
          .maybeSingle();

        if (searchError) throw searchError;

        if (!data) {
          toast.error("❌ 找不到此關鍵字，請確認是否正確");
          setLoading(false);
          return;
        }

        keywordData = data;
      }

      if (keywordData.quota) {
        const currentCount = keywordData.current_count || 0;
        
        if (currentCount >= keywordData.quota) {
          toast.error("❌ 此資料包已額滿！");
          setLoading(false);
          return;
        }
      }

      // 防刷：簡易速率限制（10 秒內同一 email 對同一資料包最多 3 次）
      try {
        const sinceIso = new Date(Date.now() - 10 * 1000).toISOString();
        const { count: recentCount } = await supabase
          .from("email_logs")
          .select("*", { count: "exact", head: true })
          .eq("keyword_id", keywordData.id)
          .eq("email", email.trim())
          .gte("unlocked_at", sinceIso);
        if ((recentCount || 0) >= 3) {
          toast.error("⚠️ 操作過於頻繁，請稍後再試");
          setLoading(false);
          return;
        }
      } catch {}

      const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("keyword_id", keywordData.id)
        .eq("email", email.trim())
        .maybeSingle();

      if (existingLog) {
        setResult(keywordData.content);
        toast.success("🔓 歡迎回來！您已領取過此資料包");
      } else {
        const extraDataToSave: any = {};
        const requiredFields = keywordData.required_fields as any || {};
        if (requiredFields.nickname) extraDataToSave.nickname = extraData.nickname;
        // 記錄此次提供的關鍵字與命中規則（若有）
        extraDataToSave.provided_keywords = (keyword || '')
          .split(/[,\s]+/)
          .map(v => v.toLowerCase().trim())
          .filter(Boolean);
        if (matchedRule?.id) extraDataToSave.rule_id = matchedRule.id;
 
        const { error: logError } = await supabase.from("email_logs").insert({
          keyword_id: keywordData.id,
          email: email.trim(),
          extra_data: Object.keys(extraDataToSave).length > 0 ? extraDataToSave : null,
        });
 
        if (logError) throw logError;
 
        setResult(keywordData.content);
        toast.success("🔓 解鎖成功！");
      }
    } catch (error: any) {
      console.error("解鎖錯誤:", error);
      toast.error("解鎖失敗，請稍後再試或聯繫創作者");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword("");
    setEmail("");
    setResult(null);
    setExtraData({ nickname: '' });
  };

  // 🔥 動態載入模板元件
  const TemplateComponent = getTemplateComponent(templateType);

  // 準備傳給模板的 props
  const templateProps = {
    boxData,
    keyword,
    setKeyword,
    email,
    setEmail,
    extraData,
    setExtraData,
    onUnlock: handleUnlock,
    onReset: handleReset,
    loading,
    result,
    currentCount,
    waitlistCount,
    isLoggedIn,
    isCreatorPreview,
  };

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      {isCreatorPreview && (
        <Alert className="mx-4 mt-4 bg-accent/10 border-accent">
          <Info className="h-4 w-4 text-accent" />
          <AlertTitle className="text-accent">創作者預覽模式</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>這是你的資料包,你可以預覽模板效果但無法領取。</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/creator')}
              className="text-accent hover:text-accent/80 p-0 h-auto"
            >
              返回後台 →
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <TemplateComponent {...templateProps} />
    </Suspense>
  );
};

export default Box;
