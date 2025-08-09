/** @type {import('next').NextConfig} */
const nextConfig = {
  // Headers de seguridad para cámara (solo Permissions-Policy)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, geolocation=*'
          }
        ],
      },
    ]
  },
};

export default nextConfig;
