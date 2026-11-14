import { supabase } from "@/integrations/supabase/client";

const BUCKET = "giveaway-media";

/** Upload a file (or Blob) to giveaway-media under <userId>/<folder>/<name>. Returns the storage path. */
export async function uploadGiveawayMedia(
  file: File | Blob,
  userId: string,
  folder: "prizes" | "proofs",
  filename?: string
): Promise<string> {
  const ext = filename?.split(".").pop() || (file instanceof File ? file.name.split(".").pop() : "png") || "png";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${userId}/${folder}/${name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/png",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Resolve a stored value to a viewable URL.
 *  - http(s) URL → returned as-is (admin pasted a link)
 *  - storage path → returns a long-lived signed URL
 */
export async function resolveMediaUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  // Public giveaway content is served through a short-lived URL only after the
  // server confirms the file is an active prize image or visible approved proof.
  const { data: publicMedia } = await supabase.functions.invoke("giveaway-media-url", {
    body: { path: value },
  });
  if (publicMedia?.signedUrl) return publicMedia.signedUrl;

  // Owners and admins may still view private/pending material through Storage RLS.
  const { data: ownedMedia } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60);
  return ownedMedia?.signedUrl || null;
}

/** Delete a previously-uploaded storage object. Ignores http URLs. */
export async function deleteGiveawayMedia(value: string | null | undefined) {
  if (!value || /^https?:\/\//i.test(value)) return;
  await supabase.storage.from(BUCKET).remove([value]);
}
