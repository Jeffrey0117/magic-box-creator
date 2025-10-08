import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreatorCardProps {
  creatorId: string;
}

export function CreatorCard({ creatorId }: CreatorCardProps) {
  const [creator, setCreator] = useState<{
    avatar_url: string | null;
    display_name: string | null;
    email: string | null;
    bio: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreator = async () => {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("avatar_url, display_name, bio")
        .eq("id", creatorId)
        .single();

      const { data: user } = await supabase.auth.admin.getUserById(creatorId);

      setCreator({
        avatar_url: profile?.avatar_url || null,
        display_name: profile?.display_name || null,
        email: user?.user?.email || null,
        bio: profile?.bio || null,
      });
      setLoading(false);
    };

    fetchCreator();
  }, [creatorId]);

  if (loading) {
    return (
      <div className="bg-white border border-[#dbdbdb] rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div className="bg-white border border-[#dbdbdb] rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <img
          src={creator.avatar_url || "/avantar.png"}
          alt="Creator Avatar"
          className="w-16 h-16 rounded-full border-2 border-[#dbdbdb] object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-[#262626] text-base">
            {creator.display_name || "創作者"}
          </h3>
          {creator.email && (
            <p className="text-xs text-[#8e8e8e] mt-0.5">{creator.email}</p>
          )}
          {creator.bio && (
            <p className="text-sm text-[#8e8e8e] mt-1 line-clamp-2">{creator.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}