import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// Force Node.js runtime for stability and sharp support
export const runtime = 'nodejs';
export const revalidate = 0;

export const alt = 'Program Detail';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image(props: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await props.params;

        // 1. Fetch Data
        const program = await prisma.program.findFirst({
            where: { slug, approvalStatus: true },
            select: {
                programName: true,
                logoUrl: true,
                commissionRate: true,
                commissionDuration: true,
                tagline: true,
            },
        });

        if (!program) {
            return new ImageResponse(
                (
                    <div style={{ background: 'black', width: '100%', height: '100%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Program Not Found
                    </div>
                ),
                { ...size }
            );
        }

        // 2. Prepare Program Logo via Sharp
        let logoSrc = null;
        if (program.logoUrl) {
            try {
                const logoRes = await fetch(program.logoUrl);
                if (logoRes.ok) {
                    const buffer = Buffer.from(await logoRes.arrayBuffer());
                    const optimizedBuffer = await sharp(buffer)
                        .resize({ width: 320, height: 320, fit: 'cover' })
                        .png()
                        .toBuffer();
                    logoSrc = `data:image/png;base64,${optimizedBuffer.toString('base64')}`;
                }
            } catch (e) {
                console.error('[OG] Logo error:', e);
            }
        }

        // 3. Prepare Brand Logo
        const brandLogoBuffer = await fs.readFile(path.join(process.cwd(), 'public', 'default-logo.png'));
        const brandLogoSrc = `data:image/png;base64,${brandLogoBuffer.toString('base64')}`;

        // 4. Prepare Fonts (Using stable Inter URLs)
        const interBold = await fetch(new URL('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', import.meta.url)).then(res => res.arrayBuffer());
        const interMedium = await fetch(new URL('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', import.meta.url)).then(res => res.arrayBuffer());

        return new ImageResponse(
            (
                <div
                    style={{
                        background: '#000000',
                        width: '1200px',
                        height: '630px',
                        display: 'flex',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: '"Inter"',
                    }}
                >
                    {/* Background Layer: Spotlight */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'radial-gradient(circle at 50% -20%, #202022 0%, #000000 50%)',
                            display: 'flex',
                        }}
                    />

                    {/* Background Layer: Grid (Simplified) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            opacity: 0.04,
                            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* Top Branding Pill (Absolute Centered) */}
                    <div style={{
                        position: 'absolute',
                        top: '60px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px 24px',
                            borderRadius: '100px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                        }}>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                letterSpacing: '0.4em',
                                textTransform: 'uppercase',
                                display: 'flex',
                            }}>
                                <div style={{ color: '#ffffff', display: 'flex' }}>AFFILIATE</div>
                                <div style={{ color: '#10b981', marginLeft: '0.4em', display: 'flex' }}>BASE</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Layout */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        height: '100%',
                        padding: '120px 80px 80px 80px',
                        alignItems: 'center',
                        gap: '60px',
                    }}>
                        {/* The Left Element: The "Jewel Box" Container (FIXED) */}
                        <div style={{
                            width: '360px',
                            height: '360px',
                            borderRadius: '40px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}>
                            {logoSrc ? (
                                <img
                                    src={logoSrc}
                                    style={{
                                        width: '360px',
                                        height: '360px',
                                        objectFit: 'cover',
                                        borderRadius: '40px',
                                    }}
                                    alt={program.programName}
                                />
                            ) : (
                                <div style={{ fontSize: '140px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', display: 'flex' }}>
                                    {program.programName.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* The Right Element: Typography & Hierarchy */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            height: '360px',
                            justifyContent: 'center',
                        }}>
                            {/* Text Content Group */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Program Name */}
                                <div style={{
                                    fontSize: '84px',
                                    fontWeight: 800,
                                    color: 'white',
                                    lineHeight: '1',
                                    display: 'flex',
                                    wordBreak: 'break-word',
                                }}>
                                    {program.programName}
                                </div>

                                {/* Tagline */}
                                <div style={{
                                    fontSize: '34px',
                                    fontWeight: 500,
                                    color: '#a1a1aa',
                                    display: 'flex',
                                    marginTop: '16px',
                                }}>
                                    {program.tagline || 'Verified Affiliate Program'}
                                </div>

                                {/* The Hook (Commission) - Grounded on one line */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'flex-end', // Ground everything
                                    gap: '20px',
                                    marginTop: '48px',
                                }}>
                                    <div style={{
                                        fontSize: '100px',
                                        fontWeight: 900,
                                        color: '#34d399',
                                        display: 'flex',
                                        lineHeight: 1,
                                    }}>
                                        {program.commissionRate}%
                                    </div>
                                    <div style={{
                                        fontSize: '32px',
                                        fontWeight: 600,
                                        color: '#ffffff',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        opacity: 0.8,
                                        display: 'flex',
                                        lineHeight: 1,
                                        marginBottom: '14px', // Tweak to 14px for perfect visual floor
                                    }}>
                                        {program.commissionDuration === 'Recurring' ? 'RECURRING' : 'COMMISSION'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
                        data: interMedium,
                        style: 'normal',
                        weight: 500,
                    },
                ],
            }
        );
    } catch (e: any) {
        console.error('[OG] Fatal Error:', e);
        return new ImageResponse(
            (
                <div style={{ background: 'white', width: '100%', height: '100%', color: 'black', padding: 40, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex' }}>Error generating image</div>
                    <div style={{ fontSize: 24, marginTop: 20, display: 'flex' }}>{e.message}</div>
                </div>
            ),
            { ...size }
        );
    }
}
