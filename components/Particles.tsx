"use client";

import { useEffect, useRef } from "react";

interface ParticlesProps {
    className?: string;
    quantity?: number;
    staticity?: number;
    ease?: number;
}

export default function Particles({ className = "", quantity = 35, staticity = 50, ease = 50 }: ParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);
        let animId: number;

        // Cosmos Star colors
        const petalColors = [
            { r: 255, g: 255, b: 255 },  // white
            { r: 224, g: 231, b: 255 },  // indigo-100
            { r: 233, g: 213, b: 255 },  // purple-100
            { r: 196, g: 181, b: 253 },  // violet-300
        ];

        interface Petal {
            x: number;
            y: number;
            size: number;
            speedY: number;
            speedX: number;
            rotation: number;
            rotationSpeed: number;
            opacity: number;
            color: { r: number; g: number; b: number };
            swing: number;
            swingSpeed: number;
        }

        const petals: Petal[] = [];

        for (let i = 0; i < quantity; i++) {
            petals.push({
                x: Math.random() * w,
                y: Math.random() * h - h * 0.1,
                size: Math.random() * 6 + 3,
                speedY: Math.random() * 0.8 + 0.3,
                speedX: Math.random() * 0.3 - 0.15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                opacity: Math.random() * 0.4 + 0.15,
                color: petalColors[Math.floor(Math.random() * petalColors.length)],
                swing: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.01 + 0.005,
            });
        }

        function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;

            // Draw a petal shape (ellipse)
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
            ctx.fill();

            // Inner highlight
            ctx.beginPath();
            ctx.ellipse(-p.size * 0.1, -p.size * 0.2, p.size * 0.2, p.size * 0.4, 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.4})`;
            ctx.fill();

            ctx.restore();
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, w, h);

            petals.forEach(p => {
                // Swaying motion
                p.swing += p.swingSpeed;
                p.x += p.speedX + Math.sin(p.swing) * 0.5;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;

                // Reset when off screen
                if (p.y > h + 20) {
                    p.y = -20;
                    p.x = Math.random() * w;
                }
                if (p.x < -20) p.x = w + 20;
                if (p.x > w + 20) p.x = -20;

                drawPetal(ctx, p);
            });

            animId = requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animId);
        };
    }, [quantity]);

    return <canvas ref={canvasRef} className={`absolute inset-0 z-0 pointer-events-none ${className}`} />;
}
