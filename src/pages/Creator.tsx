import { useState, useEffect, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Download, Edit, ClipboardList, User, Eye, Package, Users, TrendingUp, BarChart3, FileText, History, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { generateUniqueShortCode } from "@/lib/shortcode";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { TemplateSelector } from "@/components/TemplateSelector";
import { Tables } from "@/integrations/supabase/types";
import { getTemplateComponent } from "@/components/templates/registry";
import { Layout5ConfigEditor } from "@/components/template-editors/Layout5ConfigEditor";
import { Layout6ConfigEditor } from "@/components/template-editors/Layout6ConfigEditor";
import { Layout7ConfigEditor } from "@/components/template-editors/Layout7ConfigEditor";
import { Layout8ConfigEditor } from "@/components/template-editors/Layout8ConfigEditor";
import type { TemplateConfig } from "@/types/template-config";
import { DEFAULT_LAYOUT5_CONFIG, DEFAULT_LAYOUT6_CONFIG, DEFAULT_LAYOUT7_CONFIG, DEFAULT_LAYOUT8_CONFIG } from "@/types/template-config";

interface Keyword {
  id: string;
  keyword: string;
  content: string;
  created_at: string;
  short_code?: string;
  quota?: number | null;
  email_count?: number;
  today_count?: number;
  unlock_rule_enabled?: boolean;
  unlock_rule_json?: any;
}

interface EmailLog {
  id: string;
  email: string;
  unlocked_at: string;
}

interface MyRecord {
  id: string;
  keyword_id: string;
  email: string;
  unlocked_at: string;
  keywords: {
    id: string;
    keyword: string;
    content: string;
  };
}

// 圖片過濾函數 - 移除空白 URL
const filterEmptyImages = (urls: string[]): string[] | null => {
  const filtered = urls.filter(url => url.trim() !== '');
  return filtered.length > 0 ? filtered : null;
};

const Creator = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [showMyRecords, setShowMyRecords] = useState(false);
  const [myRecords, setMyRecords] = useState<MyRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editKeyword, setEditKeyword] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newQuota, setNewQuota] = useState("");
  const [editQuota, setEditQuota] = useState("");
  const [newExpiryDays, setNewExpiryDays] = useState("");
  const [newExpiryHours, setNewExpiryHours] = useState("");
  const [newExpiryMinutes, setNewExpiryMinutes] = useState("");
  const [editExpiryDays, setEditExpiryDays] = useState("");
  const [editExpiryHours, setEditExpiryHours] = useState("");
  const [editExpiryMinutes, setEditExpiryMinutes] = useState("");
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [editEnableExpiry, setEditEnableExpiry] = useState(false);
  const [userId, setUserId] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<Tables<'user_profiles'> | null>(null);
  const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [showBatchImageDialog, setShowBatchImageDialog] = useState(false);
  const [batchImageInput, setBatchImageInput] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [newPackageTitle, setNewPackageTitle] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');
  const [editPackageTitle, setEditPackageTitle] = useState('');
  const [editPackageDescription, setEditPackageDescription] = useState('');
  const [newRequiredFields, setNewRequiredFields] = useState({ nickname: false });
  const [editRequiredFields, setEditRequiredFields] = useState({ nickname: false });
  const [newTemplateType, setNewTemplateType] = useState('default');
  const [editTemplateType, setEditTemplateType] = useState('default');
  const [newHideAuthor, setNewHideAuthor] = useState(false);
  const [editHideAuthor, setEditHideAuthor] = useState(false);
  // 模板專屬配置
  const [newTemplateConfig, setNewTemplateConfig] = useState<TemplateConfig>({});
  const [editTemplateConfig, setEditTemplateConfig] = useState<TemplateConfig>({});
  // 進階規則（簡化 UI）
  const [newUnlockEnabled, setNewUnlockEnabled] = useState(false);
  const [newUnlockKeywords, setNewUnlockKeywords] = useState('');
  const [editUnlockEnabled, setEditUnlockEnabled] = useState(false);
  const [editUnlockKeywords, setEditUnlockKeywords] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'exhausted'>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [openRecordsDialog, setOpenRecordsDialog] = useState(false);
  // Schema probe flags（用於避免因未部署 migrations 造成 400/404）
  const [hasUnlockRulesTable, setHasUnlockRulesTable] = useState<boolean | null>(null);
  const [hasUnlockRuleColumns, setHasUnlockRuleColumns] = useState<boolean | null>(null);
  const [hasHideAuthorInfo, setHasHideAuthorInfo] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // 啟動時探測資料表/欄位是否存在（驗證 migrations 是否已部署）
  const probeSchema = async () => {
    try {
      const ur = await supabase.from('unlock_rules').select('id').limit(1);
      if (ur.error) {
        console.warn('🔎 probe unlock_rules 失敗（疑似 404 表不存在）:', ur.error);
        setHasUnlockRulesTable(false);
      } else {
        setHasUnlockRulesTable(true);
      }
    } catch (e) {
      console.warn('🔎 probe unlock_rules 例外:', e);
      setHasUnlockRulesTable(false);
    }

    try {
      const kw = await supabase.from('keywords').select('id, unlock_rule_json, unlock_rule_enabled').limit(1);
      if (kw.error) {
        console.warn('🔎 probe keywords.unlock_rule_* 欄位失敗（疑似未加欄位）:', kw.error);
        setHasUnlockRuleColumns(false);
      } else {
        setHasUnlockRuleColumns(true);
      }
    } catch (e) {
      console.warn('🔎 probe keywords.unlock_rule_* 欄位例外:', e);
      setHasUnlockRuleColumns(false);
    }

    // 檢查 keywords.hide_author_info 欄位（避免 schema cache 未更新導致 400）
    try {
      const kw2 = await supabase.from('keywords').select('id, hide_author_info').limit(1);
      if (kw2.error) {
        console.warn('🔎 probe keywords.hide_author_info 欄位失敗（疑似未加欄位或 schema cache 未更新）:', kw2.error);
        setHasHideAuthorInfo(false);
      } else {
        setHasHideAuthorInfo(true);
      }
    } catch (e) {
      console.warn('🔎 probe keywords.hide_author_info 欄位例外:', e);
      setHasHideAuthorInfo(false);
    }
  };
 
  useEffect(() => {
    checkAuth();
    fetchKeywords();
    fetchMyRecords();
    fetchUserProfile();
    // 探測 schema 狀態
    probeSchema();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      setUserEmail(session.user.email || "");
      setUserId(session.user.id);
    }
  };

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('🔍 fetchUserProfile 結果:', { data, error });
    
    if (error) {
      console.error('載入個人資料失敗:', error);
    }
    
    setUserProfile(data || null);
  };

  const fetchKeywords = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("keywords")
      .select("*")
      .eq("creator_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("無法載入關鍵字列表");
      setLoading(false);
      return;
    }

    const keywordsWithStats = await Promise.all(
      (data || []).map(async (keyword) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
          .from("email_logs")
          .select("*", { count: "exact" })
          .eq("keyword_id", keyword.id)
          .gte("unlocked_at", today.toISOString());

        return {
          ...keyword,
          email_count: keyword.current_count || 0,
          today_count: todayCount || 0,
        };
      })
    );

    setKeywords(keywordsWithStats);
    setLoading(false);
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const shortCode = await generateUniqueShortCode(supabase);
 
    const expiresAt = enableExpiry && (newExpiryDays || newExpiryHours || newExpiryMinutes)
      ? new Date(Date.now() + (parseInt(newExpiryDays || "0") * 24 * 60 + parseInt(newExpiryHours || "0") * 60 + parseInt(newExpiryMinutes || "0")) * 60 * 1000).toISOString()
      : null;

    // 組裝進階規則（OR 模式，允許 1+ 關鍵字）
    let parsedNewRules: any = null;
    if (newUnlockEnabled) {
      const kws = (newUnlockKeywords || '')
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      parsedNewRules = [{
        name: '多關鍵字規則',
        keywords: kws,
        matchMode: 'OR',
      }];
    }
 
    // 動態組裝 payload，避免未部署欄位造成 400
    const insertPayload: any = {
      keyword: newKeyword.toLowerCase().trim(),
      content: newContent,
      creator_id: session.user.id,
      short_code: shortCode,
      quota: newQuota ? parseInt(newQuota) : null,
      expires_at: expiresAt,
      images: filterEmptyImages(newImageUrls),
      package_title: newPackageTitle.trim() || null,
      package_description: newPackageDescription.trim() || null,
      required_fields: newRequiredFields,
      template_type: newTemplateType,
    };
    // 僅在欄位存在時送出，避免 schema cache 未含此欄位導致 400
    if (hasHideAuthorInfo === true) {
      insertPayload.hide_author_info = newHideAuthor;
    }
    if (hasUnlockRuleColumns) {
      insertPayload.unlock_rule_enabled = newUnlockEnabled;
      insertPayload.unlock_rule_json = parsedNewRules;
    }

    const { data: inserted, error } = await supabase
      .from("keywords")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("新增關鍵字失敗:", error);
      toast.error("新增失敗，請確認關鍵字是否重複");
    } else {
      // 同步進新表（使用新表；同時保留 JSON 作為相容備援）
      try {
        if (newUnlockEnabled && inserted?.id && hasUnlockRulesTable) {
          await supabase.from('unlock_rules').delete().eq('package_id', inserted.id);
          const arr = Array.isArray(parsedNewRules) ? parsedNewRules : [];
          if (arr.length > 0) {
            const rows = arr.map((r: any) => ({
              package_id: inserted.id,
              name: r.name ?? null,
              keywords: Array.isArray(r.keywords) ? r.keywords : [],
              match_mode: 'OR',
              quota: r.quota ?? null,
              start_at: r.startAt ? new Date(r.startAt).toISOString() : null,
              end_at: r.endAt ? new Date(r.endAt).toISOString() : null,
              error_message: r.errorMessage ?? null,
            }));
            if (rows.length > 0) {
              await supabase.from('unlock_rules').insert(rows);
            }
          }
        } else if (newUnlockEnabled && inserted?.id && hasUnlockRulesTable === false) {
          console.warn('🔧 unlock_rules 表不存在，跳過插入（使用 JSON 備援）');
        }
      } catch (e) {
        console.warn('同步 unlock_rules 失敗（將使用 JSON 作為備援）:', e);
      }
      toast.success("關鍵字已新增！");
      cancelAdd();
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string, keyword: string) => {
    const userInput = prompt(`⚠️ 危險操作！刪除後無法復原\n\n請輸入關鍵字「${keyword}」以確認刪除：`);
    
    if (userInput !== keyword) {
      if (userInput !== null) {
        toast.error("關鍵字不符，取消刪除");
      }
      return;
    }

    const { error } = await supabase.from("keywords").delete().eq("id", id);

    if (error) {
      console.error("刪除關鍵字失敗:", error);
      toast.error("刪除失敗，請稍後再試");
    } else {
      toast.success("已刪除");
      fetchKeywords();
    }
  };

  const handleEdit = async (item: any) => {
    setEditingKeywordId(item.id);
    setEditKeyword(item.keyword);
    setEditContent(item.content);
    setEditQuota(item.quota?.toString() || "");
    setEditImageUrls(item.images || []);
    setEditPackageTitle(item.package_title || '');
    setEditPackageDescription(item.package_description || '');
    setEditRequiredFields(
      item.required_fields
        ? (typeof item.required_fields === 'object' ? item.required_fields as any : { nickname: false })
        : { nickname: false }
    );
    setEditTemplateType(item.template_type || 'default');
    setEditHideAuthor(!!item.hide_author_info);

    // 載入模板專屬配置
    setEditTemplateConfig(item.template_config || {});

    // 設定簡化規則欄位（預設取舊 JSON 的第一組）
    setEditUnlockEnabled(!!item.unlock_rule_enabled);
    (() => {
      const fromJson = Array.isArray(item.unlock_rule_json) ? item.unlock_rule_json : [];
      if (fromJson && fromJson.length > 0) {
        const r = fromJson[0];
        setEditUnlockKeywords(Array.isArray(r.keywords) ? r.keywords.join(', ') : '');
      } else {
        setEditUnlockKeywords('');
      }
    })();

    // 若新表有資料，優先以新表第一筆覆蓋（使用新表，並保留向後相容）
    try {
      const { data: ruleRows } = await supabase
        .from('unlock_rules')
        .select('*')
        .eq('package_id', item.id);
      if (ruleRows && ruleRows.length > 0) {
        setEditUnlockEnabled(true);
        const r = ruleRows[0];
        const kws = Array.isArray(r.keywords) ? r.keywords : [];
        setEditUnlockKeywords(kws.join(', '));
      }
    } catch {}
    
    if (item.expires_at) {
      setEditEnableExpiry(true);
      const now = new Date().getTime();
      const expiry = new Date(item.expires_at).getTime();
      const minutesLeft = Math.ceil((expiry - now) / (1000 * 60));
      const daysLeft = Math.floor(minutesLeft / (24 * 60));
      const hoursLeft = Math.floor((minutesLeft % (24 * 60)) / 60);
      const remainingMinutes = minutesLeft % 60;
      
      setEditExpiryDays(daysLeft.toString());
      setEditExpiryHours(hoursLeft.toString().padStart(2, '0'));
      setEditExpiryMinutes(remainingMinutes.toString().padStart(2, '0'));
    } else {
      setEditEnableExpiry(false);
      setEditExpiryDays("");
      setEditExpiryHours("");
      setEditExpiryMinutes("");
    }
  };

  const handleUpdateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKeywordId) return;

    let expiresAt: string | null = null;
    
    if (editEnableExpiry && (editExpiryDays || editExpiryHours || editExpiryMinutes)) {
      const days = parseInt(editExpiryDays || "0");
      const hours = parseInt(editExpiryHours || "0");
      const minutes = parseInt(editExpiryMinutes || "0");
      const totalMs = (days * 24 * 60 + hours * 60 + minutes) * 60 * 1000;
      expiresAt = new Date(Date.now() + totalMs).toISOString();
    }

    // 組裝進階規則（OR 模式，允許 1+ 關鍵字）
    let parsedEditRules: any = null;
    let hasValidRule = false;
    if (editUnlockEnabled) {
      const kws = (editUnlockKeywords || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
      if (kws.length > 0) {
        parsedEditRules = [{
          name: '多關鍵字規則',
          keywords: kws,
          matchMode: 'OR',
        }];
        hasValidRule = true;
      } else {
        // 若啟用但沒有任何有效關鍵字，避免送出無效 JSON 造成 400
        parsedEditRules = null;
        hasValidRule = false;
      }
    }

    // 動態組裝 payload，避免未部署欄位造成 400
    const updatePayload: any = {
      keyword: editKeyword.toLowerCase().trim(),
      content: editContent,
      quota: editQuota ? parseInt(editQuota) : null,
      expires_at: expiresAt,
      images: filterEmptyImages(editImageUrls),
      package_title: editPackageTitle.trim() || null,
      package_description: editPackageDescription.trim() || null,
      required_fields: editRequiredFields,
      template_type: editTemplateType,
      template_config: editTemplateConfig,
    };
    // 僅在欄位存在時送出，避免 schema cache 未含此欄位導致 400
    if (hasHideAuthorInfo === true) {
      updatePayload.hide_author_info = editHideAuthor;
    }
    if (hasUnlockRuleColumns) {
      if (editUnlockEnabled && hasValidRule && Array.isArray(parsedEditRules)) {
        updatePayload.unlock_rule_enabled = true;
        updatePayload.unlock_rule_json = parsedEditRules;
      } else {
        // 若未啟用或無有效規則，確保欄位為關閉狀態並清空 JSON，避免 400
        updatePayload.unlock_rule_enabled = false;
        updatePayload.unlock_rule_json = null;
      }
    }

    // 送出前記錄 payload（偵錯 400 用）
    try {
      console.debug("🛰️ keywords.update payload:", JSON.stringify(updatePayload));
    } catch {}

    const { error } = await supabase
      .from("keywords")
      .update(updatePayload)
      .eq("id", editingKeywordId);

    if (error) {
      // 補充更多錯誤訊息以定位 400 來源
      console.error("更新關鍵字失敗:", {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        code: (error as any)?.code,
      });
      toast.error("更新失敗，請稍後再試");
    } else {
      // 使用新表同步（若啟用），否則清空規則表資料以回退為停用狀態（向後相容保留 JSON）
      try {
        if (editingKeywordId) {
          if (editUnlockEnabled && hasUnlockRulesTable) {
            await supabase.from('unlock_rules').delete().eq('package_id', editingKeywordId);
            const arr = Array.isArray(parsedEditRules) ? parsedEditRules : [];
            if (arr.length > 0) {
              const rows = arr.map((r: any) => ({
                package_id: editingKeywordId,
                name: r.name ?? null,
                keywords: Array.isArray(r.keywords) ? r.keywords : [],
                match_mode: 'OR',
                quota: r.quota ?? null,
                start_at: r.startAt ? new Date(r.startAt).toISOString() : null,
                end_at: r.endAt ? new Date(r.endAt).toISOString() : null,
                error_message: r.errorMessage ?? null,
              }));
              if (rows.length > 0) {
                await supabase.from('unlock_rules').insert(rows);
              }
            }
          } else if (editUnlockEnabled && hasUnlockRulesTable === false) {
            console.warn('🔧 unlock_rules 表不存在（更新），跳過同步（使用 JSON 備援）');
          } else if (hasUnlockRulesTable) {
            // 停用規則時清理 unlock_rules（若表存在）
            await supabase.from('unlock_rules').delete().eq('package_id', editingKeywordId);
          }
        }
      } catch (e) {
        console.warn('同步 unlock_rules（更新）失敗（將使用 JSON 作為備援）:', e);
      }

      toast.success("更新成功！");
      setEditingKeywordId(null);
      setEditKeyword("");
      setEditContent("");
      setEditQuota("");
      setEditExpiryDays("");
      setEditExpiryHours("");
      setEditExpiryMinutes("");
      setEditEnableExpiry(false);
      setEditImageUrls([]);
      setEditPackageTitle('');
      setEditPackageDescription('');
      setEditRequiredFields({ nickname: false });
      setEditTemplateType('default');
      setEditUnlockEnabled(false);
      setEditUnlockKeywords('');
      setEditHideAuthor(false);
      fetchKeywords();
    }
  };

  const handleBatchImagePaste = () => {
    const urls = batchImageInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '')
      .slice(0, 5);
    
    if (isEditMode) {
      setEditImageUrls(urls);
    } else {
      setNewImageUrls(urls);
    }
    
    setShowBatchImageDialog(false);
    setBatchImageInput('');
    toast.success(`已匯入 ${urls.length} 張圖片`);
  };

  const cancelEdit = () => {
    setEditingKeywordId(null);
    setEditKeyword("");
    setEditContent("");
    setEditQuota("");
    setEditExpiryDays("");
    setEditExpiryHours("");
    setEditExpiryMinutes("");
    setEditEnableExpiry(false);
    setEditImageUrls([]);
    setEditPackageTitle('');
    setEditPackageDescription('');
    setEditRequiredFields({ nickname: false });
    setEditTemplateType('default');
    // reset simplified unlock rule editor states
    setEditUnlockEnabled(false);
    setEditUnlockKeywords('');
    setEditHideAuthor(false);
    setEditTemplateConfig({});
  };

  const cancelAdd = () => {
    setShowAddSheet(false);
    setNewKeyword("");
    setNewContent("");
    setNewQuota("");
    setNewExpiryDays("");
    setNewExpiryHours("");
    setNewExpiryMinutes("");
    setEnableExpiry(false);
    setNewImageUrls([]);
    setNewPackageTitle('');
    setNewPackageDescription('');
    setNewRequiredFields({ nickname: false });
    setNewTemplateType('default');
    setNewHideAuthor(false);
    setNewUnlockEnabled(false);
    setNewUnlockKeywords('');
    setNewTemplateConfig({});
  };

  const fetchEmailLogs = async (keywordId: string) => {
    const { data, error } = await supabase
      .from("email_logs")
      .select("id, email, unlocked_at")
      .eq("keyword_id", keywordId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("載入領取記錄失敗:", error);
      toast.error("無法載入領取記錄，請重新整理頁面");
    } else {
      setEmailLogs(data || []);
      setSelectedKeywordId(keywordId);
    }
  };

  const fetchMyRecords = async () => {
    setLoadingRecords(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoadingRecords(false);
      return;
    }

    const { data, error } = await supabase
      .from("email_logs")
      .select(`
        id,
        keyword_id,
        email,
        unlocked_at,
        keywords (
          id,
          keyword,
          content
        )
      `)
      .eq("email", session.user.email)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("載入我的領取記錄失敗:", error);
      toast.error("無法載入領取記錄，請稍後再試");
    } else {
      setMyRecords(data || []);
    }
    setLoadingRecords(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteEmailLog = async (logId: string, email: string) => {
    if (!confirm(`確定要刪除 ${email} 的領取記錄嗎？`)) {
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("請先登入");
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("email_logs")
      .delete()
      .eq("id", logId)
      .select();

    if (error) {
      console.error("刪除領取記錄失敗:", error);
      toast.error(`刪除失敗：${error.message || "請稍後再試"}`);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("刪除似乎沒有影響任何記錄");
      toast.error("刪除失敗：找不到該記錄或無權限刪除");
      return;
    }
    
    console.log("刪除成功，受影響的記錄:", data);
    toast.success("已刪除該筆記錄");
    
    if (selectedKeywordId) {
      await fetchEmailLogs(selectedKeywordId);
    }
    
    await fetchKeywords();
  };

  const exportToCSV = (keywordId: string, keywordName: string) => {
    const logs = emailLogs.filter(log => log.email);
    
    if (logs.length === 0) {
      toast.error("沒有可匯出的記錄");
      return;
    }
    
    const csvContent = [
      'Email,領取時間',
      ...logs.map(log => `${log.email},${new Date(log.unlocked_at).toLocaleString('zh-TW')}`)
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keybox_${keywordName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('已匯出 CSV 檔案！');
  };

  // 計算儀表板統計數據
  const dashboardStats = useMemo(() => {
    const totalPackages = keywords.length;
    const totalClaims = keywords.reduce((sum, item) => sum + (item.email_count || 0), 0);
    const todayGrowth = keywords.reduce((sum, item) => sum + (item.today_count || 0), 0);
    
    return { totalPackages, totalClaims, todayGrowth };
  }, [keywords]);

  // 計算是否過期
  const isExpired = (item: Keyword): boolean => {
    if (!item.expires_at) return false;
    return new Date(item.expires_at).getTime() <= Date.now();
  };

  // 取得關鍵字狀態
  const getKeywordStatus = (item: Keyword): 'active' | 'warning' | 'exhausted' => {
    if (!item.quota) return 'active';
    const remaining = item.quota - (item.email_count || 0);
    const percentage = remaining / item.quota;
    
    if (remaining <= 0) return 'exhausted';
    if (percentage <= 0.2) return 'warning';
    return 'active';
  };

  // 篩選關鍵字
  const filteredKeywords = useMemo(() => {
    return keywords.filter(item => {
      // 搜尋過濾
      const matchesSearch = searchKeyword.trim() === '' ||
        item.keyword.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.content.toLowerCase().includes(searchKeyword.toLowerCase());
      
      // 狀態過濾
      const matchesStatus = statusFilter === 'all' || getKeywordStatus(item) === statusFilter;
      
      // 過期狀態過濾
      const matchesExpiry = expiryFilter === 'all' ||
        (expiryFilter === 'expired' && isExpired(item)) ||
        (expiryFilter === 'active' && !isExpired(item));
      
      return matchesSearch && matchesStatus && matchesExpiry;
    });
  }, [keywords, searchKeyword, statusFilter, expiryFilter]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient">KeyBox 管理面板 🔑</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 break-all">
              {userEmail && <span className="font-medium text-accent">{userEmail}</span>}
              {userEmail && " - "}
              管理您的關鍵字與內容
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出</span>
          </Button>
        </div>

        {/* 頂部儀表板 - 三個關鍵指標 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 總資料包數 - 紫色 */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                總資料包
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {dashboardStats.totalPackages}
              </div>
              <p className="text-xs text-muted-foreground mt-1">個資料包</p>
            </CardContent>
          </Card>

          {/* 總領取數 - 藍色 */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                總領取數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardStats.totalClaims}
              </div>
              <p className="text-xs text-muted-foreground mt-1">累計領取人次</p>
            </CardContent>
          </Card>

          {/* 今日新增 - 綠色 */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                今日新增
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                +{dashboardStats.todayGrowth}
              </div>
              <p className="text-xs text-muted-foreground mt-1">今日領取人次</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              個人資料
            </CardTitle>
            <CardDescription>您的公開資料，將顯示在資料包創作者資訊中</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">暱稱</p>
                <p className="font-medium">{userProfile?.display_name || '(未設定)'}</p>
              </div>
            </div>
            {userProfile?.bio && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">自我介紹</p>
                <p className="text-sm">{userProfile.bio}</p>
              </div>
            )}
            <Button
              onClick={() => setShowProfileDialog(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              編輯個人資料
            </Button>
          </CardContent>
        </Card>

        <ProfileEditDialog
          open={showProfileDialog}
          onOpenChange={(open) => {
            setShowProfileDialog(open);
            if (!open) fetchUserProfile();
          }}
          userId={userId}
          userEmail={userEmail}
        />

        {/* 會員方案狀態 + 升級引導 */}
        {(() => {
          const tier = userProfile?.membership_tier || 'free';
          const tierLabel = tier === 'premium' ? '專業版' : tier === 'standard' ? '標準版' : '免費版';
          const tierBadge = tier === 'premium'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
            : tier === 'standard'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
          return (
            <Card className="mb-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge className={`${tierBadge} border-0 text-sm px-3 py-1`}>{tierLabel}</Badge>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">目前方案：{tierLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      {tier === 'free' && '升級解鎖無限資料包、全部模板與進階規則'}
                      {tier === 'standard' && '升級專業版解鎖 API 整合與白標選項'}
                      {tier === 'premium' && '你已解鎖所有功能，感謝訂閱 🎉'}
                    </p>
                  </div>
                </div>
                {tier !== 'premium' && (
                  <Button
                    onClick={() => navigate(`/checkout?tier=${tier === 'free' ? 'standard' : 'premium'}`)}
                    className="gradient-magic shrink-0 gap-2 w-full sm:w-auto"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {tier === 'free' ? '升級標準版' : '升級專業版'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })()}

        <div className="glass-card rounded-2xl p-4 md:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg md:text-xl font-semibold">關鍵字列表</h2>
            <Button
              size="lg"
              onClick={() => setShowAddSheet(true)}
              className="px-8 py-5 md:py-6 text-lg font-semibold hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              🔥 新增關鍵字
            </Button>
          </div>

          {/* 搜尋與篩選區 */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* 搜尋框 */}
              <div className="flex-1">
                <Input
                  placeholder="🔍 搜尋關鍵字或內容..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="h-10"
                />
              </div>
              
              {/* 狀態篩選 */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className="flex-1 sm:flex-none"
                >
                  全部
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                  className="flex-1 sm:flex-none gap-1"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  使用中
                </Button>
                <Button
                  variant={statusFilter === 'warning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('warning')}
                  className="flex-1 sm:flex-none gap-1"
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  即將用完
                </Button>
                <Button
                  variant={statusFilter === 'exhausted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('exhausted')}
                  className="flex-1 sm:flex-none gap-1"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  已用完
                </Button>
              </div>

              {/* 過期狀態篩選 */}
              <div className="lg:border-l lg:pl-3">
                <Select value={expiryFilter} onValueChange={(value: 'all' | 'active' | 'expired') => setExpiryFilter(value)}>
                  <SelectTrigger className="w-full lg:w-[140px] h-9">
                    <SelectValue placeholder="時效篩選" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部時效</SelectItem>
                    <SelectItem value="active">⏰ 使用中（未過期）</SelectItem>
                    <SelectItem value="expired">⛔ 已過期</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 視圖模式切換 */}
              <div className="flex gap-2 lg:border-l lg:pl-3">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="flex-1 lg:flex-none gap-2"
                  title="卡片模式"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">卡片</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 lg:flex-none gap-2"
                  title="列表模式"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">列表</span>
                </Button>
              </div>
            </div>
            
            {/* 顯示篩選結果統計 */}
            {(searchKeyword || statusFilter !== 'all' || expiryFilter !== 'all') && (
              <div className="text-sm text-muted-foreground">
                找到 {filteredKeywords.length} 個關鍵字
                {searchKeyword && ` (搜尋: "${searchKeyword}")`}
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              setShowMyRecords(!showMyRecords);
              if (!showMyRecords && myRecords.length === 0) {
                fetchMyRecords();
              }
            }}
            variant="outline"
            className="mb-4 w-full md:w-auto"
          >
            {showMyRecords ? "隱藏" : "查看"}我的領取記錄
          </Button>

          {showMyRecords && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-3">我領取過的資料包</h3>
              {loadingRecords ? (
                <div className="text-center py-4 text-muted-foreground">載入中...</div>
              ) : myRecords.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  還沒有領取任何資料包
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                 {myRecords.map((record) => (
                   <div
                     key={record.id}
                     className="flex flex-col sm:flex-row gap-3 p-3 bg-background rounded"
                   >
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-sm md:text-base">
                         關鍵字：{record.keywords?.keyword}
                       </p>
                       <p className="text-xs md:text-sm text-muted-foreground truncate">
                         {record.keywords?.content}
                       </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {new Date(record.unlocked_at).toLocaleString('zh-TW')}
                       </p>
                     </div>
                     <Button
                       size="sm"
                       onClick={() => navigate(`/box/${record.keyword_id}`)}
                       className="shrink-0 w-full sm:w-auto"
                     >
                       重新查看
                     </Button>
                   </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                載入中...
              </div>
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              還沒有任何關鍵字，點擊上方按鈕新增第一個！
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              沒有符合條件的關鍵字
            </div>
          ) : (
            <div className="space-y-2">
              {filteredKeywords.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row gap-4 p-4 rounded-lg transition-colors ${
                    isExpired(item)
                      ? 'border border-dashed border-slate-300 dark:border-slate-700 hover:bg-muted/50'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  {editingKeywordId === item.id ? (
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">編輯模式已啟用，請在右側面板中編輯</p>
                    </div>
                  ) : viewMode === 'card' ? (
                    <>
                      {/* 卡片模式：三欄式布局 */}
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6 flex-1">
                        {/* 左：主要資訊區 */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* 關鍵字 + 狀態點 + 過期Badge */}
                          <div className="flex items-center gap-2">
                            {(() => {
                              const status = getKeywordStatus(item);
                              const statusColors = {
                                active: 'bg-green-500',
                                warning: 'bg-yellow-500',
                                exhausted: 'bg-red-500'
                              };
                              return (
                                <span className={`w-2 h-2 rounded-full ${statusColors[status]} shrink-0`} />
                              );
                            })()}
                            <p className={`text-2xl font-bold truncate ${isExpired(item) ? 'text-muted-foreground' : 'text-accent'}`}>{item.keyword}</p>
                            {isExpired(item) && (
                              <Badge variant="destructive" className="shrink-0 bg-red-500 text-white dark:bg-red-600 dark:text-white">
                                   已過期
                                 </Badge>
                            )}
                          </div>
                          
                          {/* 回覆內容（截斷） */}
                          <div className="relative group">
                            <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
                              {item.content}
                            </p>
                            {item.content.length > 100 && (
                              <div className="absolute hidden group-hover:block z-10 top-0 left-0 right-0 p-2 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                <p className="text-sm whitespace-pre-line">{item.content}</p>
                              </div>
                            )}
                          </div>

                          {/* 專屬連結資訊 */}
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono break-all">
                              {item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`}
                            </span>
                          </div>
                        </div>

                        {/* 中：統計資訊區 */}
                        <div className="flex-shrink-0 lg:w-80">
                          <div className="grid grid-cols-3 gap-3">
                            {/* 總領取 - 藍色 */}
                            <div className={`text-center p-3 rounded-lg ${
                              isExpired(item)
                                ? 'bg-slate-200/40 border-slate-300/40 text-slate-600 dark:bg-slate-800/30 dark:border-slate-700/40 dark:text-slate-300 border-dashed'
                                : 'bg-blue-500/10 border border-blue-500/20'
                            }`}>
                              <div className={`text-lg font-bold ${
                                isExpired(item)
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                {item.email_count || 0}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">總領取</div>
                            </div>

                            {/* 今日新增 - 綠色 */}
                            <div className={`text-center p-3 rounded-lg ${
                              isExpired(item)
                                ? 'bg-slate-200/40 border-slate-300/40 text-slate-600 dark:bg-slate-800/30 dark:border-slate-700/40 dark:text-slate-300 border-dashed'
                                : 'bg-green-500/10 border border-green-500/20'
                            }`}>
                              <div className={`text-lg font-bold ${
                                isExpired(item)
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                +{item.today_count || 0}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">今日</div>
                            </div>

                            {/* 剩餘配額 - 黃色 */}
                            <div className={`text-center p-3 rounded-lg ${
                              isExpired(item)
                                ? 'bg-slate-200/40 border-slate-300/40 text-slate-600 dark:bg-slate-800/30 dark:border-slate-700/40 dark:text-slate-300 border-dashed'
                                : 'bg-yellow-500/10 border border-yellow-500/20'
                            }`}>
                              <div className={`text-lg font-bold ${
                                isExpired(item)
                                  ? 'text-slate-600 dark:text-slate-400'
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {item.quota ? item.quota - (item.email_count || 0) : '∞'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">剩餘</div>
                            </div>
                          </div>
                          
                          {/* 倒數計時器 */}
                          {item.expires_at && !isExpired(item) && (
                            <div className="mt-3">
                              <CountdownTimer expiresAt={item.expires_at} />
                            </div>
                          )}
                        </div>

                        {/* 右：操作區 */}
                        <div className="flex-shrink-0 flex flex-col gap-2 lg:w-auto">
                          {/* 綠色「複製連結」按鈕 */}
                          <Button
                            size="default"
                            className="bg-green-500 hover:bg-green-600 text-white gap-2"
                            onClick={() => {
                              if (isExpired(item)) {
                                toast.error("⚠️ 此資料包已過期，無法使用");
                                return;
                              }
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success("連結已複製！");
                            }}
                          >
                            📋 複製連結
                          </Button>

                          {/* 藍色「複製文案」按鈕 */}
                          <Button
                            size="default"
                            className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
                            onClick={() => {
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              const copyText = `🎁 我為你準備了一份專屬資料包！\n輸入關鍵字「${item.keyword}」即可免費領取：\n${url}\n👉 立即解鎖專屬內容！`;
                              navigator.clipboard.writeText(copyText);
                              toast.success("文案已複製！");
                            }}
                          >
                            <FileText className="w-4 h-4" />
                            複製文案
                          </Button>

                          {/* 橙色「查看記錄」按鈕 */}
                          <Button
                            size="default"
                            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                            onClick={() => {
                              fetchEmailLogs(item.id);
                              setOpenRecordsDialog(true);
                            }}
                          >
                            <History className="w-4 h-4" />
                            查看記錄
                          </Button>

                          {/* 灰色「預覽」按鈕 */}
                          <Button
                            size="default"
                            className="bg-slate-700 hover:bg-slate-600 text-white gap-2"
                            onClick={() => {
                              if (isExpired(item)) {
                                toast.warning("⚠️ 此資料包已過期");
                              }
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            預覽
                          </Button>

                          {/* 垂直三點選單 */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1 text-accent hover:text-accent/80"
                              onClick={() => handleEdit(item)}
                              title="編輯"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1 text-destructive hover:text-destructive/80"
                              onClick={() => handleDelete(item.id, item.keyword)}
                              title="刪除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1"
                              onClick={() => window.open(`/admin/packages/${item.short_code || item.id}`, '_blank')}
                              title="進階分析"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 列表模式：緊湊布局 */}
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* 上半部分：2x2 網格 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 關鍵字 + 過期Badge */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">關鍵字</p>
                            <div className="flex items-center gap-2">
                              <p className={`text-lg font-bold ${isExpired(item) ? 'text-muted-foreground' : 'text-accent'}`}>{item.keyword}</p>
                              {isExpired(item) && (
                                <Badge variant="destructive" className="shrink-0 bg-red-500 text-white dark:bg-red-600 dark:text-white">
                                    已過期
                                  </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* 回覆內容 */}
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">回覆內容</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-line">
                              {item.content}
                            </p>
                          </div>
                        </div>

                        {/* 下半部分：統計資訊橫排 */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">📊 總領取：</span>
                            <span className="font-semibold">{item.email_count || 0} 人</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">📈 今日：</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">+{item.today_count || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* 中間連結操作區 */}
                      <div className="space-y-2 min-w-0 md:min-w-[300px]">
                        <p className="text-xs text-muted-foreground">專屬連結</p>
                        <div className="flex gap-2 flex-wrap">
                          <code className={`text-xs px-2 py-1 rounded flex-1 min-w-0 truncate ${
                            isExpired(item)
                              ? 'text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700'
                              : 'bg-muted'
                          }`}>
                            {item.short_code
                              ? `${window.location.origin}/${item.short_code}`
                              : `${window.location.origin}/box/${item.id}`}
                          </code>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => {
                              if (isExpired(item)) {
                                toast.error("⚠️ 此資料包已過期，無法使用");
                                return;
                              }
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success("連結已複製！");
                            }}
                          >
                            📋 複製連結
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              const copyText = `🎁 我為你準備了一份專屬資料包！\n輸入關鍵字「${item.keyword}」即可免費領取：\n${url}\n👉 立即解鎖專屬內容！`;
                              navigator.clipboard.writeText(copyText);
                              toast.success("文案已複製！");
                            }}
                          >
                            複製文案
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isExpired(item)) {
                                toast.warning("⚠️ 此資料包已過期");
                              }
                              const url = item.short_code
                                ? `${window.location.origin}/${item.short_code}`
                                : `${window.location.origin}/box/${item.id}`;
                              window.open(url, '_blank');
                            }}
                          >
                            👁️ 預覽
                          </Button>
                          <Button
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => {
                              fetchEmailLogs(item.id);
                              setOpenRecordsDialog(true);
                            }}
                          >
                            📋 查看領取記錄
                          </Button>
                        </div>
                      </div>

                      {/* 右側編輯區 */}
                      <div className="flex md:flex-col gap-2 self-start md:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="flex-1 md:flex-none"
                        >
                          ✏️ 編輯
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 md:flex-none text-destructive hover:text-destructive/80"
                          onClick={() => handleDelete(item.id, item.keyword)}
                        >
                          🗑️ 刪除
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 領取記錄弹窗 */}
          <Dialog open={openRecordsDialog} onOpenChange={setOpenRecordsDialog}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col rounded-lg">
              <DialogHeader>
                <DialogTitle>領取記錄 ({emailLogs.length})</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const emails = emailLogs.map(log => log.email).join(',');
                      navigator.clipboard.writeText(emails);
                      toast.success(`已複製 ${emailLogs.length} 個 Email（逗號分隔）`);
                    }}
                    className="gap-2 w-full sm:flex-1 border-accent text-accent hover:bg-accent/10"
                  >
                    複製全部 Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const keyword = keywords.find(k => k.id === selectedKeywordId);
                      if (keyword) exportToCSV(selectedKeywordId, keyword.keyword);
                    }}
                    className="gap-2 w-full sm:flex-1"
                  >
                    <Download className="w-4 h-4" />
                    匯出 CSV
                  </Button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {emailLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{log.email}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.unlocked_at).toLocaleString('zh-TW')}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(log.email);
                            toast.success("Email 已複製！");
                          }}
                          className="text-accent hover:text-accent/80"
                        >
                          複製
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEmailLog(log.id, log.email)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-3 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenRecordsDialog(false);
                      setSelectedKeywordId(null);
                      setEmailLogs([]);
                    }}
                  >
                    關閉
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => navigate("/help")}
                variant="outline"
                className="w-full"
              >
                📖 使用說明
              </Button>
              <Button
                onClick={() => navigate("/privacy")}
                variant="outline"
                className="w-full"
              >
                🔒 隱私權政策
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              需要協助？查看使用說明或聯繫支援團隊
            </p>
          </div>
        </div>
      </div>

      {/* 側邊新增面板 */}
      <Sheet open={showAddSheet} onOpenChange={(open) => !open && cancelAdd()}>
        <SheetContent side="right" className="w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 overflow-hidden">
          <div className="flex h-full">
            {/* 左側：完整頁面預覽區 */}
            <div className="hidden md:block md:w-3/5 bg-muted/30 overflow-y-auto border-r">
              <SheetHeader className="p-6 pb-4 sticky top-0 bg-muted/30 backdrop-blur-sm z-10 border-b">
                <SheetTitle className="text-sm text-muted-foreground">即時預覽</SheetTitle>
              </SheetHeader>
              <div className="relative">
                {/* 半透明遮罩層 */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-background/5"></div>
                {/* 完整模板預覽 */}
                <div className="pointer-events-none select-none scale-90 origin-top">
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }>
                    {(() => {
                      // 準備模擬的 boxData
                      const previewBoxData = {
                        id: 'preview-id',
                        keyword: newKeyword || 'preview',
                        created_at: new Date().toISOString(),
                        quota: newQuota ? parseInt(newQuota) : null,
                        current_count: 0,
                        expires_at: enableExpiry && (newExpiryDays || newExpiryHours || newExpiryMinutes)
                          ? new Date(Date.now() + (parseInt(newExpiryDays || "0") * 24 * 60 + parseInt(newExpiryHours || "0") * 60 + parseInt(newExpiryMinutes || "0")) * 60 * 1000).toISOString()
                          : null,
                        creator_id: userId,
                        images: newImageUrls.filter(url => url.trim()) || null,
                        package_title: newPackageTitle || null,
                        package_description: newPackageDescription || null,
                        required_fields: newRequiredFields,
                        short_code: 'preview',
                        template_type: newTemplateType,
                        hide_author_info: newHideAuthor,
                        template_config: newTemplateConfig,
                      };

                      // 載入對應的模板元件
                      const TemplateComponent = getTemplateComponent(newTemplateType);

                      // 準備傳給模板的 props
                      const templateProps = {
                        boxData: previewBoxData,
                        keyword: '',
                        setKeyword: () => {},
                        email: '',
                        setEmail: () => {},
                        extraData: { nickname: '' },
                        setExtraData: () => {},
                        onUnlock: (e: React.FormEvent) => { e.preventDefault(); },
                        onReset: () => {},
                        loading: false,
                        result: null,
                        currentCount: 0,
                        waitlistCount: 0,
                        isLoggedIn: false,
                        isCreatorPreview: false,
                      };

                      return <TemplateComponent {...templateProps} />;
                    })()}
                  </Suspense>
                </div>
                {/* 提示文字 */}
                <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
                  <div className="inline-block bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg">
                    <p className="text-xs text-muted-foreground">
                      ℹ️ 即時預覽模式 - 修改右側表單即可看到效果
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：新增表單區 */}
            <div className="w-full md:w-2/5 overflow-y-auto">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle>新增關鍵字</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleAddKeyword} className="px-6 pb-6 space-y-1">
                {/* TODO: 這裡將插入所有新增表單欄位 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    📋 基本資訊
                  </div>
                  <div className="space-y-8">
                    {/* 關鍵字 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="new-keyword" className="text-[15px] font-medium text-gray-200">
                          關鍵字
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                          必填
                        </span>
                      </div>
                      <Input
                        id="new-keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        required
                        maxLength={50}
                        placeholder="例如：free2024"
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">簡短易記</span>
                        <span className={`text-xs font-medium ${
                          newKeyword.length === 0 ? 'text-gray-400' :
                          newKeyword.length >= 50 ? 'text-red-500' :
                          newKeyword.length >= 40 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {newKeyword.length} / 50
                        </span>
                      </div>
                    </div>

                    {/* 回覆內容 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="new-content" className="text-[15px] font-medium text-gray-200">
                          回覆內容
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                          必填
                        </span>
                      </div>
                      <Textarea
                        id="new-content"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        required
                        maxLength={2000}
                        placeholder="領取後顯示的內容"
                        className="min-h-[100px] bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 resize-y leading-relaxed transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">支援多行</span>
                        <span className={`text-xs font-medium ${
                          newContent.length === 0 ? 'text-gray-400' :
                          newContent.length >= 2000 ? 'text-red-500' :
                          newContent.length >= 1600 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {newContent.length} / 2000
                        </span>
                      </div>
                    </div>

                    {/* 限額數量 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="new-quota" className="text-[15px] font-medium text-gray-200">
                          限額數量
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Input
                        id="new-quota"
                        type="number"
                        value={newQuota}
                        onChange={(e) => setNewQuota(e.target.value)}
                        min="1"
                        placeholder="無限制"
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        留空為無限制
                      </p>
                    </div>
                  </div>
                </div>

                {/* ⏰ 時效設定 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    ⏰ 時效設定
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableExpiry}
                        onChange={(e) => setEnableExpiry(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-200">啟用限時領取</span>
                    </label>

                    {enableExpiry && (
                      <div className="ml-6 p-5 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={newExpiryDays}
                            onChange={(e) => setNewExpiryDays(e.target.value.replace(/\D/g, ''))}
                            placeholder="0"
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">天</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={newExpiryHours}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setNewExpiryHours(val ? val.padStart(2, '0') : '');
                            }}
                            placeholder="00"
                            maxLength={2}
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">小時</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={newExpiryMinutes}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const num = parseInt(val || '0');
                              if (num <= 59) {
                                setNewExpiryMinutes(val ? val.padStart(2, '0') : '');
                              }
                            }}
                            placeholder="00"
                            maxLength={2}
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">分鐘後失效</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          超過時間無法領取
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📦 資料包包裝 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    📦 資料包包裝
                  </div>

                  <div className="space-y-8">
                    {/* 資料包標題 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="new-package-title" className="text-[15px] font-medium text-gray-200">
                          資料包標題
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Input
                        id="new-package-title"
                        value={newPackageTitle}
                        onChange={(e) => setNewPackageTitle(e.target.value)}
                        placeholder="🎨 設計師資源包"
                        maxLength={50}
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">顯示在頁面頂部</span>
                        <span className={`text-xs font-medium ${
                          newPackageTitle.length === 0 ? 'text-gray-400' :
                          newPackageTitle.length >= 50 ? 'text-red-500' :
                          newPackageTitle.length >= 40 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {newPackageTitle.length} / 50
                        </span>
                      </div>
                    </div>

                    {/* 資料包介紹 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="new-package-description" className="text-[15px] font-medium text-gray-200">
                          資料包介紹
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Textarea
                        id="new-package-description"
                        value={newPackageDescription}
                        onChange={(e) => setNewPackageDescription(e.target.value)}
                        placeholder="簡短介紹這個資料包"
                        rows={3}
                        maxLength={300}
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 resize-y leading-relaxed transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">顯示在圖片上方</span>
                        <span className={`text-xs font-medium ${
                          newPackageDescription.length === 0 ? 'text-gray-400' :
                          newPackageDescription.length >= 300 ? 'text-red-500' :
                          newPackageDescription.length >= 240 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {newPackageDescription.length} / 300
                        </span>
                      </div>
                    </div>

                    {/* 必填欄位 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          要求領取者填寫
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRequiredFields.nickname}
                          onChange={(e) => setNewRequiredFields({ nickname: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">稱呼 / 暱稱</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        需額外填寫稱呼
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🎨 視覺設計 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    🎨 視覺設計
                  </div>

                  <div className="space-y-8">
                    {/* 頁面模板 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          頁面模板
                        </Label>
                      </div>
                      <TemplateSelector
                        currentTemplate={newTemplateType}
                        onSelect={setNewTemplateType}
                      />
                    </div>

                    {/* 圖片管理 - 簡化版 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-[15px] font-medium text-gray-200">
                            資料包圖片
                          </Label>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                            {newImageUrls.filter(url => url.trim()).length} / 5
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open('https://duk.tw/u', '_blank')}
                        >
                          上傳圖片
                        </Button>
                      </div>

                      {/* 圖片輸入欄位 */}
                      <div className="space-y-3">
                        {newImageUrls.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="url"
                              value={url}
                              onChange={(e) => {
                                const updated = [...newImageUrls];
                                updated[index] = e.target.value;
                                setNewImageUrls(updated);
                              }}
                              placeholder={`圖片 ${index + 1} URL`}
                              className="bg-gray-700 border-2 border-transparent focus:border-green-500 text-white placeholder:text-gray-500 rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setNewImageUrls(newImageUrls.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {newImageUrls.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewImageUrls([...newImageUrls, ''])}
                            className="gap-2 w-full"
                          >
                            <Plus className="w-4 h-4" />
                            新增圖片欄位
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 隱藏作者資訊 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          顯示設定
                        </Label>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newHideAuthor}
                          onChange={(e) => setNewHideAuthor(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">隱藏作者資訊</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        不顯示創作者頭像與社群連結
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🧩 進階規則 */}
                {userProfile?.membership_tier !== 'free' && (
                  <div className="pb-10 mb-10 border-b border-gray-800">
                    <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                      🧩 進階規則
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newUnlockEnabled}
                          onChange={(e) => setNewUnlockEnabled(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">啟用多關鍵字規則（OR 模式）</span>
                      </label>

                      {newUnlockEnabled && (
                        <div className="ml-6 p-5 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                          <div>
                            <Label className="text-sm text-gray-200 mb-2 block">關鍵字列表（逗號分隔）</Label>
                            <Textarea
                              value={newUnlockKeywords}
                              onChange={(e) => setNewUnlockKeywords(e.target.value)}
                              rows={3}
                              placeholder="alpha, beta, gamma"
                              className="bg-gray-700 border-2 border-transparent focus:border-green-500 text-white placeholder:text-gray-500 rounded-lg"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              輸入多個關鍵字，使用逗號分隔。任一符合即解鎖
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <SheetFooter className="flex flex-col sm:flex-row gap-2 pt-8 mt-8 border-t border-gray-800">
                  <Button type="submit" className="gradient-magic">
                    確認新增
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelAdd}
                  >
                    取消
                  </Button>
                </SheetFooter>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 側邊編輯面板 */}
      <Sheet open={!!editingKeywordId} onOpenChange={(open) => !open && cancelEdit()}>
        <SheetContent side="right" className="w-full sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] p-0 overflow-hidden">
          <div className="flex h-full">
            {/* 左側：完整頁面預覽區 */}
            <div className="hidden md:block md:w-3/5 bg-muted/30 overflow-y-auto border-r">
              <SheetHeader className="p-6 pb-4 sticky top-0 bg-muted/30 backdrop-blur-sm z-10 border-b">
                <SheetTitle className="text-sm text-muted-foreground">即時預覽</SheetTitle>
              </SheetHeader>
              <div className="relative">
                {/* 半透明遮罩層 */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-background/5"></div>
                {/* 完整模板預覽 */}
                <div className="pointer-events-none select-none scale-90 origin-top">
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }>
                    {(() => {
                      // 準備模擬的 boxData
                      const previewBoxData = {
                        id: 'preview-id',
                        keyword: editKeyword || 'preview',
                        created_at: new Date().toISOString(),
                        quota: editQuota ? parseInt(editQuota) : null,
                        current_count: 0,
                        expires_at: editEnableExpiry && (editExpiryDays || editExpiryHours || editExpiryMinutes)
                          ? new Date(Date.now() + (parseInt(editExpiryDays || "0") * 24 * 60 + parseInt(editExpiryHours || "0") * 60 + parseInt(editExpiryMinutes || "0")) * 60 * 1000).toISOString()
                          : null,
                        creator_id: userId,
                        images: editImageUrls.filter(url => url.trim()) || null,
                        package_title: editPackageTitle || null,
                        package_description: editPackageDescription || null,
                        required_fields: editRequiredFields,
                        short_code: 'preview',
                        template_type: editTemplateType,
                        hide_author_info: editHideAuthor,
                        template_config: editTemplateConfig,
                      };

                      // 載入對應的模板元件
                      const TemplateComponent = getTemplateComponent(editTemplateType);

                      // 準備傳給模板的 props
                      const templateProps = {
                        boxData: previewBoxData,
                        keyword: '',
                        setKeyword: () => {},
                        email: '',
                        setEmail: () => {},
                        extraData: { nickname: '' },
                        setExtraData: () => {},
                        onUnlock: (e: React.FormEvent) => { e.preventDefault(); },
                        onReset: () => {},
                        loading: false,
                        result: null,
                        currentCount: 0,
                        waitlistCount: 0,
                        isLoggedIn: false,
                        isCreatorPreview: false,
                      };

                      return <TemplateComponent {...templateProps} />;
                    })()}
                  </Suspense>
                </div>
                {/* 提示文字 */}
                <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
                  <div className="inline-block bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg">
                    <p className="text-xs text-muted-foreground">
                      ℹ️ 即時預覽模式 - 修改右側表單即可看到效果
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：編輯表單區 */}
            <div className="w-full md:w-2/5 overflow-y-auto">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle>編輯關鍵字</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleUpdateKeyword} className="px-6 pb-6 space-y-1">
                {/* 📋 基本資訊 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    📋 基本資訊
                  </div>

                  <div className="space-y-8">
                    {/* 關鍵字 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="edit-keyword" className="text-[15px] font-medium text-gray-200">
                          關鍵字
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                          必填
                        </span>
                      </div>
                      <Input
                        id="edit-keyword"
                        value={editKeyword}
                        onChange={(e) => setEditKeyword(e.target.value)}
                        required
                        maxLength={50}
                        placeholder="例如：free2024"
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">簡短易記</span>
                        <span className={`text-xs font-medium ${
                          editKeyword.length === 0 ? 'text-gray-400' :
                          editKeyword.length >= 50 ? 'text-red-500' :
                          editKeyword.length >= 40 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {editKeyword.length} / 50
                        </span>
                      </div>
                    </div>

                    {/* 回覆內容 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="edit-content" className="text-[15px] font-medium text-gray-200">
                          回覆內容
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 font-medium">
                          必填
                        </span>
                      </div>
                      <Textarea
                        id="edit-content"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        required
                        maxLength={2000}
                        placeholder="領取後顯示的內容"
                        className="min-h-[100px] bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 resize-y leading-relaxed transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">支援多行</span>
                        <span className={`text-xs font-medium ${
                          editContent.length === 0 ? 'text-gray-400' :
                          editContent.length >= 2000 ? 'text-red-500' :
                          editContent.length >= 1600 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {editContent.length} / 2000
                        </span>
                      </div>
                    </div>

                    {/* 限額數量 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="edit-quota" className="text-[15px] font-medium text-gray-200">
                          限額數量
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Input
                        id="edit-quota"
                        type="number"
                        value={editQuota}
                        onChange={(e) => setEditQuota(e.target.value)}
                        min="1"
                        placeholder="無限制"
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        留空為無限制
                      </p>
                    </div>
                  </div>
                </div>

                {/* ⏰ 時效設定 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    ⏰ 時效設定
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editEnableExpiry}
                        onChange={(e) => setEditEnableExpiry(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-200">啟用限時領取</span>
                    </label>

                    {editEnableExpiry && (
                      <div className="ml-6 p-5 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={editExpiryDays}
                            onChange={(e) => setEditExpiryDays(e.target.value.replace(/\D/g, ''))}
                            placeholder="0"
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">天</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={editExpiryHours}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEditExpiryHours(val ? val.padStart(2, '0') : '');
                            }}
                            placeholder="00"
                            maxLength={2}
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">小時</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={editExpiryMinutes}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              const num = parseInt(val || '0');
                              if (num <= 59) {
                                setEditExpiryMinutes(val ? val.padStart(2, '0') : '');
                              }
                            }}
                            placeholder="00"
                            maxLength={2}
                            className="w-16 h-10 bg-gray-700 text-white text-center"
                          />
                          <span className="text-sm text-gray-300">分鐘後失效</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          超過時間無法領取
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📦 資料包包裝 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    📦 資料包包裝
                  </div>

                  <div className="space-y-8">
                    {/* 資料包標題 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="edit-package-title" className="text-[15px] font-medium text-gray-200">
                          資料包標題
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Input
                        id="edit-package-title"
                        value={editPackageTitle}
                        onChange={(e) => setEditPackageTitle(e.target.value)}
                        placeholder="🎨 設計師資源包"
                        maxLength={50}
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-4 px-5 transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">顯示在頁面頂部</span>
                        <span className={`text-xs font-medium ${
                          editPackageTitle.length === 0 ? 'text-gray-400' :
                          editPackageTitle.length >= 50 ? 'text-red-500' :
                          editPackageTitle.length >= 40 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {editPackageTitle.length} / 50
                        </span>
                      </div>
                    </div>

                    {/* 資料包介紹 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label htmlFor="edit-package-description" className="text-[15px] font-medium text-gray-200">
                          資料包介紹
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <Textarea
                        id="edit-package-description"
                        value={editPackageDescription}
                        onChange={(e) => setEditPackageDescription(e.target.value)}
                        placeholder="簡短介紹這個資料包"
                        rows={3}
                        maxLength={300}
                        className="bg-gray-700 border-2 border-transparent focus:border-green-500 focus:bg-gray-600 text-white placeholder:text-gray-500 rounded-lg py-3.5 px-4 resize-y leading-relaxed transition-all duration-300"
                      />
                      <div className="flex justify-between items-center mt-3 pt-1">
                        <span className="text-xs text-gray-400">顯示在圖片上方</span>
                        <span className={`text-xs font-medium ${
                          editPackageDescription.length === 0 ? 'text-gray-400' :
                          editPackageDescription.length >= 300 ? 'text-red-500' :
                          editPackageDescription.length >= 240 ? 'text-amber-500' :
                          'text-green-500'
                        }`}>
                          {editPackageDescription.length} / 300
                        </span>
                      </div>
                    </div>

                    {/* 必填欄位 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          要求領取者填寫
                        </Label>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                          選填
                        </span>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editRequiredFields.nickname}
                          onChange={(e) => setEditRequiredFields({ nickname: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">稱呼 / 暱稱</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        需額外填寫稱呼
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🎨 視覺設計 */}
                <div className="pb-10 mb-10 border-b border-gray-800">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    🎨 視覺設計
                  </div>

                  <div className="space-y-8">
                    {/* 頁面模板 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          頁面模板
                        </Label>
                      </div>
                      <TemplateSelector
                        currentTemplate={editTemplateType}
                        onSelect={setEditTemplateType}
                      />
                    </div>

                    {/* 圖片管理 - 卡片式網格 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-[15px] font-medium text-gray-200">
                            資料包圖片
                          </Label>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-400 font-medium">
                            {editImageUrls.filter(url => url.trim()).length} / 5
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" variant="secondary" size="sm">
                                上傳圖片
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>是否前往圖鴨上傳？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  我們會在新分頁開啟 duk.tw。請完成上傳後，複製圖片連結並貼回「資料包圖片」欄位。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => window.open('https://duk.tw/u', '_blank')}>
                                  前往圖鴨
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Dialog open={showBatchImageDialog && isEditMode} onOpenChange={(open) => {
                            if (isEditMode) setShowBatchImageDialog(open);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsEditMode(true);
                                  setShowBatchImageDialog(true);
                                }}
                                className="gap-2"
                              >
                                📋 批量貼入
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>批量貼入圖片 URL</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Label htmlFor="batch-images-edit">每行一個 URL（最多 5 個）</Label>
                                <Textarea
                                  id="batch-images-edit"
                                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                                  value={batchImageInput}
                                  onChange={(e) => setBatchImageInput(e.target.value)}
                                  rows={8}
                                  className="font-mono text-sm"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setShowBatchImageDialog(false);
                                      setBatchImageInput('');
                                    }}
                                  >
                                    取消
                                  </Button>
                                  <Button onClick={handleBatchImagePaste}>
                                    確定匯入
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      {/* 圖片卡片網格 */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {editImageUrls.filter(url => url.trim()).map((url, index) => {
                          const actualIndex = editImageUrls.findIndex(u => u === url);
                          return (
                            <div key={actualIndex} className="relative group">
                              {/* 圖片預覽 */}
                              <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                                <img
                                  src={url}
                                  alt={`圖片 ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }}
                                />
                              </div>
                              {/* Hover 操作層 */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    const newUrl = prompt('編輯圖片 URL', url);
                                    if (newUrl !== null) {
                                      const updated = [...editImageUrls];
                                      updated[actualIndex] = newUrl;
                                      setEditImageUrls(updated);
                                    }
                                  }}
                                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setEditImageUrls(editImageUrls.filter((_, i) => i !== actualIndex))}
                                  className="bg-red-500/80 hover:bg-red-600 border-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              {/* 圖片編號 */}
                              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                #{index + 1}
                              </div>
                            </div>
                          );
                        })}

                        {/* 新增圖片按鈕 */}
                        {editImageUrls.length < 5 && (
                          <button
                            type="button"
                            onClick={() => setEditImageUrls([...editImageUrls, ''])}
                            className="aspect-video border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-gray-800/50 transition-all group"
                          >
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                            <span className="text-sm text-gray-400 group-hover:text-green-500 transition-colors">新增圖片</span>
                          </button>
                        )}
                      </div>

                      {/* 摺疊式 URL 編輯區 */}
                      <details className="mt-4">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                          📝 直接編輯 URL
                        </summary>
                        <div className="mt-3 space-y-2">
                          {editImageUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                type="url"
                                value={url}
                                onChange={(e) => {
                                  const updated = [...editImageUrls];
                                  updated[index] = e.target.value;
                                  setEditImageUrls(updated);
                                }}
                                placeholder={`圖片 ${index + 1} URL`}
                                className="h-9 text-sm bg-gray-700 border-gray-600"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditImageUrls(editImageUrls.filter((_, i) => i !== index))}
                                className="h-9 w-9"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* 隱藏作者資訊 */}
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Label className="text-[15px] font-medium text-gray-200">
                          顯示設定
                        </Label>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editHideAuthor}
                          onChange={(e) => setEditHideAuthor(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-200">隱藏作者資訊</span>
                      </label>
                      <p className="text-xs text-gray-400 mt-3 pt-1">
                        隱藏頭像與名稱
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🧩 進階規則 */}
                <div className="pb-10">
                  <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                    🧩 進階規則
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3.5">
                      <Label className="text-[15px] font-medium text-gray-200">
                        多關鍵字規則
                      </Label>
                      {userProfile?.membership_tier === 'free' && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 font-medium">
                          Premium
                        </span>
                      )}
                    </div>

                    {userProfile?.membership_tier === 'free' ? (
                      <div className="p-5 rounded-lg border-2 border-amber-500/30 bg-amber-900/10">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">⭐</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-400 mb-1">
                              Premium 專屬功能
                            </p>
                            <p className="text-xs text-gray-400 leading-relaxed mb-3">
                              升級至 Premium 即可使用多關鍵字規則，讓一個資料包支援多個解鎖關鍵字。
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => navigate('/checkout?tier=standard')}
                              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
                            >
                              立即升級
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editUnlockEnabled}
                            onChange={(e) => setEditUnlockEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-200">啟用多關鍵字規則</span>
                        </label>
                        {editUnlockEnabled && (
                          <div className="ml-6 p-5 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                            <div>
                              <Label className="text-sm text-gray-200">關鍵字列表（逗號分隔）</Label>
                              <Textarea
                                value={editUnlockKeywords}
                                onChange={(e) => setEditUnlockKeywords(e.target.value)}
                                rows={3}
                                placeholder="alpha, beta, gamma"
                                className="mt-2 bg-gray-700 border-gray-600 text-white"
                              />
                              <p className="text-xs text-gray-400 mt-2">
                                使用逗號分隔，任一符合即可解鎖
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ⚙️ 模板專屬設定（根據選擇的模板動態顯示） */}
                {(editTemplateType === 'layout5' ||
                  editTemplateType === 'layout6' ||
                  editTemplateType === 'layout7' ||
                  editTemplateType === 'layout8') && (
                  <div className="pb-10 mb-10 border-b border-gray-800">
                    <div className="text-sm font-semibold text-green-500 uppercase tracking-wider mb-6">
                      ⚙️ 模板專屬設定
                    </div>

                    <div className="space-y-1">
                      {/* Layout5: 特色卡片編輯器 */}
                      {editTemplateType === 'layout5' && (
                        <Layout5ConfigEditor
                          value={editTemplateConfig.layout5 || DEFAULT_LAYOUT5_CONFIG}
                          onChange={(config) => setEditTemplateConfig({ ...editTemplateConfig, layout5: config })}
                        />
                      )}

                      {/* Layout6: 數據展示編輯器 */}
                      {editTemplateType === 'layout6' && (
                        <Layout6ConfigEditor
                          value={editTemplateConfig.layout6 || DEFAULT_LAYOUT6_CONFIG}
                          onChange={(config) => setEditTemplateConfig({ ...editTemplateConfig, layout6: config })}
                        />
                      )}

                      {/* Layout7: 完整配置編輯器 */}
                      {editTemplateType === 'layout7' && (
                        <Layout7ConfigEditor
                          value={editTemplateConfig.layout7 || DEFAULT_LAYOUT7_CONFIG}
                          onChange={(config) => setEditTemplateConfig({ ...editTemplateConfig, layout7: config })}
                        />
                      )}

                      {/* Layout8: 學習要點編輯器 */}
                      {editTemplateType === 'layout8' && (
                        <Layout8ConfigEditor
                          value={editTemplateConfig.layout8 || DEFAULT_LAYOUT8_CONFIG}
                          onChange={(config) => setEditTemplateConfig({ ...editTemplateConfig, layout8: config })}
                        />
                      )}
                    </div>
                  </div>
                )}

            <SheetFooter className="flex flex-col sm:flex-row gap-2 pt-8 mt-8 border-t border-gray-800">
              <Button type="submit" className="gradient-magic">
                儲存變更
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
              >
                取消
              </Button>
            </SheetFooter>
          </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

export default Creator;
