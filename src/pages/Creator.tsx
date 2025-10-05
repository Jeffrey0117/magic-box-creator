import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, LogOut, Download, Edit, ClipboardList, User } from "lucide-react";
import { generateUniqueShortCode } from "@/lib/shortcode";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { Tables } from "@/integrations/supabase/types";

interface Keyword {
  id: string;
  keyword: string;
  content: string;
  created_at: string;
  short_code?: string;
  quota?: number | null;
  email_count?: number;
  today_count?: number;
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

const Creator = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
  const [editExpiryDays, setEditExpiryDays] = useState("");
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [editEnableExpiry, setEditEnableExpiry] = useState(false);
  const [userId, setUserId] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<Tables<'user_profiles'> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchKeywords();
    fetchMyRecords();
    fetchUserProfile();
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
      .single();

    if (!error && data) {
      setUserProfile(data);
    }
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

    const expiresAt = enableExpiry && newExpiryDays
      ? new Date(Date.now() + parseInt(newExpiryDays) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase.from("keywords").insert({
      keyword: newKeyword.toLowerCase().trim(),
      content: newContent,
      creator_id: session.user.id,
      short_code: shortCode,
      quota: newQuota ? parseInt(newQuota) : null,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("新增關鍵字失敗:", error);
      toast.error("新增失敗，請確認關鍵字是否重複");
    } else {
      toast.success("關鍵字已新增！");
      setNewKeyword("");
      setNewContent("");
      setNewQuota("");
      setNewExpiryDays("");
      setEnableExpiry(false);
      setShowAddForm(false);
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("keywords").delete().eq("id", id);

    if (error) {
      console.error("刪除關鍵字失敗:", error);
      toast.error("刪除失敗，請稍後再試");
    } else {
      toast.success("已刪除");
      fetchKeywords();
    }
  };

  const handleEdit = (item: any) => {
    setEditingKeywordId(item.id);
    setEditKeyword(item.keyword);
    setEditContent(item.content);
    setEditQuota(item.quota?.toString() || "");
    
    if (item.expires_at) {
      setEditEnableExpiry(true);
      const now = new Date().getTime();
      const expiry = new Date(item.expires_at).getTime();
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      setEditExpiryDays(daysLeft.toString());
    } else {
      setEditEnableExpiry(false);
      setEditExpiryDays("");
    }
  };

  const handleUpdateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKeywordId) return;

    const expiresAt = editEnableExpiry && editExpiryDays
      ? new Date(Date.now() + parseInt(editExpiryDays) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from("keywords")
      .update({
        keyword: editKeyword.toLowerCase().trim(),
        content: editContent,
        quota: editQuota ? parseInt(editQuota) : null,
        expires_at: expiresAt,
      })
      .eq("id", editingKeywordId);

    if (error) {
      console.error("更新關鍵字失敗:", error);
      toast.error("更新失敗，請稍後再試");
    } else {
      toast.success("更新成功！");
      setEditingKeywordId(null);
      setEditKeyword("");
      setEditContent("");
      setEditQuota("");
      setEditExpiryDays("");
      setEditEnableExpiry(false);
      fetchKeywords();
    }
  };

  const cancelEdit = () => {
    setEditingKeywordId(null);
    setEditKeyword("");
    setEditContent("");
    setEditQuota("");
    setEditExpiryDays("");
    setEditEnableExpiry(false);
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

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg md:text-xl font-semibold">關鍵字列表</h2>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gradient-magic gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              新增關鍵字
            </Button>
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

          {showAddForm && (
            <form onSubmit={handleAddKeyword} className="mb-6 p-4 md:p-6 rounded-lg bg-muted/50 space-y-3 md:space-y-4">
              <Input
                placeholder="關鍵字（例如：hello）"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                required
                className="h-12 md:h-10"
              />
              <Textarea
                placeholder="回覆內容（支援多行）&#10;例如：&#10;🎉 恭喜領取！&#10;&#10;📋 Notion 連結：https://notion.so/xxx&#10;🎨 素材包：https://drive.google.com/xxx"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                className="min-h-[120px] resize-y"
              />
              <Input
                type="number"
                placeholder="限額數量（留空=無限制）"
                value={newQuota}
                onChange={(e) => setNewQuota(e.target.value)}
                min="1"
                className="h-12 md:h-10"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">⏰ 限時設定</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableExpiry}
                    onChange={(e) => setEnableExpiry(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">啟用限時領取</span>
                </div>
                {enableExpiry && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={newExpiryDays}
                      onChange={(e) => setNewExpiryDays(e.target.value)}
                      placeholder="7"
                      className="w-20 h-10"
                    />
                    <span className="text-sm">天後失效</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="gradient-magic">
                  確認新增
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewKeyword("");
                    setNewContent("");
                    setNewQuota("");
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
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
          ) : (
            <div className="space-y-2">
              {keywords.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {editingKeywordId === item.id ? (
                    <form onSubmit={handleUpdateKeyword} className="flex-1 space-y-3">
                      <Input
                        placeholder="關鍵字"
                        value={editKeyword}
                        onChange={(e) => setEditKeyword(e.target.value)}
                        required
                        className="h-10"
                      />
                      <Textarea
                        placeholder="回覆內容"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        required
                        className="min-h-[100px]"
                      />
                      <Input
                        type="number"
                        placeholder="限額數量（留空=無限制）"
                        value={editQuota}
                        onChange={(e) => setEditQuota(e.target.value)}
                        min="1"
                        className="h-10"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">⏰ 限時設定</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editEnableExpiry}
                            onChange={(e) => setEditEnableExpiry(e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">啟用限時領取</span>
                        </div>
                        {editEnableExpiry && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={editExpiryDays}
                              onChange={(e) => setEditExpiryDays(e.target.value)}
                              placeholder="7"
                              className="w-20 h-10"
                            />
                            <span className="text-sm">天後失效</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="gradient-magic">
                          儲存
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                          取消
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground mb-1">關鍵字</p>
                            <p className="font-medium text-accent text-sm md:text-base">{item.keyword}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm text-muted-foreground mb-1">回覆內容</p>
                            <p className="font-medium text-sm md:text-base whitespace-pre-line line-clamp-2">{item.content}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>📊 總領取：{item.email_count || 0} 人</span>
                          <span>📈 今日：+{item.today_count || 0}</span>
                          {item.quota && (
                            <span className="text-accent font-medium">
                              🔥 剩餘：{Math.max(0, item.quota - (item.email_count || 0))} 份
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-1">專屬連結</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-full sm:flex-1 break-all">
                            {item.short_code
                              ? `${window.location.origin}/${item.short_code}`
                              : `${window.location.origin}/box/${item.id}`
                            }
                          </code>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const url = item.short_code
                                  ? `${window.location.origin}/${item.short_code}`
                                  : `${window.location.origin}/box/${item.id}`;
                                navigator.clipboard.writeText(url);
                                toast.success("連結已複製！");
                              }}
                              className="flex-1 sm:flex-none"
                            >
                              複製連結
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const url = item.short_code
                                  ? `${window.location.origin}/${item.short_code}`
                                  : `${window.location.origin}/box/${item.id}`;
                                const shareText = `🎁 我為你準備了一份專屬資料包！\n\n輸入關鍵字「${item.keyword}」即可免費領取：\n${url}\n\n👉 立即解鎖專屬內容！`;
                                navigator.clipboard.writeText(shareText);
                                toast.success("分享文案已複製！");
                              }}
                              className="flex-1 sm:flex-none"
                            >
                              複製文案
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchEmailLogs(item.id)}
                              className="flex-1 sm:flex-none border-accent text-accent hover:bg-accent/10 gap-2"
                            >
                              <ClipboardList className="w-4 h-4" />
                              查看領取記錄
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                )}
                {editingKeywordId !== item.id && (
                    <div className="flex md:flex-col gap-2 self-start md:self-center shrink-0">
                      <Button
                        onClick={() => handleEdit(item)}
                        variant="ghost"
                        size="icon"
                        className="text-accent hover:text-accent/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedKeywordId && emailLogs.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">領取記錄 ({emailLogs.length})</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedKeywordId(null);
                      setEmailLogs([]);
                    }}
                    className="shrink-0"
                  >
                    關閉
                  </Button>
                </div>
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
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {emailLogs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs md:text-sm p-2 bg-background rounded">
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
            </div>
          )}

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
    </div>
  );
};

export default Creator;
