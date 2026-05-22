import { ImageResponse } from 'next/og';

// Default OG card — picked up automatically for the root route.
export const alt = 'DataClean — Operational Data Automation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
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
        {/* Top — lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
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
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>
            DataClean
          </div>
        </div>

        {/* Middle — headline */}
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
            Structured data.{' '}
            <span
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Automated operations.
            </span>
          </div>
          <div style={{ fontSize: 26, color: '#CBD5E1', maxWidth: 900 }}>
            One pipeline — ingest, OCR, extract, validate, route — with full observability.
          </div>
        </div>

        {/* Bottom — stat strip */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            ['10k+', 'docs / hr per worker'],
            ['p50 < 200ms', 'extraction latency'],
            ['99.2%', 'extraction accuracy'],
            ['Self-host', 'Postgres + Redis'],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '14px 18px',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: 12,
                background: 'rgba(30,41,59,0.45)',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 600, color: '#F8FAFC' }}>{k}</div>
              <div style={{ fontSize: 16, color: '#94A3B8' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
