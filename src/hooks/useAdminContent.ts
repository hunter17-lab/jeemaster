import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContentType = "notes" | "mindmaps" | "dpp" | "pyq" | "books" | "coaching";

export interface ContentItem {
  id: string;
  type: ContentType;
  subject: string;
  section: string | null;
  title: string;
  link: string;
  description: string | null;
  created_at: string;
  resource_type?: string | null;
}

export const useAdminContent = (type: ContentType, subject?: string) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let q = supabase.from("content_items").select("*").eq("type", type).order("created_at", { ascending: false });
    if (subject) q = q.eq("subject", subject);
    q.then(({ data }) => {
      if (active) {
        setItems((data as any) || []);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [type, subject]);

  return { items, loading };
};
