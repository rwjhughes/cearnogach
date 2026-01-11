/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
        // Optimize large JSON imports
        if (!isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    ...config.optimization.splitChunks,
                    cacheGroups: {
                        ...config.optimization.splitChunks?.cacheGroups,
                        wordList: {
                            name: 'word-list',
                            test: /word-list\.json/,
                            chunks: 'all',
                            priority: 10,
                        },
                    },
                },
            };
        }
        return config;
    },
}

module.exports = nextConfig
