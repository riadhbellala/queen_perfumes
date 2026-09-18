"use client";

import { useRouter } from "next/navigation";
import { DeleteBoxButton } from "@/components/admin/delete-box-button";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteBoxButtonWithRedirect({
  packId,
  packName,
  imageUrl,
}: {
  packId: string;
  packName: string;
  imageUrl: string | null;
}) {
  const router = useRouter();

  return (
    <DeleteBoxButton
      packId={packId}
      packName={packName}
      imageUrl={imageUrl}
      onDeleted={() => {
        router.push("/admin/boxes");
        router.refresh();
      }}
      trigger={
        <Button
          type="button"
          variant="outline"
          className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={16} data-icon="inline-start" />
          Supprimer cette box
        </Button>
      }
    />
  );
}
