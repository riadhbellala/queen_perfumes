@AGENTS.md

## Progress Log

- [x] **Checkout flow (COD)** — `/commande` (order review accordion + delivery form) and `/commande/confirmation`, backed by a localStorage-persisted `CartContext` and a minimal `/panier` page. Cash on Delivery only; wilaya list hardcoded in `src/lib/wilayas.ts`.
  - Pending: delivery fee calculation by wilaya (currently a placeholder note, fee not added to total).
  - Pending: Yalidine / ZR Express shipping integration.
  - Pending: real order persistence — orders are not sent anywhere yet; the confirmation page reads a temporary `sessionStorage` snapshot written at submit time. This needs Supabase (or another backend) before it's production-ready.
