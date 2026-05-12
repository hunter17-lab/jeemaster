// Dynamic sitemap.xml generator — includes static routes + admin-uploaded books
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE = "https://jeemaster.lovable.app";

const STATIC_ROUTES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/",          priority: "1.0", changefreq: "weekly" },
  { path: "/notes",     priority: "0.9", changefreq: "weekly" },
  { path: "/mindmaps",  priority: "0.8", changefreq: "weekly" },
  { path: "/dpp",       priority: "0.8", changefreq: "weekly" },
  { path: "/pyq",       priority: "0.9", changefreq: "weekly" },
  { path: "/books",     priority: "0.7", changefreq: "weekly" },
  { path: "/books/physics",     priority: "0.7", changefreq: "weekly" },
  { path: "/books/chemistry",   priority: "0.7", changefreq: "weekly" },
  { path: "/books/mathematics", priority: "0.7", changefreq: "weekly" },
  { path: "/books/pcm",         priority: "0.7", changefreq: "weekly" },
  { path: "/coaching",  priority: "0.7", changefreq: "monthly" },
  { path: "/about",     priority: "0.5", changefreq: "yearly" },
  { path: "/install",   priority: "0.5", changefreq: "yearly" },
];

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data } = await supabase
    .from("content_items")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1);
  const lastmod = (data?.[0]?.updated_at ?? new Date().toISOString()).slice(0, 10);

  const urls = STATIC_ROUTES.map(
    (r) =>
      `  <url><loc>${escape(SITE + r.path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    },
  });
});
