import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, LogOut } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  content: string;
  created_at: string;
}

interface EmailLog {
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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchKeywords();
    fetchMyRecords();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      setUserEmail(session.user.email || "");
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
    } else {
      setKeywords(data || []);
    }
    setLoading(false);
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("keywords").insert({
      keyword: newKeyword.toLowerCase().trim(),
      content: newContent,
      creator_id: session.user.id,
    });

    if (error) {
      toast.error(error.message || "新增失敗");
    } else {
      toast.success("關鍵字已新增！");
      setNewKeyword("");
      setNewContent("");
      setShowAddForm(false);
      fetchKeywords();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("keywords").delete().eq("id", id);

    if (error) {
      toast.error("刪除失敗");
    } else {
      toast.success("已刪除");
      fetchKeywords();
    }
  };

  const fetchEmailLogs = async (keywordId: string) => {
    const { data, error } = await supabase
      .from("email_logs")
      .select("email, unlocked_at")
      .eq("keyword_id", keywordId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      toast.error("無法載入領取記錄");
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
      toast.error("無法載入領取記錄");
    } else {
      setMyRecords(data || []);
    }
    setLoadingRecords(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Keyword Box 管理面板</h1>
            <p className="text-muted-foreground mt-2">
              {userEmail && <span className="font-medium text-accent">{userEmail}</span>}
              {userEmail && " - "}
              管理您的關鍵字與內容
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            登出
          </Button>
        </div>

        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">關鍵字列表</h2>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="gradient-magic gap-2"
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
                      className="flex justify-between items-center p-3 bg-background rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          關鍵字：{record.keywords?.keyword}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {record.keywords?.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(record.unlocked_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/box/${record.keyword_id}`)}
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
            <form onSubmit={handleAddKeyword} className="mb-6 p-4 rounded-lg bg-muted/50 space-y-3">
              <Input
                placeholder="關鍵字（例如：hello）"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                required
              />
              <Input
                placeholder="回覆內容（例如：https://example.com/ebook）"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              />
              <div className="flex gap-2">
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
                  }}
                >
                  取消
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">載入中...</div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              還沒有任何關鍵字，點擊上方按鈕新增第一個！
            </div>
          ) : (
            <div className="space-y-2">
              {keywords.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">關鍵字</p>
                        <p className="font-medium text-accent">{item.keyword}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">回覆內容</p>
                        <p className="font-medium truncate">{item.content}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">專屬連結</p>
                      <div className="flex gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {window.location.origin}/box/{item.id}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/box/${item.id}`);
                            toast.success("連結已複製！");
                          }}
                        >
                          複製
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchEmailLogs(item.id)}
                        >
                          查看記錄
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="ghost"
                    size="icon"
                    className="ml-4 text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {selectedKeywordId && emailLogs.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">領取記錄</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedKeywordId(null);
                    setEmailLogs([]);
                  }}
                >
                  關閉
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {emailLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-background rounded">
                    <span className="font-medium">{log.email}</span>
                    <span className="text-muted-foreground">
                      {new Date(log.unlocked_at).toLocaleString('zh-TW')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full md:w-auto"
            >
              查看 Box 頁面
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creator;
