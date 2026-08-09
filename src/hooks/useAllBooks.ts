import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SearchableBook } from "@/lib/bookSearch";

export interface BookRecord extends SearchableBook {
  subjectKey: string;
}

/** Fetches the full books dataset once, for client-side searching. */
export const useAllBooks = () => {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("content_items")
      .select("id,title,section,description,subject,link")
      .eq("type", "books")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setBooks(
          ((data as any[]) || []).map((d) => ({
            id: d.id,
            title: d.title,
            author: d.section,
            edition: d.description,
            subject: d.subject,
            subjectKey: d.subject,
            link: d.link,
          })),
        );
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { books, loading };
};
