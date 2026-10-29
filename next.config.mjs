/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    // 1 CPU: отключаем тяжелую статику, включаем минимальный клиентский рантайм
    optimizePackageImports: ["docx"],
  },
};

export default nextConfig;
