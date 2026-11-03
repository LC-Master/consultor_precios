import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    turbopack: {
        root: process.cwd()
    },
    output: "standalone",
    serverExternalPackages: ['pino', 'pino-pretty', 'pino-abstract-transport', 'thread-stream'],
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdsqa.locatel.com.ve',
                pathname: '/api/media/**',
            },
        ],
    },
};


export default nextConfig;
