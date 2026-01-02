import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const revalidate = 3600; // Cache for 1 hour to prevent RAM/CPU spikes

export const alt = "Program Detail";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

let fontsCache: { bold: ArrayBuffer; medium: ArrayBuffer } | null = null;
let brandLogoCache: string | null = null;

async function getFonts() {
  if (fontsCache) return fontsCache;

  const [bold, medium] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf"
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf"
    ).then((r) => r.arrayBuffer()),
  ]);

  fontsCache = { bold, medium };
  return fontsCache;
}

async function getBrandLogo() {
  if (brandLogoCache) return brandLogoCache;

  const buffer = await fs.readFile(
    path.join(process.cwd(), "public", "default-logo.png")
  );
  brandLogoCache = `data:image/png;base64,${buffer.toString("base64")}`;
  return brandLogoCache;
}

export default async function Image(props: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await props.params;

    const program = await prisma.program.findFirst({
      where: { slug, approvalStatus: true },
      select: {
        programName: true,
        logoUrl: true,
        commissionRate: true,
        // @ts-ignore
        commissionType: true,
        commissionDuration: true,
        tagline: true,
      },
    });

    if (!program) {
      return new ImageResponse(
        (
          <div
            style={{
              background: "black",
              width: "100%",
              height: "100%",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Program Not Found
          </div>
        ),
        { ...size }
      );
    }

    let logoSrc = null;
    if (program.logoUrl) {
      try {
        let fetchUrl = program.logoUrl;

        // Handle relative URLs (e.g., /uploads/...)
        if (fetchUrl.startsWith("/")) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://affiliatebase.co";
          fetchUrl = `${baseUrl}${fetchUrl}`;
        }

        const logoRes = await fetch(fetchUrl);
        if (logoRes.ok) {
          const buffer = Buffer.from(await logoRes.arrayBuffer());
          const optimizedBuffer = await sharp(buffer)
            .resize({ width: 320, height: 320, fit: "cover" })
            .png()
            .toBuffer();
          logoSrc = `data:image/png;base64,${optimizedBuffer.toString(
            "base64"
          )}`;
        }
      } catch (e) {
        console.error("[OG] Logo error:", e);
      }
    }

    const fonts = await getFonts();

    return new ImageResponse(
      (
        <div
          style={{
            background: "#000000",
            width: "1200px",
            height: "630px",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            fontFamily: '"Inter"',
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "#050505",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              backgroundImage:
                "linear-gradient(rgba(16, 185, 129, 0.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1.5px, transparent 1.5px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div
            style={{
              position: "absolute",
              display: "flex",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "1200px",
              height: "1200px",
            }}
          >
            <div
              style={{
                width: "800px",
                height: "800px",
                background:
                  "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
                display: "flex",
              }}
            />
          </div>

          { }
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 24px",
                borderRadius: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                <div style={{ color: "#ffffff", display: "flex" }}>
                  AFFILIATE
                </div>
                <div
                  style={{
                    color: "#10b981",
                    marginLeft: "0.4em",
                    display: "flex",
                  }}
                >
                  BASE
                </div>
              </div>
            </div>
          </div>

          { }
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
              padding: "120px 80px 80px 80px",
              alignItems: "center",
              gap: "60px",
            }}
          >
            { }
            <div
              style={{
                width: "360px",
                height: "360px",
                borderRadius: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  style={{
                    width: "360px",
                    height: "360px",
                    objectFit: "cover",
                    borderRadius: "40px",
                  }}
                  alt={program.programName}
                />
              ) : (
                <div
                  style={{
                    fontSize: "140px",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.2)",
                    display: "flex",
                  }}
                >
                  {program.programName.charAt(0)}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: "360px",
                justifyContent: "flex-start",
                gap: "48px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div
                  style={{
                    fontSize: "80px",
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingBottom: "0px",
                  }}
                >
                  {program.programName}
                </div>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 500,
                    color: "#a1a1aa",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {program.tagline || "Verified Affiliate Program"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
                <div
                  style={{
                    fontSize: "100px",
                    fontWeight: 900,
                    color: "#34d399",
                    display: "flex",
                    lineHeight: 1,
                  }}
                >
                  {/* @ts-ignore */}
                  {program.commissionType === "FIXED"
                    ? `$${(program.commissionRate ?? 0).toLocaleString()}`
                    : `${(program.commissionRate ?? 0).toLocaleString()}%`}
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 600,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    opacity: 0.8,
                    display: "flex",
                    lineHeight: 1,
                    marginBottom: "12px",
                  }}
                >
                  {/* @ts-ignore */}
                  {program.commissionType === "FIXED"
                    ? "PER SALE"
                    : program.commissionDuration === "Recurring"
                      ? "RECURRING"
                      : "COMMISSION"}
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
            name: "Inter",
            data: fonts.bold,
            style: "normal",
            weight: 700,
          },
          {
            name: "Inter",
            data: fonts.medium,
            style: "normal",
            weight: 500,
          },
        ],
      }
    );
  } catch (e: any) {
    console.error("[OG] Fatal Error:", e);
    return new ImageResponse(
      (
        <div
          style={{
            background: "white",
            width: "100%",
            height: "100%",
            color: "black",
            padding: 40,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold", display: "flex" }}>
            Error generating image
          </div>
          <div style={{ fontSize: 24, marginTop: 20, display: "flex" }}>
            {e.message}
          </div>
        </div>
      ),
      { ...size }
    );
  }
}
