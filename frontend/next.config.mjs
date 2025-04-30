/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore canvas in the browser
    if (!isServer) {
      config.resolve.alias["canvas"] = false;
      config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx"];
    }

    // Handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'ignore-loader', // Alternative to null-loader
    });

    return config;
  },
};

export default nextConfig;
