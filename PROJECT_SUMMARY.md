# The Queen of Perfumes - Project Overview

This document provides a comprehensive summary of the architecture, features, and design implementations built for **The Queen of Perfumes** e-commerce web application.

## 🛠️ Technology Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Accessible, customizable Radix primitives)
- **Internationalization:** `next-intl` (Server & Client side translations)
- **Icons:** Lucide React
- **Data Management:** Static placeholder data (Structured for seamless Supabase migration)

---

## 🌍 Internationalization (i18n) & Routing
The application is fully bilingual, supporting **French (`fr`)** and **Arabic (`ar`)**.
- **Dynamic Routing:** All shop routes are wrapped in a `[locale]` dynamic segment (e.g., `/fr/coffrets`, `/ar/parfums`).
- **RTL Support:** The layout automatically adjusts text direction (`dir="rtl"`) and alignment when the Arabic locale is selected, ensuring a native browsing experience for MENA users.
- **Translation Dictionaries:** All static text is extracted into `messages/fr.json` and `messages/ar.json`, ensuring no hardcoded strings exist in the UI components.

---

## 🎨 UI/UX & Design Philosophy
The design language reflects a premium, high-end luxury brand.
- **Color Palette:** Warm, elegant tones including soft beige (`#E8E2D6`), taupe/brown (`#8c7a6b`, `#5c4a3d`), stark white, and deep zinc/black for high contrast.
- **Typography:** Sophisticated serif/sans-serif combinations utilizing standard Tailwind variables (`font-heading`, `font-body`).
- **Micro-interactions:** Extensive use of smooth hover states, scaling images, frosted glass (`backdrop-blur`), and subtle pulses on call-to-action buttons.

---

## 🚀 Core Features & Pages

### 1. Home Page (`/[locale]/(shop)/page.tsx`)
- **Hero Section:** Features a high-quality background image, a dark overlay for text readability, and a glowing, pulsating "Explore" CTA button alongside social media links (Instagram, TikTok).
- **Infinite Marquee:** A mathematically perfect, CSS-driven infinite scrolling banner displaying brand trust signals ("2000+ satisfied clients", "Shipping to 58 wilayas").
- **Custom Pack Banner:** A distinct, dark-themed section prompting users to build their own personalized pack.
- **Curated Showcases:** Responsive grids highlighting "Iconic Perfumes" and "Recommended Packs".

### 2. Perfumes & Curated Packs (`/parfums` & `/coffrets`)
- **Layout:** A split-pane design featuring a sticky filter sidebar on desktop and a responsive product grid.
- **Mobile Filters:** Utilizes `shadcn/ui` Sheets to slide in filter options on mobile devices (sliding from the left for French, right for Arabic).
- **Filtering & Sorting:** Users can filter by price range (using a dual-thumb slider) and sort by relevance, price, or name.
- **Product Cards:** Highly polished cards (`ProductCard.tsx`) featuring 4:5 aspect ratios, elegant badges ("New", "Out of Stock"), scent families, concentrations, and "Add to Cart" interactions.

### 3. Build Your Own Pack (`/creez-votre-coffret`)
A custom, interactive builder allowing users to create personalized perfume sets.
- **Step 1 (Size Selection):** Users choose between a 3-perfume pack (1900 DA) or a 4-perfume pack (2000 DA).
- **Step 2 (Perfume Picker):** A visual grid where users select individual perfumes. The grid dynamically disables unselected items once the required count is reached.
- **Sticky Summary Bar:** A persistent bottom bar showing thumbnail avatars of selected perfumes, a real-time counter (e.g., "2/4 selected"), the total price, and the final checkout button.
- **State Management:** Handled locally via React state, structured to easily integrate with a global cart context or backend order system via the `CustomPackOrder` type.

---

## 💾 Data Architecture
Currently, the application relies on `src/lib/placeholder-data.ts`.
- **Types Defined:** `Perfume`, `Pack`, `PackSizePricing`, and `CustomPackOrder`.
- **Readiness:** The data shape closely mirrors standard relational database schemas (e.g., UUIDs, foreign keys like `perfumeIds`), ensuring that when a backend (like Supabase) is connected, the frontend components will require minimal refactoring.
