import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_PAGES === "true" ? "/Skill-saga-test" : "",
  assetPrefix: process.env.GITHUB_PAGES === "true" ? "/Skill-saga-test/" : "",
};
export default nextConfig;
