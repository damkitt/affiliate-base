import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

// Force Node.js runtime for stability and sharp support
export const runtime = 'nodejs';

export const alt = 'Program Detail';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image(props: { params: Promise<{ slug: string }> }) {
    try {
        const params = await props.params;
        const { slug } = params;

        // 1. Fetch Data directly from DB
        const program = await prisma.program.findFirst({
            where: { slug, approvalStatus: true },
            select: {
                programName: true,
                logoUrl: true,
                commissionRate: true,
                commissionDuration: true,
            },
        });

        if (!program) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            background: '#09090b',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        <div style={{ fontSize: 60, fontWeight: 900, marginBottom: 20 }}>
                            Affiliate Base
                        </div>
                        <div style={{ fontSize: 30, color: '#71717a' }}>
                            Program not found
                        </div>
                    </div>
                ),
                { ...size }
            );
        }

        // 2. Prepare Logo (Safe Fetch + Convert to PNG via Sharp)
        let logoSrc = null;
        if (program.logoUrl) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout

                const logoRes = await fetch(program.logoUrl, {
                    signal: controller.signal,
                    headers: { 'User-Agent': 'AffiliateBase-OG-Bot/1.0' }
                });
                clearTimeout(timeoutId);

                if (logoRes.ok) {
                    const arrayBuffer = await logoRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    // Use Sharp to convert (WebP/Any) -> PNG and Resize
                    // This prevents Satori crashes and optimizes size
                    const optimizedBuffer = await sharp(buffer)
                        .resize({
                            width: 320,
                            height: 320,
                            fit: 'cover',
                            background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
                        })
                        .png()
                        .toBuffer();

                    const base64 = optimizedBuffer.toString('base64');
                    logoSrc = `data:image/png;base64,${base64}`;
                }
            } catch (e) {
                // Silent catch for OG image generation to prevent crash
            }
        }

        // 3. Render
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
                    {/* Background Gradients (Combined) */}
                    <div style={{ position: 'absolute', top: '-300px', left: '-100px', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(0,0,0,0) 70%)' }} />
                    <div style={{ position: 'absolute', bottom: '-300px', right: '-100px', width: '1000px', height: '1000px', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, rgba(0,0,0,0) 70%)' }} />

                    {/* Main Content Container */}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '1000px', height: '420px', zIndex: 10 }}>
                        {/* Left: Program Logo */}
                        <div style={{
                            display: 'flex',
                            width: '400px',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '320px',
                                height: '320px',
                                borderRadius: '64px',
                                padding: '10px',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            }}>
                                {logoSrc ? (
                                    // lint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={logoSrc}
                                        alt={program.programName}
                                        style={{
                                            width: '300px',
                                            height: '300px',
                                            borderRadius: '54px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: '300px',
                                            height: '300px',
                                            borderRadius: '54px',
                                            background: '#18181b',
                                            color: '#52525b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '120px',
                                            fontWeight: 900,
                                        }}
                                    >
                                        {program.programName?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            flex: 1,
                            paddingLeft: '40px',
                        }}>
                            {/* Commission Pill */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 24px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '100px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                marginBottom: '24px',
                            }}>
                                <span style={{ color: '#34d399', fontSize: '28px', fontWeight: 700, marginRight: '8px' }}>
                                    {program.commissionRate}%
                                </span>
                                <span style={{ color: '#a1a1aa', fontSize: '24px', fontWeight: 500 }}>
                                    {program.commissionDuration === 'Recurring' ? 'Recurring' : 'Commission'}
                                </span>
                            </div>

                            {/* Program Name */}
                            <div style={{
                                fontSize: '80px',
                                fontWeight: 800,
                                color: 'white',
                                lineHeight: '1.1',
                                marginBottom: '40px',
                                textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                letterSpacing: '-0.02em',
                                display: 'flex',
                                flexWrap: 'wrap',
                            }}>
                                {program.programName}
                            </div>

                            {/* Trust Badge (Simulated) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    color: 'black',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                }}>✓</div>
                                <span style={{ color: '#71717a', fontSize: '20px', fontWeight: 500 }}>Verified Program</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Branding Layer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '50px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '0.25em',
                        fontSize: '24px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                    }}>
                        <span style={{ color: '#a1a1aa', marginRight: '12px' }}>AFFILIATE</span>
                        <span style={{ color: '#10b981' }}>BASE</span>
                    </div>

                    {/* Top Right Decorative Element */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        right: '40px',
                        width: '80px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #10b981, transparent)',
                        borderRadius: '2px',
                    }} />
                </div>
            ),
            { ...size }
        );

    } catch (e: any) {
        console.error('[OG] Fatal Error:', e);
        return new ImageResponse(
            (
                <div style={{ background: 'white', width: '100%', height: '100%', color: 'black', fontSize: 32 }}>
                    Error: {e.message}
                </div>
            ),
            { ...size }
        );
    }
}
