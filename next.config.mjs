/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "assets.stickpng.com",
      },
      {
        protocol: "https",
        hostname: "rukminim2.flixcart.com",
      },
    ],
  },
};

export default nextConfig;
