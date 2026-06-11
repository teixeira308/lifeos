import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@base-ui/react",
      "firebase/auth",
      "firebase/firestore",
    ],
  },
};

export default nextConfig;
