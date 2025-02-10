/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  plugins: ["tailwindcss", "autoprefixer"],
};

module.exports = nextConfig;
