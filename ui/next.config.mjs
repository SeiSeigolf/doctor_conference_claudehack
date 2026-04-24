const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/synthesize": ["./data/**/*"],
      "/case/[id]": ["./data/**/*"],
    },
  },
};

export default nextConfig;
