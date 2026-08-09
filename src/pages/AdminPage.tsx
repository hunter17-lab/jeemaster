import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Plus, Trash2, Ban, ShieldOff, RefreshCw, Users, FileText, Mail, Pin, PinOff, Gift, BarChart3, Pencil } from "lucide-react";
import Layout from "@/components/Layout";
import AdminGiveaways from "@/components/AdminGiveaways";
import AdminAnalytics from "@/components/AdminAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { PYQ_SHIFTS, PYQ_SHIFT_START_YEAR, getMonthsForYear } from "@/data/pyqAttempts";

const CONTENT_TYPES = [
  { value: "notes", label: "📝 Notes" },
  { value: "mindmaps", label: "🧠 Mind Maps" },
  { value: "dpp", label: "⚡ DPP" },
  { value: "pyq", label: "🎯 PYQ" },
  { value: "books", label: "📚 Books" },
  { value: "coaching", label: "🏫 Coaching" },
] as const;

const SUBJECTS_DEFAULT = ["Physics", "Chemistry", "Mathematics", "General"];
const PYQ_YEARS = Array.from({ length: new Date().getFullYear() - 2002 + 1 }, (_, i) => String(2002 + i)).reverse();
const SUBJECTS_BY_TYPE: Record<string, string[]> = {
  books: ["Physics", "Chemistry", "Mathematics", "PCM"],
  pyq: PYQ_YEARS,
};
const getSubjects = (type: string) => SUBJECTS_BY_TYPE[type] || SUBJECTS_DEFAULT;

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"content" | "analytics" | "giveaways" | "users" | "bans">("content");
  const [form, setForm] = useState({ type: "notes", subject: "Physics", section: "", title: "", link: "", description: "", pyqShift: "Shift 1", pyqMonth: "January", resourceType: "" });
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [bans, setBans] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

  const saveEdit = async () => {
    if (!editItem) return;
    const { error } = await supabase
      .from("content_items")
      .update({
        title: editItem.title,
        link: editItem.link,
        subject: editItem.subject,
        section: editItem.section || null,
        description: editItem.description || null,
        resource_type: editItem.resource_type || null,
      } as any)
      .eq("id", editItem.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated ✅");
    setEditItem(null);
    loadAll();
  };


  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const loadAll = async () => {
    const [{ data: c }, { data: b }, { data: p }] = await Promise.all([
      supabase.from("content_items").select("*").order("created_at", { ascending: false }),
      supabase.from("banned_emails").select("*").order("banned_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);
    setItems(c || []);
    setBans(b || []);
    const map: Record<string, any> = {};
    (p || []).forEach((pr: any) => { map[pr.user_id] = pr; });
    setProfiles(map);

    const { data: ud, error } = await supabase.functions.invoke("admin-actions", { body: { action: "list_users" } });
    if (error) { toast.error(`Failed to load users: ${error.message}`); }
    else setUsers(ud?.users || []);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return <Layout><div className="page-container">Loading…</div></Layout>;
  }
  if (!isAdmin) {
    return (
      <Layout>
        <div className="page-container max-w-xl text-center">
          <Shield className="mx-auto mb-3 text-destructive" size={48} />
          <h1 className="text-2xl font-display font-bold mb-2">Access denied</h1>
          <p className="text-muted-foreground">You need admin rights to view this page.</p>
        </div>
      </Layout>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const isPyqShift = form.type === "pyq" && Number(form.subject) >= PYQ_SHIFT_START_YEAR;
    const sectionValue = isPyqShift
      ? `${form.pyqShift} - ${form.pyqMonth}`
      : (form.section || null);
    const titleValue = form.title.trim() || (form.type === "pyq" ? `JEE Main ${form.subject}${sectionValue ? ` — ${sectionValue}` : ""}` : form.title);
    const { error } = await supabase.from("content_items").insert({
      type: form.type as any,
      subject: form.subject,
      section: sectionValue,
      title: titleValue,
      link: form.link,
      description: form.description || null,
      created_by: user!.id,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Uploaded ✨");
    setForm({ ...form, title: "", link: "", description: "" });
    loadAll();
  };

  const removeItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("content_items").delete().eq("id", id);
    loadAll();
  };

  const togglePin = async (it: any) => {
    if (!it.pinned) {
      const pinnedCount = items.filter((x) => x.pinned).length;
      if (pinnedCount >= 10) {
        toast.error("Pin limit reached (max 10). Unpin something first.");
        return;
      }
    }
    const { error } = await supabase
      .from("content_items")
      .update({ pinned: !it.pinned })
      .eq("id", it.id);
    if (error) toast.error(error.message);
    else { toast.success(it.pinned ? "Unpinned" : "Pinned to landing"); loadAll(); }
  };

  const banUser = async (u: any) => {
    if (!confirm(`Ban ${u.email}? Their account will be deleted and they cannot sign up again.`)) return;
    const { error } = await supabase.functions.invoke("admin-actions", {
      body: { action: "ban_user", target_user_id: u.id, target_email: u.email },
    });
    if (error) toast.error(error.message); else { toast.success("User banned"); loadAll(); }
  };
  const deleteUser = async (u: any) => {
    if (!confirm(`Permanently delete ${u.email}?`)) return;
    const { error } = await supabase.functions.invoke("admin-actions", {
      body: { action: "delete_user", target_user_id: u.id },
    });
    if (error) toast.error(error.message); else { toast.success("User deleted"); loadAll(); }
  };
  const unban = async (email: string) => {
    const { error } = await supabase.functions.invoke("admin-actions", {
      body: { action: "unban_email", target_email: email },
    });
    if (error) toast.error(error.message); else { toast.success("Unbanned"); loadAll(); }
  };

  return (
    <Layout>
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
            <Shield size={14} /> Admin Panel
          </div>
          <h1 className="text-3xl font-display font-bold">Manage everything</h1>
        </motion.div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { k: "content", label: "📦 Content", icon: FileText },
            { k: "analytics", label: "📊 Analytics", icon: BarChart3 },
            { k: "giveaways", label: "🎁 Giveaways", icon: Gift },
            { k: "users", label: "👥 Users", icon: Users },
            { k: "bans", label: "🚫 Bans", icon: Ban },
          ].map(({ k, label }) => (
            <button
              key={k}
              onClick={() => setTab(k as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === k ? "gradient-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
          <button onClick={loadAll} className="ml-auto px-3 py-2 rounded-lg bg-secondary text-sm flex items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {tab === "content" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={submit} className="glass-card p-6 space-y-3">
              <h3 className="font-display font-semibold mb-2 flex items-center gap-2"><Plus size={18}/> Upload Item</h3>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={(e) => {
                  const newType = e.target.value;
                  const subs = getSubjects(newType);
                  setForm({ ...form, type: newType, subject: subs.includes(form.subject) ? form.subject : subs[0] });
                }} className="px-3 py-2 rounded-lg bg-secondary border border-border">
                  {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={form.subject} onChange={(e) => {
                  const newSubject = e.target.value;
                  const months = form.type === "pyq" ? getMonthsForYear(newSubject) : [];
                  setForm({ ...form, subject: newSubject, pyqMonth: months.includes(form.pyqMonth) ? form.pyqMonth : (months[0] || form.pyqMonth) });
                }} className="px-3 py-2 rounded-lg bg-secondary border border-border">
                  {getSubjects(form.type).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {form.type === "pyq" && Number(form.subject) >= PYQ_SHIFT_START_YEAR ? (
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.pyqShift} onChange={(e) => setForm({ ...form, pyqShift: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border">
                    {PYQ_SHIFTS.map(s => <option key={s} value={s}>{s === "Shift 1" ? "🅰️" : "🅱️"} {s}</option>)}
                  </select>
                  <select value={form.pyqMonth} onChange={(e) => setForm({ ...form, pyqMonth: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border">
                    {getMonthsForYear(form.subject).map(m => <option key={m} value={m}>{m} Attempt</option>)}
                  </select>
                </div>
              ) : form.type !== "pyq" ? (
                <input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="Section (e.g. Class 11) — optional" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              ) : null}
              <input required={form.type !== "pyq"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.type === "pyq" ? "Paper title (e.g. 24 Jan Morning) — optional" : "Title (chapter / topic name)"} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <input required type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://drive.google.com/..." className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <button disabled={busy} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold disabled:opacity-50">
                {busy ? "Uploading…" : "Upload"}
              </button>
            </form>

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                All Uploaded ({items.length})
                <span className="ml-auto text-xs font-normal text-muted-foreground inline-flex items-center gap-1">
                  <Pin size={12} /> {items.filter((x) => x.pinned).length}/10 pinned
                </span>
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-auto">
                {items.map((it) => (
                  <div key={it.id} className={`flex items-center gap-2 p-3 rounded-lg ${it.pinned ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-1">
                        {it.pinned && <Pin size={12} className="text-primary shrink-0" />}
                        {it.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{it.type} · {it.subject}{it.section ? ` · ${it.section}` : ""}</div>
                    </div>
                    <a href={it.link} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">open</a>
                    <button onClick={() => setEditItem({ ...it })} title="Edit" className="p-1.5 rounded text-muted-foreground hover:bg-secondary">
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => togglePin(it)}
                      title={it.pinned ? "Unpin" : "Pin to landing"}
                      className={`p-1.5 rounded ${it.pinned ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      {it.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button onClick={() => removeItem(it.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
              </div>
            </div>
          </div>
        )}

        {editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setEditItem(null)}>
            <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display font-semibold flex items-center gap-2"><Pencil size={16} /> Edit item</h3>
              <input value={editItem.title || ""} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <select value={editItem.subject} onChange={(e) => setEditItem({ ...editItem, subject: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border">
                {getSubjects(editItem.type).map((s) => <option key={s}>{s}</option>)}
              </select>
              <input value={editItem.section || ""} onChange={(e) => setEditItem({ ...editItem, section: e.target.value })} placeholder="Author / section" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <input value={editItem.description || ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} placeholder="Edition / year / description" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <input type="url" value={editItem.link || ""} onChange={(e) => setEditItem({ ...editItem, link: e.target.value })} placeholder="Link" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border" />
              <div className="flex gap-2 pt-1">
                <button onClick={saveEdit} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold">Save</button>
                <button onClick={() => setEditItem(null)} className="px-4 py-2 rounded-lg bg-secondary">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && <AdminAnalytics />}


        {tab === "giveaways" && <AdminGiveaways />}

        {tab === "users" && (
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-3">All Users ({users.length})</h3>
            <p className="text-xs text-muted-foreground mb-3">Click a user's name to see their full profile.</p>
            <div className="space-y-2 max-h-[700px] overflow-auto">
              {users.map((u) => {
                const p = profiles[u.id] || {};
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="w-9 h-9 rounded-full overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground font-bold uppercase text-sm shrink-0"
                      title="View profile"
                    >
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (p.display_name || u.email || "U")[0]
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="flex-1 min-w-0 text-left hover:opacity-80 transition"
                    >
                      <div className="text-sm font-medium truncate hover:underline">{p.display_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail size={10}/> {u.email}</div>
                    </button>
                    <button onClick={() => banUser(u)} className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs flex items-center gap-1"><Ban size={12}/> Ban</button>
                    <button onClick={() => deleteUser(u)} className="px-2 py-1 rounded bg-destructive/15 text-destructive text-xs flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                  </div>
                );
              })}
              {users.length === 0 && <p className="text-sm text-muted-foreground">No users.</p>}
            </div>
          </div>
        )}

        {selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
              {(() => {
                const p = profiles[selectedUser.id] || {};
                const initials = (p.display_name || selectedUser.email || "U")[0]?.toUpperCase();
                const rows: [string, string][] = [
                  ["Display name", p.display_name || "—"],
                  ["Email", selectedUser.email || "—"],
                  ["Phone", p.phone || "—"],
                  ["Class", p.class_name || "—"],
                  ["Coaching institute", p.coaching_institute || "—"],
                  ["State", p.state || "—"],
                  ["User ID", selectedUser.id],
                  ["Joined", selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "—"],
                ];
                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-semibold truncate">{p.display_name || "Unnamed user"}</div>
                        <div className="text-xs text-muted-foreground truncate">{selectedUser.email}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {rows.map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between gap-3 text-sm border-b border-border/40 pb-1.5">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="text-right break-words max-w-[60%] font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button
                        onClick={() => { banUser(selectedUser); setSelectedUser(null); }}
                        className="flex-1 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Ban size={14}/> Ban
                      </button>
                      <button
                        onClick={() => { deleteUser(selectedUser); setSelectedUser(null); }}
                        className="flex-1 px-3 py-2 rounded-lg bg-destructive/15 text-destructive text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {tab === "bans" && (
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-3">Banned Emails ({bans.length})</h3>
            <div className="space-y-2">
              {bans.map((b) => (
                <div key={b.id} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Ban size={16} className="text-destructive" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{b.email}</div>
                    {b.reason && <div className="text-xs text-muted-foreground">{b.reason}</div>}
                  </div>
                  <button onClick={() => unban(b.email)} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs flex items-center gap-1">
                    <ShieldOff size={12}/> Unban
                  </button>
                </div>
              ))}
              {bans.length === 0 && <p className="text-sm text-muted-foreground">No bans.</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPage;
