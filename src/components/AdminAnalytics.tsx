import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Globe, CalendarDays, Radio, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  registered: number | null;
  visitors: number | null;
  today: number | null;
  online: number | null;
}

const AdminAnalytics = () => {
  const [stats, setStats] = useState<Stats>({ registered: null, visitors: null, today: null, online: null });
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const [total, today, online, usersRes] = await Promise.all([
      supabase.from("site_visitors").select("*", { count: "exact", head: true }),
      supabase.from("site_visitors").select("*", { count: "exact", head: true }).gte("first_seen_at", startOfDay.toISOString()),
      supabase.from("site_visitors").select("*", { count: "exact", head: true }).gte("last_seen_at", fiveMinAgo),
      supabase.functions.invoke("admin-actions", { body: { action: "list_users" } }),
    ]);

    setStats({
      registered: usersRes.error ? null : (usersRes.data?.users?.length ?? 0),
      visitors: total.count ?? null,
      today: today.count ?? null,
      online: online.count ?? null,
    });
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 30000);
    return () => window.clearInterval(t);
  }, [load]);

  const cards = [
    { key: "registered", label: "Total Registered Users", value: stats.registered, icon: Users, hint: "Accounts created" },
    { key: "visitors", label: "Total Visitors", value: stats.visitors, icon: Globe, hint: "Unique browsers ever" },
    { key: "today", label: "Visitors Today", value: stats.today, icon: CalendarDays, hint: "First visit today" },
    { key: "online", label: "Online Users", value: stats.online, icon: Radio, hint: "Active in last 5 min" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs text-muted-foreground">
          {updatedAt ? `Live · updated ${updatedAt.toLocaleTimeString()}` : "Loading live data…"}
        </p>
        <button
          onClick={() => load()}
          className="ml-auto px-3 py-1.5 rounded-lg bg-secondary text-xs flex items-center gap-1"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh now
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, value, icon: Icon, hint }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="glass-card p-5 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground mb-3">
                {key === "online" ? (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="flex"
                  >
                    <Icon size={18} />
                  </motion.span>
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <div className="text-3xl font-display font-bold tabular-nums">
                {value === null ? "—" : value.toLocaleString()}
              </div>
              <div className="text-sm font-medium mt-1">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Visitor stats count unique browsers; repeat visits within 24 hours are not counted again. Auto-refreshes every 30 seconds.
      </p>
    </div>
  );
};

export default AdminAnalytics;
