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

const Creator = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchKeywords();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchKeywords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("keywords")
      .select("*")
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
            <p className="text-muted-foreground mt-2">管理您的關鍵字與內容</p>
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
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">關鍵字</p>
                      <p className="font-medium text-accent">{item.keyword}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">回覆內容</p>
                      <p className="font-medium truncate">{item.content}</p>
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
