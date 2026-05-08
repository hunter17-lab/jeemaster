import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { action, target_user_id, target_email, reason } = await req.json();

    if (action === "delete_user") {
      if (!target_user_id) return json({ error: "missing target_user_id" }, 400);
      const { error } = await admin.auth.admin.deleteUser(target_user_id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "ban_user") {
      if (!target_user_id || !target_email) return json({ error: "missing fields" }, 400);
      await admin.from("banned_emails").upsert({ email: target_email.toLowerCase(), reason: reason ?? null });
      const { error } = await admin.auth.admin.deleteUser(target_user_id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "unban_email") {
      if (!target_email) return json({ error: "missing target_email" }, 400);
      await admin.from("banned_emails").delete().eq("email", target_email.toLowerCase());
      return json({ ok: true });
    }

    if (action === "list_users") {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) throw error;
      return json({ users: data.users });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? "error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
