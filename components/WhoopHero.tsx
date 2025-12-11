"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function WhoopHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        const particles: Particle[] = [];
        // Scale particle count with height to maintain density
        // Base 50 for 1000px height
        const particleCount = Math.min(100, Math.floor(50 * (height / 1000)));

        class Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;
            fadeSpeed: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height; // Start anywhere
                this.size = Math.random() * 2.0 + 0.8; // Larger: 0.8 to 2.8
                this.speedY = Math.random() * 0.4 + 0.1; // Maintain ambient speed
                this.opacity = Math.random() * 0.5 + 0.2; // Brighter: 0.2 to 0.7
                this.fadeSpeed = Math.random() * 0.002 + 0.0005; // Slower fade for longer life
            }

            update() {
                this.y += this.speedY;
                this.opacity -= this.fadeSpeed;

                // Reset when invisible or off screen
                if (this.opacity <= 0 || this.y > height + 20) {
                    this.y = -20;
                    this.x = Math.random() * width;
                    this.opacity = Math.random() * 0.6 + 0.3; // Reset to visible
                    this.speedY = Math.random() * 0.4 + 0.1;
                    this.fadeSpeed = Math.random() * 0.002 + 0.0005;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = `rgba(0, 240, 160, ${this.opacity})`; // Whoop Green
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Init particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.update();
                p.draw();
            });

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

    // Absolute positioning covering the full scrollable area of the parent
    return (
        <div ref={containerRef} className="absolute inset-0 w-full min-h-full pointer-events-none overflow-hidden z-0 bg-[var(--bg)]">
            {/* Top Green Glow - "Horizon" effect */}
            <div
                className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[100vw] h-[70vh] opacity-30 blur-[100px]"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(0,240,160,0.4) 0%, rgba(0,240,160,0.05) 50%, transparent 80%)"
                }}
            />

            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Vignette to darken edges/bottom - Dark Mode Only */}
            <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,#000000_100%)] opacity-80" />
        </div>
    );
}
