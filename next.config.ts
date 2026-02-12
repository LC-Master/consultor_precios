
import type { NextConfig } from "next";


const nextConfig: NextConfig = {
    serverExternalPackages: ['pino', 'pino-pretty'],
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/api/media/**',
            },
        ],
    },
};


export default nextConfig;
