import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          color: '#F8FAFC',
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
