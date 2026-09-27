/** @type {import('next').NextConfig} */
const nextConfig = {
  // Baseline security headers applied to every route. A Content-Security-Policy is
  // intentionally omitted for now — a strict CSP must be tuned per-feature or it
  // breaks pages; see "16 - Security" in the team docs for the plan to add one.
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // When you render Supabase Storage images via next/image, allow the host here:
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "<your-project-ref>.supabase.co" },
  //   ],
  // },
};

export default nextConfig;
