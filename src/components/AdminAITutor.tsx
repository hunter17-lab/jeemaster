import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_SETTINGS, type AiSettings } from "@/lib/aiTutor";

const MODELS = [
  { value: "google/gemini-3.7-flash", label: "Gemini 3.7 Flash (recommended)" },
  { value: "google/gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { value: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (cheapest)" },
  { value: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (strongest)" },
];

const FILE_TYPES = [
  { value: "image/png", label: "PNG images" },
  { value: "image/jpeg", label: "JPEG images" },
  { value: "image/webp", label: "WebP images" },
  { value: "image/gif", label: "GIF images" },
  { value: "application/pdf", label: "PDF documents" },
  { value: "audio/webm", label: "Audio (webm)" },
  { value: "audio/mpeg", label: "Audio (mp3)" },
  { value: "video/mp4", label: "Video (mp4)" },
];

const AdminAITutor = () => {
  const [s, setS] = useState<AiSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<{ today: number; users: number }>({ today: 0, users: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ai_settings").select("*").eq("id", 1).maybeSingle();
      if (data) setS({ ...DEFAULT_SETTINGS, ...(data as any) });
      const day = new Date().toISOString().slice(0, 10);
      const { data: u } = await supabase.from("ai_usage").select("count").eq("day", day);
      const rows = (u as any[]) || [];
      setUsage({ today: rows.reduce((n, r) => n + (r.count || 0), 0), users: rows.length });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("ai_settings")
      .update({
        enabled: s.enabled,
        maintenance: s.maintenance,
        model: s.model,
        max_file_mb: s.max_file_mb,
        allowed_types: s.allowed_types,
        daily_limit: s.daily_limit,
        system_instructions: s.system_instructions,
      } as any)
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error("Couldn't save settings");
    else toast.success("AI Tutor settings saved");
  };

  const toggleType = (t: string) =>
    setS((p) => ({
      ...p,
      allowed_types: p.allowed_types.includes(t) ? p.allowed_types.filter((x) => x !== t) : [...p.allowed_types, t],
    }));

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin" /> Loading…</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="glass-card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold">AI Tutor Controls</h2>

        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Tutor switched on</span>
          <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} className="h-4 w-8 accent-primary" />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>Maintenance message</span>
          <input type="checkbox" checked={s.maintenance} onChange={(e) => setS({ ...s, maintenance: e.target.checked })} className="h-4 w-8 accent-primary" />
        </label>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">AI model</span>
          <select value={s.model} onChange={(e) => setS({ ...s, model: e.target.value })} className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none">
            {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Max file size (MB)</span>
            <input
              type="number" min={1} max={50} value={s.max_file_mb}
              onChange={(e) => setS({ ...s, max_file_mb: Number(e.target.value) })}
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Questions per student / day</span>
            <input
              type="number" min={1} max={1000} value={s.daily_limit}
              onChange={(e) => setS({ ...s, daily_limit: Number(e.target.value) })}
              className="w-full rounded-lg bg-secondary px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Allowed uploads</span>
          <div className="flex flex-wrap gap-2">
            {FILE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => toggleType(t.value)}
                className={`rounded-lg px-2.5 py-1 text-xs transition ${s.allowed_types.includes(t.value) ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save settings
        </button>
      </div>

      <div className="space-y-6">
        <div className="glass-card space-y-3 p-6">
          <h2 className="font-display text-lg font-bold">Extra tutor instructions</h2>
          <p className="text-xs text-muted-foreground">Added on top of the built-in JEE tutor behaviour.</p>
          <textarea
            value={s.system_instructions}
            onChange={(e) => setS({ ...s, system_instructions: e.target.value })}
            rows={8}
            placeholder="e.g. Always mention which JEE chapter the question belongs to."
            className="w-full resize-y rounded-lg bg-secondary px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="glass-card grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-2xl font-bold text-primary">{usage.today}</p>
            <p className="text-xs text-muted-foreground">Questions asked today</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{usage.users}</p>
            <p className="text-xs text-muted-foreground">Students using the tutor today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAITutor;
