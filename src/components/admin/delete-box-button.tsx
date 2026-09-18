"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deletePerfumeImage } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

// packs is referenced by pack_perfumes.pack_id with ON DELETE CASCADE and by
// order_items.pack_id with ON DELETE SET NULL — unlike perfumes, nothing
// blocks a pack delete, so there's no specific "still in use" branch here.
export function DeleteBoxButton({
  packId,
  packName,
  imageUrl,
  onDeleted,
  trigger,
}: {
  packId: string;
  packName: string;
  imageUrl: string | null;
  onDeleted: () => void;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("packs").delete().eq("id", packId);

    setDeleting(false);

    if (dbError) {
      setError("Une erreur est survenue lors de la suppression.");
      return;
    }

    if (imageUrl) {
      await deletePerfumeImage(imageUrl);
    }
    toast.success("Box supprimée.");
    setOpen(false);
    onDeleted();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger
        render={trigger ?? <Button variant="outline" size="icon-sm" aria-label="Supprimer" />}
      >
        {!trigger && <Trash2 size={14} />}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {packName} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est définitive et ne peut pas être annulée. Les parfums associés à cette box
            seront dissociés (mais pas supprimés).
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting ? "Suppression…" : "Supprimer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
