import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BoxForm } from "@/components/admin/box-form";
import { ChevronLeft } from "lucide-react";

export default async function AdminNewBoxPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("perfumes")
    .select("id, name_fr, image_url")
    .eq("is_active", true)
    .order("name_fr", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/boxes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ChevronLeft size={16} />
        Retour aux boxes
      </Link>
      <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Nouvelle box</h1>

      <div className="mt-6 max-w-3xl">
        <BoxForm mode="create" perfumes={data ?? []} />
      </div>
    </div>
  );
}
