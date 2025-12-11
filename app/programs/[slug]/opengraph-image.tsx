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
    console.log('[OG] Starting generation...');
    try {
        const params = await props.params;
        const { slug } = params;
        console.log(`[OG] Slug: ${slug}`);

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
            console.log('[OG] Program not found');
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
                console.log(`[OG] Fetching logo: ${program.logoUrl}`);
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
                    console.log('[OG] Logo optimized & converted to PNG');
                } else {
                    console.warn(`[OG] Logo fetch failed status: ${logoRes.status}`);
                }
            } catch (e) {
                console.error('[OG] Logo processing error:', e);
            }
        }

        // 3. Render
        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#0a0a0a',
                        backgroundImage: 'linear-gradient(to bottom right, #0a0a0a, #111, #0a0a0a)',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '80px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Background Glows */}
                    <div style={{
                        position: 'absolute',
                        top: '-200px',
                        left: '-200px',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.1)',
                    }} />

                    {/* Left Side: Logo */}
                    <div style={{ display: 'flex', zIndex: 10 }}>
                        {logoSrc ? (
                            // lint-disable-next-line @next/next/no-img-element
                            <img
                                src={logoSrc}
                                alt={program.programName}
                                style={{
                                    width: '320px',
                                    height: '320px',
                                    borderRadius: '60px',
                                    objectFit: 'cover',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '320px',
                                    height: '320px',
                                    borderRadius: '60px',
                                    background: '#18181b',
                                    color: '#52525b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '120px',
                                    fontWeight: 900,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                    border: '1px solid #27272a',
                                }}
                            >
                                {program.programName?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Details */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            maxWidth: '650px',
                            zIndex: 10,
                            marginLeft: '60px',
                            flex: 1,
                        }}
                    >
                        {/* Commission Badge */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '32px',
                                fontWeight: 700,
                                color: '#34d399', // Emerald-400
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                padding: '12px 28px',
                                borderRadius: '100px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                marginBottom: '32px',
                            }}
                        >
                            {program.commissionRate}% {program.commissionDuration === 'Recurring' ? 'Recurring' : 'Commission'}
                        </div>

                        {/* Title */}
                        <div
                            style={{
                                fontSize: '90px',
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: '1.05',
                                marginBottom: '24px',
                                display: 'flex',
                                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                            }}
                        >
                            {program.programName}
                        </div>

                        {/* Footer Brand */}
                        <div style={{
                            marginTop: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                background: '#10b981',
                                borderRadius: '6px'
                            }} />
                            <div style={{
                                color: '#a1a1aa',
                                fontSize: '28px',
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                            }}>
                                Affiliate Base
                            </div>
                        </div>
                    </div>
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
