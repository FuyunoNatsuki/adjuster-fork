/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'etro.gg' }
        ]
    },
    webpack(config) {
        config.module.rules.push({
          test: /\.worker\.ts$/,
          loader: 'worker-loader',
          options: {
            name: 'static/[hash].worker.js',
            publicPath: '/_next/'
          }
        });
        return config;
    }
};

export default nextConfig;
