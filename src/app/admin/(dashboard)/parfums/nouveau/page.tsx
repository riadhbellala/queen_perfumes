import Link from "next/link";
import { PerfumeForm } from "@/components/admin/perfume-form";
import { ChevronLeft } from "lucide-react";

export default function AdminNewPerfumePage() {
  return (
    <div>
      <Link
        href="/admin/parfums"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ChevronLeft size={16} />
        Retour aux parfums
      </Link>
      <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Nouveau parfum</h1>

      <div className="mt-6 max-w-3xl">
        <PerfumeForm mode="create" />
      </div>
    </div>
  );
}
