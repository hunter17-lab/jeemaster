import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const bucket = "giveaway-media";
const pathPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/(prizes|proofs)\/[A-Za-z0-9._-]{1,180}$/i;

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const path = typeof body?.path === "string" ? body.path : "";
    if (path.length > 256 || !pathPattern.test(path)) return respond({ error: "Invalid media path" }, 400);

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return respond({ error: "Media service unavailable" }, 503);

    const admin = createClient(url, key, { auth: { persistSession: false } });
    const now = new Date().toISOString();
    const isPublicProof = path.split("/")[1] === "proofs";

    let isPublic = false;
    if (isPublicProof) {
      const { data } = await admin
        .from("giveaway_proofs")
        .select("id")
        .eq("image_url", path)
        .eq("status", "approved")
        .or(`visible_until.is.null,visible_until.gt.${now}`)
        .limit(1);
      isPublic = Boolean(data?.length);
    } else {
      const { data } = await admin
        .from("giveaways")
        .select("id")
        .eq("image_url", path)
        .in("status", ["active", "ended"])
        .limit(1);
      isPublic = Boolean(data?.length);
    }

    if (!isPublic) return respond({ error: "Media not found" }, 404);
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 600);
    if (error || !data?.signedUrl) return respond({ error: "Media unavailable" }, 404);
    return respond({ signedUrl: data.signedUrl });
  } catch {
    return respond({ error: "Invalid request" }, 400);
  }
});