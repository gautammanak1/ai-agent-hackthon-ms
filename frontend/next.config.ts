/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: { resolve: { alias: { [x: string]: boolean; }; extensions: string[]; }; module: { rules: { test: RegExp; use: string; }[]; }; }, { isServer }: any) => {
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