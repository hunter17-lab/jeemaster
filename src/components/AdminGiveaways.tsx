import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Trophy, Mail, Users, RefreshCw, Dice5, Upload, FileSpreadsheet, FileText, ImageIcon, Check, X, Crop as CropIcon } from "lucide-react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadGiveawayMedia, deleteGiveawayMedia, resolveMediaUrl } from "@/lib/giveawayMedia";
import { exportGiveawayPdf, exportGiveawayCsv } from "@/lib/giveawayPdf";
import MediaImage from "@/components/MediaImage";

const AdminGiveaways = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [entries, setEntries] = useState<Record<string, any[]>>({});
  const [proofs, setProofs] = useState<Record<string, any[]>>({});
  const [winners, setWinners] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", prize: "", image_url: "", image_path: "",
    result_at: "", auto_pick: true, winner_count: 1,
  });
  const [uploading, setUploading] = useState(false);
  const [imgMode, setImgMode] = useState<"upload" | "url">("upload");

  const load = async () => {
    const { data } = await supabase.from("giveaways").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const loadDetails = async (gid: string) => {
    const [{ data: e }, { data: p }, { data: w }] = await Promise.all([
      supabase.from("giveaway_entries").select("*").eq("giveaway_id", gid).order("created_at"),
      supabase.from("giveaway_proofs").select("*").eq("giveaway_id", gid).order("created_at", { ascending: false }),
      supabase.from("giveaway_winners").select("*, giveaway_entries(name,email)").eq("giveaway_id", gid).order("win_position"),
    ]);
    setEntries((x) => ({ ...x, [gid]: e || [] }));
    setProofs((x) => ({ ...x, [gid]: p || [] }));
    setWinners((x) => ({ ...x, [gid]: w || [] }));
  };

  const toggle = (gid: string) => {
    if (expanded === gid) setExpanded(null);
    else { setExpanded(gid); loadDetails(gid); }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = await uploadGiveawayMedia(file, user.id, "prizes");
      setForm((f) => ({ ...f, image_path: path, image_url: "" }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    }
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.result_at) return toast.error("Pick a result date/time");
    setBusy(true);
    const image_url = imgMode === "url" ? form.image_url || null : form.image_path || null;
    const { error } = await supabase.from("giveaways").insert({
      title: form.title, description: form.description || null, prize: form.prize,
      image_url, result_at: new Date(form.result_at).toISOString(),
      auto_pick: form.auto_pick, winner_count: form.winner_count, created_by: user!.id,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Giveaway created ✨");
    setForm({ title: "", description: "", prize: "", image_url: "", image_path: "", result_at: "", auto_pick: true, winner_count: 1 });
    load();
  };

  const remove = async (id: string, image: string | null) => {
    if (!confirm("Delete this giveaway and all entries?")) return;
    if (image) await deleteGiveawayMedia(image);
    await supabase.from("giveaways").delete().eq("id", id);
    load();
  };

  const pickWinners = async (id: string) => {
    if (!confirm("Randomly pick winner(s) now?")) return;
    const { error } = await supabase.rpc("pick_giveaway_winners", { _giveaway_id: id });
    if (error) return toast.error(error.message);
    toast.success("Winners picked! 🏆");
    load();
    loadDetails(id);
  };

  const moderateProof = async (proofId: string, status: "approved" | "rejected", hours: number, croppedPath?: string) => {
    const update: any = { status, approved_at: status === "approved" ? new Date().toISOString() : null };
    if (status === "approved") update.visible_until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    if (croppedPath) update.image_url = croppedPath;
    const { error } = await supabase.from("giveaway_proofs").update(update).eq("id", proofId);
    if (error) return toast.error(error.message);
    toast.success(`Proof ${status}`);
    const gid = Object.keys(proofs).find((k) => proofs[k].some((p) => p.id === proofId));
    if (gid) loadDetails(gid);
  };

  const exportPdf = async (g: any) => {
    if (!entries[g.id]) await loadDetails(g.id);
    exportGiveawayPdf(g, entries[g.id] || [], winners[g.id]?.map((w: any) => ({ winner_name: w.giveaway_entries.name, win_position: w.win_position })) || []);
  };
  const exportCsv = async (g: any) => {
    if (!entries[g.id]) await loadDetails(g.id);
    exportGiveawayCsv(g, entries[g.id] || []);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="glass-card p-6 space-y-3">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-2"><Plus size={18}/> Create Giveaway</h3>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <input required value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} placeholder="Prize (e.g. Free HC Verma book)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description / rules" rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />

        <div className="space-y-2">
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={() => setImgMode("upload")} className={`px-2 py-1 rounded ${imgMode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Upload</button>
            <button type="button" onClick={() => setImgMode("url")} className={`px-2 py-1 rounded ${imgMode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Paste URL</button>
          </div>
          {imgMode === "upload" ? (
            <label className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg bg-secondary border border-dashed border-border cursor-pointer hover:border-primary text-sm">
              {uploading ? "Uploading…" : form.image_path ? "✓ Image ready (click to replace)" : (<><Upload size={14}/> Pick prize image</>)}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
            </label>
          ) : (
            <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value, image_path: "" })} placeholder="https://…" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Winners</span>
            <input type="number" min={1} max={50} required value={form.winner_count} onChange={(e) => setForm({ ...form, winner_count: Math.max(1, Math.min(50, +e.target.value || 1)) })} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Result date & time</span>
            <input required type="datetime-local" value={form.result_at} onChange={(e) => setForm({ ...form, result_at: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border" />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.auto_pick} onChange={(e) => setForm({ ...form, auto_pick: e.target.checked })} />
          Auto-pick winner(s) at result time
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
            const gwinners = winners[g.id] || [];
            const gproofs = proofs[g.id] || [];
            return (
              <div key={g.id} className="bg-secondary/40 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <MediaImage source={g.image_url} className="w-10 h-10 rounded object-cover bg-secondary flex-shrink-0" fallback={<div className="w-10 h-10 rounded bg-secondary flex items-center justify-center"><ImageIcon size={14} className="opacity-40"/></div>} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{g.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      🎁 {g.prize} · {ended ? "Ended" : "Live"} · {new Date(g.result_at).toLocaleString()} · {g.winner_count}x {g.auto_pick ? "Auto" : "Manual"}
                    </div>
                  </div>
                  <button onClick={() => toggle(g.id)} className="p-1.5 rounded text-muted-foreground hover:bg-secondary" title="View"><Users size={14}/></button>
                  <button onClick={() => pickWinners(g.id)} className="p-1.5 rounded text-primary hover:bg-primary/10" title="Pick winners"><Dice5 size={14}/></button>
                  <button onClick={() => exportCsv(g)} className="p-1.5 rounded text-muted-foreground hover:bg-secondary" title="Export CSV"><FileSpreadsheet size={14}/></button>
                  <button onClick={() => exportPdf(g)} className="p-1.5 rounded text-muted-foreground hover:bg-secondary" title="Export branded PDF"><FileText size={14}/></button>
                  <button onClick={() => remove(g.id, g.image_url)} className="p-1.5 rounded text-destructive hover:bg-destructive/10"><Trash2 size={14}/></button>
                </div>

                {gwinners.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/30 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-primary"><Trophy size={12}/> {gwinners.length} winner{gwinners.length > 1 ? "s" : ""}</div>
                    {gwinners.map((w: any) => (
                      <div key={w.id} className="flex justify-between gap-2">
                        <span>#{w.win_position} {w.giveaway_entries.name}</span>
                        <span className="text-muted-foreground inline-flex items-center gap-1"><Mail size={10}/> {w.giveaway_entries.email}</span>
                      </div>
                    ))}
                  </div>
                )}

                {expanded === g.id && (
                  <div className="mt-3 space-y-3">
                    {gproofs.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold mb-2 text-primary">Winner proofs ({gproofs.length})</div>
                        <div className="space-y-2 max-h-80 overflow-auto">
                          {gproofs.map((pr) => <ProofRow key={pr.id} proof={pr} onModerate={moderateProof} userId={user!.id} />)}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-semibold mb-1">Entries</div>
                      <div className="space-y-1 max-h-60 overflow-auto">
                        {(entries[g.id] || []).map((en) => {
                          const isWinner = gwinners.some((w: any) => w.entry_id === en.id);
                          return (
                            <div key={en.id} className={`text-xs p-2 rounded ${isWinner ? "bg-primary/10" : "bg-background/50"}`}>
                              <div className="font-medium">{en.name} {isWinner && "🏆"}</div>
                              <div className="text-muted-foreground">{en.email}</div>
                              <div className="text-muted-foreground italic mt-1">"{en.reason}"</div>
                            </div>
                          );
                        })}
                        {(entries[g.id] || []).length === 0 && <p className="text-xs text-muted-foreground">No entries yet.</p>}
                      </div>
                    </div>
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

// --- Proof moderation row with cropping ---
const ProofRow = ({ proof, onModerate, userId }: { proof: any; onModerate: (id: string, status: "approved" | "rejected", hours: number, croppedPath?: string) => void; userId: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [hours, setHours] = useState(72);
  const [busy, setBusy] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => { resolveMediaUrl(proof.image_url).then(setUrl); }, [proof.image_url]);

  const approveWithCrop = async () => {
    setBusy(true);
    try {
      let path: string | undefined;
      if (cropping && completedCrop && imgRef.current) {
        const canvas = document.createElement("canvas");
        const img = imgRef.current;
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.9));
        path = await uploadGiveawayMedia(blob, userId, "proofs", "cropped.jpg");
      }
      onModerate(proof.id, "approved", hours, path);
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };

  return (
    <div className="p-2 bg-background/60 rounded space-y-2">
      <div className="flex items-start gap-2">
        {url && !cropping && <img src={url} alt="proof" className="w-24 h-24 object-cover rounded" />}
        {cropping && url && (
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
            <img ref={imgRef} src={url} alt="crop" className="max-w-full max-h-64" />
          </ReactCrop>
        )}
        <div className="flex-1 text-xs">
          <div className="text-muted-foreground">{new Date(proof.created_at).toLocaleString()}</div>
          {proof.caption && <div className="mt-1">"{proof.caption}"</div>}
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${proof.status === "approved" ? "bg-green-500/20 text-green-400" : proof.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-amber-500/20 text-amber-400"}`}>
            {proof.status}
          </span>
        </div>
      </div>
      {proof.status === "pending" && (
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setCropping(!cropping)} className="text-xs px-2 py-1 rounded bg-secondary inline-flex items-center gap-1"><CropIcon size={10}/> {cropping ? "Cancel crop" : "Crop"}</button>
          <label className="text-xs inline-flex items-center gap-1">Visible for
            <input type="number" min={1} max={720} value={hours} onChange={(e) => setHours(+e.target.value || 72)} className="w-14 px-1 py-0.5 rounded bg-secondary border border-border" /> hrs
          </label>
          <button disabled={busy} onClick={approveWithCrop} className="text-xs px-2 py-1 rounded bg-green-600 text-white inline-flex items-center gap-1"><Check size={10}/> Approve</button>
          <button onClick={() => onModerate(proof.id, "rejected", 0)} className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground inline-flex items-center gap-1"><X size={10}/> Reject</button>
        </div>
      )}
    </div>
  );
};

export default AdminGiveaways;
