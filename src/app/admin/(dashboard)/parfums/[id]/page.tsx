import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerfumeForm, type PerfumeFormInitialData } from "@/components/admin/perfume-form";
import { DeletePerfumeButtonWithRedirect } from "@/components/admin/delete-perfume-button-with-redirect";
import { ChevronLeft } from "lucide-react";

export default async function AdminEditPerfumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("perfumes").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  const initialData: PerfumeFormInitialData = {
    id: data.id,
    name_fr: data.name_fr,
    name_ar: data.name_ar,
    description_fr: data.description_fr ?? "",
    description_ar: data.description_ar ?? "",
    price: Number(data.price),
    scent_family: data.scent_family ?? "",
    concentration: (data.concentration ?? "EDT") as PerfumeFormInitialData["concentration"],
    stock: data.stock,
    is_active: data.is_active,
    image_url: data.image_url,
  };

  return (
    <div>
      <Link
        href="/admin/parfums"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ChevronLeft size={16} />
        Retour aux parfums
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-balance text-zinc-900 sm:text-2xl">
          Modifier « {data.name_fr} »
        </h1>
        <DeletePerfumeButtonWithRedirect
          perfumeId={data.id}
          perfumeName={data.name_fr}
          imageUrl={data.image_url}
        />
      </div>

      <div className="mt-6 max-w-3xl">
        <PerfumeForm mode="edit" initialData={initialData} />
      </div>
    </div>
  );
}
