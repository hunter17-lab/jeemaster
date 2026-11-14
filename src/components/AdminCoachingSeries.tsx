import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Series { id: string; name: string; description: string | null; logo_path: string | null; sort_order: number }
interface SeriesTest { id: string; series_id: string; name: string; url: string; sort_order: number }

const isUrl = (u: string) => { try { return ["http:", "https:"].includes(new URL(u).protocol); } catch { return false; } };
const input = "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm";

/** Admin manager for coaching test series and their embedded (iframe) tests. */
const AdminCoachingSeries = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [tests, setTests] = useState<SeriesTest[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [testForms, setTestForms] = useState<Record<string, { name: string; url: string }>>({});

  const load = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from("coaching_test_series").select("*").order("sort_order").order("created_at"),
      supabase.from("coaching_series_tests").select("*").order("sort_order").order("created_at"),
    ]);
    setSeries((s as Series[]) || []);
    setTests((t as SeriesTest[]) || []);
  };
  useEffect(() => { load(); }, []);

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) throw new Error("Logo must be an image");
    if (file.size > 3 * 1024 * 1024) throw new Error("Logo must be under 3 MB");
    const path = `logos/${crypto.randomUUID()}.${file.name.split(".").pop() || "png"}`;
    const { error } = await supabase.storage.from("coaching-media").upload(path, file, { contentType: file.type });
    if (error) throw error;
    return path;
  };

  const createSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name || name.length > 120) return toast.error("Enter a series name (max 120 characters)");
    setSaving(true);
    try {
      const logo_path = logo ? await uploadLogo(logo) : null;
      const { error } = await supabase.from("coaching_test_series").insert({
        name, description: form.description.trim() || null, logo_path, sort_order: series.length,
      });
      if (error) throw error;
      toast.success("Series created");
      setForm({ name: "", description: "" });
      setLogo(null);
      load();
    } catch (err: any) {
      toast.error(err.message || "Could not create series");
    } finally {
      setSaving(false);
    }
  };

  const changeLogo = async (s: Series, file: File) => {
    try {
      const path = await uploadLogo(file);
      const { error } = await supabase.from("coaching_test_series").update({ logo_path: path }).eq("id", s.id);
      if (error) throw error;
      toast.success("Logo updated");
      load();
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
  };

  const deleteSeries = async (s: Series) => {
    if (!confirm(`Delete "${s.name}" and all its tests?`)) return;
    const { error } = await supabase.from("coaching_test_series").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Series deleted");
    load();
  };

  const addTest = async (seriesId: string) => {
    const f = testForms[seriesId] || { name: "", url: "" };
    if (!f.name.trim()) return toast.error("Enter a test name");
    if (!isUrl(f.url.trim())) return toast.error("Enter a valid https:// iframe URL");
    const { error } = await supabase.from("coaching_series_tests").insert({
      series_id: seriesId, name: f.name.trim(), url: f.url.trim(),
      sort_order: tests.filter((t) => t.series_id === seriesId).length,
    });
    if (error) return toast.error(error.message);
    setTestForms({ ...testForms, [seriesId]: { name: "", url: "" } });
    toast.success("Test added");
    load();
  };

  const deleteTest = async (t: SeriesTest) => {
    if (!confirm(`Delete test "${t.name}"?`)) return;
    const { error } = await supabase.from("coaching_series_tests").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createSeries} className="glass-card p-5 space-y-3">
        <h2 className="font-display font-bold text-lg">Create Test Series</h2>
        <input className={input} placeholder="Series name (e.g. Allen Major Test Series)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <textarea className={input} rows={2} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Logo (optional): <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
        </label>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg gradient-primary text-primary-foreground font-semibold px-4 py-2 disabled:opacity-50">
          <Plus size={16} /> {saving ? "Saving…" : "Create Series"}
        </button>
      </form>

      {series.length === 0 && <p className="text-sm text-muted-foreground text-center">No series yet.</p>}

      {series.map((s) => {
        const list = tests.filter((t) => t.series_id === s.id);
        const f = testForms[s.id] || { name: "", url: "" };
        return (
          <div key={s.id} className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">{s.name}</h3>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                <p className="text-[11px] text-muted-foreground mt-1">{s.logo_path ? "Logo set" : "No logo"}</p>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 rounded-lg bg-secondary hover:bg-secondary/70" title="Change logo">
                  <Upload size={15} />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && changeLogo(s, e.target.files[0])} />
                </label>
                <button onClick={() => deleteSeries(s)} className="p-2 rounded-lg bg-destructive/15 text-destructive" title="Delete series"><Trash2 size={15} /></button>
              </div>
            </div>
            <ul className="space-y-1.5">
              {list.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <span className="min-w-0"><span className="font-semibold">{t.name}</span> <span className="text-xs text-muted-foreground break-all">{t.url}</span></span>
                  <button onClick={() => deleteTest(t)} className="text-destructive shrink-0"><Trash2 size={14} /></button>
                </li>
              ))}
              {list.length === 0 && <li className="text-xs text-muted-foreground">No tests yet.</li>}
            </ul>
            <div className="flex flex-col sm:flex-row gap-2">
              <input className={input} placeholder="Test name" value={f.name} onChange={(e) => setTestForms({ ...testForms, [s.id]: { ...f, name: e.target.value } })} />
              <input className={input} placeholder="Iframe URL https://…" value={f.url} onChange={(e) => setTestForms({ ...testForms, [s.id]: { ...f, url: e.target.value } })} />
              <button onClick={() => addTest(s.id)} className="shrink-0 inline-flex items-center gap-1 rounded-lg gradient-primary text-primary-foreground font-semibold px-4 py-2 text-sm"><Plus size={14} /> Add Test</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminCoachingSeries;
