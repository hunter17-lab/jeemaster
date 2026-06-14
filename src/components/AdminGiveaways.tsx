import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Trophy, Mail, Users, RefreshCw, Dice5 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminGiveaways = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [entries, setEntries] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", prize: "", image_url: "",
    result_at: "", auto_pick: true,
  });

  const load = async () => {
    const { data } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const loadEntries = async (gid: string) => {
    const { data } = await supabase.from("giveaway_entries").select("*").eq("giveaway_id", gid).order("created_at");
    setEntries((e) => ({ ...e, [gid]: data || [] }));
  };

  const toggle = (gid: string) => {
    if (expanded === gid) setExpanded(null);
    else { setExpanded(gid); if (!entries[gid]) loadEntries(gid); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.result_at) return toast.error("Pick a result date/time");
    setBusy(true);
    const { error } = await supabase.from("giveaways").insert({
      title: form.title, description: form.description || null, prize: form.prize,
      image_url: form.image_url || null, result_at: new Date(form.result_at).toISOString(),
      auto_pick: form.auto_pick, created_by: user!.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Giveaway created ✨");
    setForm({ title: "", description: "", prize: "", image_url: "", result_at: "", auto_pick: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this giveaway and all entries?")) return;
    await supabase.from("giveaways").delete().eq("id", id);
    load();
  };

  const pickWinner = async (id: string) => {
    if (!confirm("Randomly pick a winner now?")) return;
    const { data, error } = await supabase.rpc("pick_giveaway_winner", { _giveaway_id: id });
    if (error) return toast.error(error.message);
    toast.success("Winner picked! 🏆");
    load();
    loadEntries(id);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="glass-card p-6 space-y-3">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-2"><Plus size={18}/> Create Giveaway</h3>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <input required value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} placeholder="Prize (e.g. Free HC Verma book)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description / rules" rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Cover image URL (optional)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <label className="block">
          <span className="text-xs text-muted-foreground">Result date & time</span>
          <input required type="datetime-local" value={form.result_at} onChange={(e) => setForm({ ...form, result_at: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.auto_pick} onChange={(e) => setForm({ ...form, auto_pick: e.target.checked })} />
          Auto-pick winner at result time (otherwise pick manually)
        </label>
        <button disabled={busy} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold disabled:opacity-50">
          {busy ? "Creating…" : "Create giveaway"}
        </button>
      </form>

      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          All Giveaways ({items.length})
          <button onClick={load} className="ml-auto p-1.5 rounded hover:bg-secondary"><RefreshCw size={14}/></button>
        </h3>
        <div className="space-y-3 max-h-[700px] overflow-auto">
          {items.map((g) => {
            const ended = new Date(g.result_at) <= new Date();
            const winner = entries[g.id]?.find((e) => e.id === g.winner_entry_id);
            return (
              <div key={g.id} className="bg-secondary/40 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{g.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      🎁 {g.prize} · {ended ? "Ended" : "Live"} · {new Date(g.result_at).toLocaleString()} · {g.auto_pick ? "Auto" : "Manual"}
                    </div>
                  </div>
                  <button onClick={() => toggle(g.id)} className="p-1.5 rounded text-muted-foreground hover:bg-secondary" title="View entries"><Users size={14}/></button>
                  {!g.winner_entry_id && (entries[g.id]?.length ?? 0) >= 0 && (
                    <button onClick={() => pickWinner(g.id)} className="p-1.5 rounded text-primary hover:bg-primary/10" title="Pick winner"><Dice5 size={14}/></button>
                  )}
                  <button onClick={() => remove(g.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 size={14}/></button>
                </div>

                {g.winner_entry_id && winner && (
                  <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/30 text-xs">
                    <div className="flex items-center gap-1 font-semibold text-primary"><Trophy size={12}/> Winner: {winner.name}</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Mail size={10}/> {winner.email}</div>
                  </div>
                )}

                {expanded === g.id && (
                  <div className="mt-3 space-y-1 max-h-60 overflow-auto">
                    {(entries[g.id] || []).map((en) => (
                      <div key={en.id} className={`text-xs p-2 rounded ${en.id === g.winner_entry_id ? "bg-primary/10" : "bg-background/50"}`}>
                        <div className="font-medium">{en.name} {en.id === g.winner_entry_id && "🏆"}</div>
                        <div className="text-muted-foreground">{en.email}</div>
                        <div className="text-muted-foreground italic mt-1">"{en.reason}"</div>
                      </div>
                    ))}
                    {(entries[g.id] || []).length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}
                  </div>
                )}
              </div>
            );
          })}
          {items.length === 0 && <p className="text-sm text-muted-foreground">No giveaways yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminGiveaways;
