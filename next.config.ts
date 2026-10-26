import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 历法库为纯 JS/TS 实现，无需转译特殊依赖
  poweredByHeader: false,
};

export default nextConfig;
