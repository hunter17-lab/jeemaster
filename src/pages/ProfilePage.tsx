import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Save, User, Trash2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    phone: "",
    class_name: "11",
    avatar_url: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setProfile({
        display_name: data.display_name || "",
        phone: data.phone || "",
        class_name: data.class_name || "11",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        phone: profile.phone,
        class_name: profile.class_name,
        avatar_url: profile.avatar_url,
      })
      .eq("user_id", user!.id);

    if (error) {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } else {
      toast({ title: "✅ Saved!", description: "Profile updated successfully" });
    }
    setSaving(false);
  };

  const initials = profile.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">👤 My Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your account details</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <Avatar className="w-24 h-24 mb-3 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5">📝 Display Name</label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Your name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5">📱 Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium mb-1.5">🎓 Class</label>
              <select
                value={profile.class_name}
                onChange={(e) => setProfile({ ...profile, class_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
                <option value="dropper">Dropper</option>
              </select>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium mb-1.5">🖼️ Profile Picture URL</label>
              <input
                type="url"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <div className="pt-6 mt-2 border-t border-border/50">
              <h3 className="text-sm font-semibold text-destructive mb-2">⚠️ Danger zone</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Permanently delete your account. You can sign up again later with the same email, but your old data will be gone.
              </p>
              <button
                onClick={async () => {
                  if (!confirm("Are you sure? This permanently deletes your account.")) return;
                  const { error } = await supabase.functions.invoke("delete-self", {});
                  if (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  } else {
                    await supabase.auth.signOut();
                    toast({ title: "Account deleted" });
                    navigate("/");
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold flex items-center justify-center gap-2 hover:bg-destructive/20"
              >
                <Trash2 size={16} /> Delete Account Permanently
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
