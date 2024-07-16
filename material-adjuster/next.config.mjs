/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'etro.gg' }
        ]
    }
};

export default nextConfig;
