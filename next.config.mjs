// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        canvas: false,
      };

      config.module.rules.push({
        test: /canvas/,
        use: 'ignore-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
