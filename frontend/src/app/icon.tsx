import { ImageResponse } from 'next/og';

// Next.js 15 file-based convention — auto-generates /icon and /favicon.ico.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
          borderRadius: 8,
          color: '#F8FAFC',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
