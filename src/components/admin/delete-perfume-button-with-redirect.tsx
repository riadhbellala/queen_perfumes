"use client";

import { useRouter } from "next/navigation";
import { DeletePerfumeButton } from "@/components/admin/delete-perfume-button";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

// Same delete-confirmation + delete logic as the list view's icon button
// (DeletePerfumeButton), just with a labeled trigger and a redirect back to
// the list on success instead of removing a row from a local array.
export function DeletePerfumeButtonWithRedirect({
  perfumeId,
  perfumeName,
  imageUrl,
}: {
  perfumeId: string;
  perfumeName: string;
  imageUrl: string | null;
}) {
  const router = useRouter();

  return (
    <DeletePerfumeButton
      perfumeId={perfumeId}
      perfumeName={perfumeName}
      imageUrl={imageUrl}
      onDeleted={() => {
        router.push("/admin/parfums");
        router.refresh();
      }}
      trigger={
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={16} data-icon="inline-start" />
          Supprimer ce parfum
        </Button>
      }
    />
  );
}
