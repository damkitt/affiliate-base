import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Affiliate Base';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#050505',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Gradients */}
                <div style={{ position: 'absolute', top: '-200px', left: '-100px', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-200px', right: '-100px', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, rgba(0,0,0,0) 70%)' }} />

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    <div style={{
                        fontSize: '120px',
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '-0.05em',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <span>AFFILIATE</span>
                        <span style={{ color: '#10b981' }}>BASE</span>
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 500,
                        color: '#a1a1aa',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Verified Programs Directory
                    </div>
                </div>

                {/* Decorative border */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    right: '40px',
                    bottom: '40px',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '40px',
                }} />

                {/* Website URL */}
                <div style={{
                    position: 'absolute',
                    bottom: '60px',
                    color: '#71717a',
                    fontSize: '24px',
                    fontWeight: 600,
                    letterSpacing: '0.2em'
                }}>
                    AFFILIATEBASE.CO
                </div>
            </div>
        ),
        { ...size }
    );
}
