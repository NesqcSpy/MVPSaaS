import { ImageResponse } from 'next/og';

export const alt = 'DataClean — Operational Data Automation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Twitter / X uses the same dimensions as Open Graph.
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background:
            'radial-gradient(1200px 600px at 50% -200px, rgba(59,130,246,0.35), transparent 60%), radial-gradient(800px 400px at 100% 0, rgba(139,92,246,0.25), transparent 60%), #0B1020',
          color: '#F8FAFC',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F8FAFC',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>DataClean</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            From documents to{' '}
            <span
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              structured operations.
            </span>
          </div>
          <div style={{ fontSize: 26, color: '#CBD5E1', maxWidth: 900 }}>
            Operational data automation, deployable in a day.
          </div>
        </div>

        <div style={{ fontSize: 18, color: '#94A3B8' }}>dataclean.io</div>
      </div>
    ),
    { ...size },
  );
}
