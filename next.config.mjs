/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only configuration
  experimental: {
    // Disable static optimization for API-only mode
    outputFileTracingIncludes: {
      '/api/**/*': ['./src/backend/**/*'],
    },
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;