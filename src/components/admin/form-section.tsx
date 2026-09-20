import React from "react";

// Shared card-with-heading wrapper for admin forms (Perfumes/Boxes create &
// edit) — splits a long flat form into clearly labeled, scannable groups
// instead of one undifferentiated block of fields.
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
