"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function WhoopHero() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Don't render on admin pages to keep them clean
    if (pathname?.startsWith("/admin")) return null;

    // Self-manage the clean up of the global spotlight
    useEffect(() => {
        document.body.classList.add("no-spotlight");
        return () => {
            document.body.classList.remove("no-spotlight");
        };
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = container.clientWidth;
        let height = container.clientHeight;

        canvas.width = width;
        canvas.height = height;

        // Helper class for particles
        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;
            fadeSpeed: number;

            constructor(private w: number, private h: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h; // Start anywhere
                this.size = Math.random() * 2.5 + 1.0; // Medium (1.0px - 3.5px)
                this.speedY = Math.random() * 0.6 + 0.2; // Faster
                this.opacity = Math.random() * 0.6 + 0.3; // Much Brighter
                this.fadeSpeed = Math.random() * 0.002 + 0.0005;
            }

            update(w: number, h: number) {
                this.y += this.speedY;
                this.opacity -= this.fadeSpeed;

                // Reset when invisible or off screen
                if (this.opacity <= 0 || this.y > h + 20) {
                    this.y = -20;
                    this.x = Math.random() * w;
                    this.opacity = Math.random() * 0.6 + 0.3; // Reset to visible
                    this.speedY = Math.random() * 0.4 + 0.1;
                    this.fadeSpeed = Math.random() * 0.002 + 0.0005;
                }
            }

            draw(ctx: CanvasRenderingContext2D, h: number) {
                // Fade out as they go down. Start strong at top.
                // Factor: 1.0 at top, 0.0 at bottom.
                const visibilityFactor = Math.max(0, 1 - (this.y / (h * 0.8)));

                ctx.fillStyle = `rgba(0, 240, 160, ${this.opacity * visibilityFactor})`; // Whoop Green
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const particles: Particle[] = [];
        // Scale particle count with height to maintain density
        // Increased significantly as requested
        const particleCount = Math.min(150, Math.floor(80 * (height / 1000)));

        // Init particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(width, height));
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Set fixed color once if possible, but we have per-particle opacity
            ctx.fillStyle = "#00F0A0"; // Whoop Green set once
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update(width, height);

                const visibilityFactor = Math.max(0, 1 - (p.y / (height * 0.8)));
                ctx.globalAlpha = p.opacity * visibilityFactor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1.0;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            if (!container || !canvas) return;
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", handleResize);
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            resizeObserver.disconnect();
        };
    }, []);

    // Fixed positioning covering the viewport to stay stable during navigation
    return (
        <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[var(--bg)]">
            {/* Top Green Glow - "Horizon" effect */}
            {/* Top Green Glow - "Horizon" effect */}
            <div
                className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[100vw] h-[70vh] opacity-20 dark:opacity-30 blur-[100px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(0,240,160,0.3) 0%, rgba(0,240,160,0.05) 50%, transparent 80%)"
                }}
            />

            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Vignette for depth - Theme aware */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,rgba(0,0,0,0.03)_100%)] dark:bg-[radial-gradient(circle_at_top,transparent_0%,#000000_100%)] dark:opacity-80" />
        </div>
    );
}
