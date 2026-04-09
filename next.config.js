// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5001',
//         pathname: '/uploads/**',
//       },
//     ],
//   },
// };

// export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "localhost",
//         port: "5001",
//         pathname: "/uploads/**",
//       },
//     ],
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cctv-shop-backend.onrender.com'],
  },
};

module.exports = nextConfig;