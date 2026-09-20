/** Lightweight loading placeholder for client-hydrated storefront pages. */
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse px-6 py-12 lg:px-8">
      <div className="mb-10 h-10 w-48 rounded-full bg-muted" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted/70" />
        ))}
      </div>
    </div>
  );
}
