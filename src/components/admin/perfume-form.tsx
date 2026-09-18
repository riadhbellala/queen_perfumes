"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { uploadPerfumeImage, deletePerfumeImage } from "@/lib/supabase/storage";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag, Loader2 } from "lucide-react";

const CONCENTRATIONS = ["EDT", "EDP", "Parfum", "Extrait"] as const;

const perfumeSchema = z.object({
  name_fr: z.string().trim().min(1, "Le nom en français est requis."),
  name_ar: z.string().trim().min(1, "Le nom en arabe est requis."),
  description_fr: z.string().trim().min(1, "La description en français est requise."),
  description_ar: z.string().trim().min(1, "La description en arabe est requise."),
  price: z.number({ error: "Le prix doit être un nombre." }).positive("Le prix doit être un nombre positif."),
  scent_family: z.string().trim().min(1, "La famille olfactive est requise."),
  concentration: z.enum(CONCENTRATIONS),
  stock: z
    .number({ error: "Le stock doit être un nombre." })
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif."),
  is_active: z.boolean(),
});

type PerfumeFormValues = z.infer<typeof perfumeSchema>;

export type PerfumeFormInitialData = PerfumeFormValues & {
  id: string;
  image_url: string | null;
};

export function PerfumeForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: PerfumeFormInitialData;
}) {
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url ?? null);
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PerfumeFormValues>({
    resolver: zodResolver(perfumeSchema),
    defaultValues:
      initialData ?? {
        name_fr: "",
        name_ar: "",
        description_fr: "",
        description_ar: "",
        price: 0,
        scent_family: "",
        concentration: "EDT",
        stock: 0,
        is_active: true,
      },
  });

  const concentration = watch("concentration");
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

  async function onSubmit(values: PerfumeFormValues) {
    try {
      let imageUrl = initialData?.image_url ?? null;

      if (imageFile) {
        const newUrl = await uploadPerfumeImage(imageFile);
        if (initialData?.image_url) {
          await deletePerfumeImage(initialData.image_url);
        }
        imageUrl = newUrl;
      }

      const supabase = createClient();
      const payload = {
        name_fr: values.name_fr,
        name_ar: values.name_ar,
        description_fr: values.description_fr,
        description_ar: values.description_ar,
        price: values.price,
        scent_family: values.scent_family,
        concentration: values.concentration,
        stock: values.stock,
        is_active: values.is_active,
        image_url: imageUrl,
      };

      if (mode === "create") {
        const { error } = await supabase.from("perfumes").insert(payload);
        if (error) throw error;
        toast.success("Parfum créé avec succès.");
      } else {
        const { error } = await supabase.from("perfumes").update(payload).eq("id", initialData!.id);
        if (error) throw error;
        toast.success("Parfum mis à jour avec succès.");
      }

      router.push("/admin/parfums");
      router.refresh();
    } catch (err) {
      console.error("Failed to save perfume:", err);
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
        <Field data-invalid={!!errors.stock}>
          <FieldLabel htmlFor="stock">Stock</FieldLabel>
          <Input
            id="stock"
            type="number"
            step="1"
            min="0"
            className="h-11 rounded-lg"
            {...register("stock", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.stock]} />
        </Field>
        <Field data-invalid={!!errors.scent_family}>
          <FieldLabel htmlFor="scent_family">Famille olfactive</FieldLabel>
          <Input id="scent_family" className="h-11 rounded-lg" {...register("scent_family")} />
          <FieldError errors={[errors.scent_family]} />
        </Field>
        <Field data-invalid={!!errors.concentration}>
          <FieldLabel htmlFor="concentration">Concentration</FieldLabel>
          <Select
            value={concentration}
            onValueChange={(v) =>
              setValue("concentration", v as PerfumeFormValues["concentration"], { shouldValidate: true })
            }
          >
            <SelectTrigger id="concentration" className="h-11 w-full rounded-lg">
              <SelectValue placeholder="Choisir" />
            </SelectTrigger>
            <SelectContent>
              {CONCENTRATIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.concentration]} />
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

      <div className="flex justify-end gap-3 border-t border-zinc-100 pt-6">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/parfums")}>
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || compressing}
          className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement…" : mode === "create" ? "Créer le parfum" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
