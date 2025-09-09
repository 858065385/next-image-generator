/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only configuration
  experimental: {
    // Disable static optimization for API-only mode
    outputFileTracingIncludes: {
      '/api/**/*': ['./src/backend/**/*'],
    },
  },
};

export default nextConfig;