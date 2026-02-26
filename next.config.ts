
import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";


const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: ['pino', 'pino-pretty'],
    images: {
        unoptimized: true,
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


export default withSerwist(nextConfig);
