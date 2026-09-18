// Never hardcode the number in a component — always read it from here, which
// reads the env var once. NEXT_PUBLIC_ vars are inlined at build time, so
// this is safe to call from client components.
export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${number}?${params.toString()}`;
}
