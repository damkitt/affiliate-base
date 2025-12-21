import { ImageResponse } from 'next/og';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const runtime = 'nodejs';

export const alt = 'Affiliate Base - The Foundation for Affiliate Growth';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // 0. Fetch fonts
    const interBold = await fetch(new URL('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', import.meta.url)).then(res => res.arrayBuffer());
    const interRegular = await fetch(new URL('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', import.meta.url)).then(res => res.arrayBuffer());

    // 1. Prepare Logo (Process via Sharp for crispness)
    const logoPath = path.join(process.cwd(), 'public', 'default-logo.png');
    const rawLogo = await fs.readFile(logoPath);

    // Large logo for the top: 240px (3x for 80px display)
    const processedLogoBuffer = await sharp(rawLogo)
        .resize({ width: 240, height: 240, fit: 'contain' })
        .png({ quality: 100 })
        .toBuffer();

    const logoSrc = `data:image/png;base64,${processedLogoBuffer.toString('base64')}`;

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
                    fontFamily: '"Inter"',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Layer 0: Blueprint Grid Texture */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Layer 1: Abstract Glowing Structure (Background) */}
                <div style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    top: '40%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '800px',
                    height: '800px',
                }}>
                    <div style={{
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                        display: 'flex',
                    }} />
                </div>

                {/* Layer 2: Main Content */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    zIndex: 10,
                }}>

                    {/* Visual Logo + Wordmark */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '48px',
                    }}>
                        {/* Circular Logo Container */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '60px',
                            background: '#000000',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                            padding: '10px',
                            boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)',
                        }}>
                            {/* lint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoSrc}
                                alt="Affiliate Base"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>

                        {/* Split Logo Text */}
                        <div style={{
                            display: 'flex',
                            fontSize: '28px',
                            fontWeight: 700,
                            letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                        }}>
                            <span style={{ color: '#a1a1aa' }}>AFFILIATE</span>
                            <span style={{ color: '#10b981', marginLeft: '10px' }}>BASE.CO</span>
                        </div>
                    </div>

                    {/* Main Headline */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: '72px',
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '-0.04em',
                        maxWidth: '1000px',
                        lineHeight: '1.2',
                        marginBottom: '20px',
                    }}>
                        <span>The Foundation for</span>
                        <span>Creator Revenue</span>
                    </div>

                    {/* Subtitle */}
                    <div style={{
                        display: 'flex',
                        fontSize: '32px',
                        color: '#a1a1aa',
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                    }}>
                        Monetize your influence with trusted brands.
                    </div>
                </div>

                {/* Bottom subtle glow */}
                <div style={{
                    position: 'absolute',
                    bottom: '-100px',
                    width: '1000px',
                    height: '200px',
                    background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.04) 0%, transparent 70%)',
                    display: 'flex',
                }} />
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'Inter',
                    data: interBold,
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: 'Inter',
                    data: interRegular,
                    style: 'normal',
                    weight: 400,
                },
            ],
        }
    );
}
