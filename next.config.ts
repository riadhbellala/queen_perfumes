import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // The project's actual Supabase Storage hostname (from
        // NEXT_PUBLIC_SUPABASE_URL) — perfume/box photos are served from
        // https://gvqiiznuyjjxrctqhgty.supabase.co/storage/v1/object/public/...
        hostname: "gvqiiznuyjjxrctqhgty.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
