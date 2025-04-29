/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore canvas and .node files in the browser
    if (!isServer) {
      config.resolve.alias["canvas"] = false;
      config.resolve.extensions = [".js", ".jsx", ".ts", ".tsx"];
    }

    // Add rule to ignore .node files using null-loader
    config.module.rules.push({
      test: /\.node$/,
      use: "null-loader",
    });

    return config;
  },
};

module.exports = nextConfig;