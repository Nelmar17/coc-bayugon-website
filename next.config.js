/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "2mb",
//     },
//   },
//   reactStrictMode: false,
// };

// module.exports = nextConfig;










// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   productionBrowserSourceMaps: false,
//   reactStrictMode: true,
// };

// module.exports = nextConfig;


//PALPAK
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     turbo: false, // DISABLE TURBOPACK (BUG FIX)
//     serverActions: {
//       bodySizeLimit: "2mb",
//     },
//   },
//   reactStrictMode: false,
// };

// module.exports = nextConfig;

