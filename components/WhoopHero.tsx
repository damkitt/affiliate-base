"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function WhoopHero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Self-manage the clean up of the global spotlight
    useEffect(() => {
        document.body.classList.add("no-spotlight");
        return () => {
            document.body.classList.remove("no-spotlight");
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        // Use window inner dimensions for fixed background
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const particles: Particle[] = [];
        const particleCount = 50; // Reduced for performance

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

                // Reset when invisible or off screen (allow falling deeper)
                if (this.opacity <= 0 || this.y > height + 100) {
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
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Use absolute positioning so it stays at the top of the page (not fixed to viewport)
    return (
        <div className="absolute top-0 left-0 w-full h-[100vh] pointer-events-none overflow-hidden z-0 bg-[var(--bg)] transition-colors duration-300">
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
