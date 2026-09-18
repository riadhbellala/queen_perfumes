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

// perfumes.id is referenced by pack_perfumes with ON DELETE RESTRICT (a
// perfume still inside a box can't be deleted) but by order_items with
// ON DELETE SET NULL (past orders never block a delete) — so a 23503
// foreign-key violation here only ever really means "still in a box".
const FOREIGN_KEY_VIOLATION = "23503";

export function DeletePerfumeButton({
  perfumeId,
  perfumeName,
  imageUrl,
  onDeleted,
  trigger,
}: {
  perfumeId: string;
  perfumeName: string;
  imageUrl: string | null;
  onDeleted: () => void;
  /** Custom trigger element; defaults to a small icon-only outline button. */
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);

    const supabase = createClient();
    const { error: dbError } = await supabase.from("perfumes").delete().eq("id", perfumeId);

    setDeleting(false);

    if (dbError) {
      setError(
        dbError.code === FOREIGN_KEY_VIOLATION
          ? "Ce parfum est utilisé dans une box existante et ne peut pas être supprimé. Marquez-le plutôt comme inactif."
          : "Une erreur est survenue lors de la suppression."
      );
      return;
    }

    if (imageUrl) {
      await deletePerfumeImage(imageUrl);
    }
    toast.success("Parfum supprimé.");
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
        render={
          trigger ?? <Button variant="outline" size="icon-sm" aria-label="Supprimer" />
        }
      >
        {!trigger && <Trash2 size={14} />}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {perfumeName} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est définitive et ne peut pas être annulée.
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
