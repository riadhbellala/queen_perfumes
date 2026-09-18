"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
// Reused as-is from the Perfumes CRUD — same "perfume-images" Storage
// bucket, box images just live alongside perfume images in it.
import { uploadPerfumeImage, deletePerfumeImage } from "@/lib/supabase/storage";
import { PerfumeMultiSelect, type SelectablePerfume } from "@/components/admin/perfume-multi-select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ShoppingBag, Loader2 } from "lucide-react";

const boxSchema = z.object({
  name_fr: z.string().trim().min(1, "Le nom en français est requis."),
  name_ar: z.string().trim().min(1, "Le nom en arabe est requis."),
  description_fr: z.string().trim().min(1, "La description en français est requise."),
  description_ar: z.string().trim().min(1, "La description en arabe est requise."),
  price: z.number({ error: "Le prix doit être un nombre." }).positive("Le prix doit être un nombre positif."),
  is_active: z.boolean(),
});

type BoxFormValues = z.infer<typeof boxSchema>;

export type BoxFormInitialData = BoxFormValues & {
  id: string;
  image_url: string | null;
  perfumeIds: string[];
};

const MIN_PERFUMES = 2;

export function BoxForm({
  mode,
  perfumes,
  initialData,
}: {
  mode: "create" | "edit";
  /** Selectable perfumes — active ones, plus (for edit) any already-linked
      perfume even if it's since been deactivated, so it isn't silently
      dropped from the box just because the list no longer shows it. */
  perfumes: SelectablePerfume[];
  initialData?: BoxFormInitialData;
}) {
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url ?? null);
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialData?.perfumeIds ?? []);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema),
    defaultValues:
      initialData ?? {
        name_fr: "",
        name_ar: "",
        description_fr: "",
        description_ar: "",
        price: 0,
        is_active: true,
      },
  });

  const isActive = watch("is_active");

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const result = await compressImage(file);
      setImageFile(result.file);
      setPreviewUrl(URL.createObjectURL(result.file));
      setSizeInfo(`${result.originalSizeLabel} → ${result.compressedSizeLabel}`);
    } finally {
      setCompressing(false);
    }
  }

  async function onSubmit(values: BoxFormValues) {
    if (selectedIds.length < MIN_PERFUMES) {
      setSelectionError(`Sélectionnez au moins ${MIN_PERFUMES} parfums pour cette box.`);
      return;
    }
    setSelectionError(null);

    const supabase = createClient();

    try {
      let imageUrl = initialData?.image_url ?? null;
      if (imageFile) {
        const newUrl = await uploadPerfumeImage(imageFile);
        if (initialData?.image_url) {
          await deletePerfumeImage(initialData.image_url);
        }
        imageUrl = newUrl;
      }

      const payload = {
        name_fr: values.name_fr,
        name_ar: values.name_ar,
        description_fr: values.description_fr,
        description_ar: values.description_ar,
        price: values.price,
        is_active: values.is_active,
        image_url: imageUrl,
      };

      if (mode === "create") {
        const { data: pack, error: packError } = await supabase
          .from("packs")
          .insert(payload)
          .select("id")
          .single();
        if (packError) throw packError;

        const { error: linksError } = await supabase
          .from("pack_perfumes")
          .insert(selectedIds.map((perfumeId) => ({ pack_id: pack.id, perfume_id: perfumeId })));
        if (linksError) {
          // Don't leave an empty, perfume-less box behind if the links fail.
          await supabase.from("packs").delete().eq("id", pack.id);
          throw linksError;
        }

        toast.success("Box créée avec succès.");
      } else {
        const { error: packError } = await supabase.from("packs").update(payload).eq("id", initialData!.id);
        if (packError) throw packError;

        // Simple reconcile: clear the links then re-insert the current
        // selection. Acceptable at this scale — a pack has at most a
        // handful of perfumes, no concurrent editors.
        const { error: deleteLinksError } = await supabase
          .from("pack_perfumes")
          .delete()
          .eq("pack_id", initialData!.id);
        if (deleteLinksError) throw deleteLinksError;

        const { error: insertLinksError } = await supabase
          .from("pack_perfumes")
          .insert(selectedIds.map((perfumeId) => ({ pack_id: initialData!.id, perfume_id: perfumeId })));
        if (insertLinksError) throw insertLinksError;

        toast.success("Box mise à jour avec succès.");
      }

      router.push("/admin/boxes");
      router.refresh();
    } catch (err) {
      console.error("Failed to save box:", err);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field data-invalid={!!errors.name_fr}>
          <FieldLabel htmlFor="name_fr">Nom (Français)</FieldLabel>
          <Input id="name_fr" className="h-11 rounded-lg" {...register("name_fr")} />
          <FieldError errors={[errors.name_fr]} />
        </Field>
        <Field data-invalid={!!errors.name_ar}>
          <FieldLabel htmlFor="name_ar">Nom (Arabe)</FieldLabel>
          <Input id="name_ar" dir="rtl" className="h-11 rounded-lg" {...register("name_ar")} />
          <FieldError errors={[errors.name_ar]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field data-invalid={!!errors.description_fr}>
          <FieldLabel htmlFor="description_fr">Description (Français)</FieldLabel>
          <Textarea id="description_fr" rows={4} className="rounded-lg" {...register("description_fr")} />
          <FieldError errors={[errors.description_fr]} />
        </Field>
        <Field data-invalid={!!errors.description_ar}>
          <FieldLabel htmlFor="description_ar">Description (Arabe)</FieldLabel>
          <Textarea
            id="description_ar"
            dir="rtl"
            rows={4}
            className="rounded-lg"
            {...register("description_ar")}
          />
          <FieldError errors={[errors.description_ar]} />
        </Field>
      </div>

      {/* Price is independent on purpose — it is NOT derived from the
          selected perfumes' prices, and nothing here suggests it should
          match their sum. */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="price">Prix (DA)</FieldLabel>
          <Input
            id="price"
            type="number"
            step="1"
            min="0"
            className="h-11 rounded-lg"
            {...register("price", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.price]} />
        </Field>
      </div>

      <Field orientation="horizontal" className="items-center gap-3">
        <Switch checked={isActive} onCheckedChange={(v) => setValue("is_active", v)} id="is_active" />
        <FieldLabel htmlFor="is_active" className="cursor-pointer">
          Actif (visible sur le site)
        </FieldLabel>
      </Field>

      <Field>
        <FieldLabel htmlFor="image">Photo</FieldLabel>
        <div className="flex items-center gap-4">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ShoppingBag className="text-zinc-300" size={28} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="h-11 rounded-lg"
            />
            {compressing && (
              <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Loader2 className="animate-spin" size={12} />
                Compression en cours…
              </p>
            )}
            {!compressing && sizeInfo && <p className="text-xs text-zinc-500">{sizeInfo}</p>}
          </div>
        </div>
      </Field>

      <Field>
        <FieldLabel>Parfums inclus</FieldLabel>
        <PerfumeMultiSelect
          perfumes={perfumes}
          selectedIds={selectedIds}
          onChange={(ids) => {
            setSelectedIds(ids);
            if (ids.length >= MIN_PERFUMES) setSelectionError(null);
          }}
        />
        {selectionError && <p className="text-sm text-destructive">{selectionError}</p>}
      </Field>

      <div className="flex justify-end gap-3 border-t border-zinc-100 pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/boxes")}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || compressing}
          className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement…" : mode === "create" ? "Créer la box" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
