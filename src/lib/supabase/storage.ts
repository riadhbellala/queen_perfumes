import { createClient } from "@/lib/supabase/client";

const PERFUME_IMAGES_BUCKET = "perfume-images";

export async function uploadPerfumeImage(file: File): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop() || "webp";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(PERFUME_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type || "image/webp",
    cacheControl: "3600",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PERFUME_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Best-effort: an old image that fails to delete just becomes an orphaned
// object in the bucket, not a broken perfume — never let this block a save.
export async function deletePerfumeImage(publicUrl: string): Promise<void> {
  const marker = `/object/public/${PERFUME_IMAGES_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const path = publicUrl.slice(markerIndex + marker.length);
  const supabase = createClient();
  const { error } = await supabase.storage.from(PERFUME_IMAGES_BUCKET).remove([path]);
  if (error) {
    console.warn("Failed to delete old perfume image from storage:", error);
  }
}
