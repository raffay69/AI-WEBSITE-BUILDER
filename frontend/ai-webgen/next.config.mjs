/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
          {
            source: '/(.*)', // Apply to /specific-route only
            headers: [
              {
                key: 'Cross-Origin-Embedder-Policy',
                value: 'require-corp',
              },
              {
                key: 'Cross-Origin-Opener-Policy',
                value: 'same-origin',
              },
            ],
          },
        ];
      },
};
export default nextConfig;

