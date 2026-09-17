/**
 * Renders a price with a fixed digit direction and a font that has clean digit
 * glyphs — the Arabic display font (Amiri) is calligraphic and not designed for
 * large/bold Western digits, which is what makes numbers look broken or
 * overlapping once the Arabic locale's font-heading is applied to them.
 */
export function Price({ amount, className = "" }: { amount: number; className?: string }) {
  return (
    <bdi dir="ltr" className={`inline-block font-sans tabular-nums ${className}`}>
      {amount.toLocaleString()} DA
    </bdi>
  );
}
