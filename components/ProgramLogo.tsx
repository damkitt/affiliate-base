"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProgramLogoProps {
    src?: string | null;
    name: string;
    size?: "sm" | "md" | "lg";
    className?: string;
    priority?: boolean;
}

export function ProgramLogo({
    src,
    name,
    size = "md",
    className,
    priority = false,
}: ProgramLogoProps) {
    const [error, setError] = useState(false);

    // Generate a consistent gradient based on the program name
    const gradient = useMemo(() => {
        const colors = [
            "from-blue-500 to-indigo-600",
            "from-emerald-500 to-teal-600",
            "from-violet-500 to-purple-600",
            "from-orange-500 to-rose-600",
            "from-pink-500 to-fuchsia-600",
            "from-cyan-500 to-blue-600",
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }, [name]);

    const initials = name.charAt(0).toUpperCase();

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-9 h-9 text-sm",
        lg: "w-10 h-10 text-base",
    };

    if (src && !error) {
        return (
            <div className={cn("relative overflow-hidden bg-white dark:bg-zinc-900 shrink-0 grow-0", sizeClasses[size], className)}>
                <Image
                    src={src}
                    alt={name}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 40px, 64px"
                    className="object-cover"
                    onError={() => setError(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative flex items-center justify-center font-bold text-white overflow-hidden shadow-inner shrink-0 grow-0",
                `bg-gradient-to-br ${gradient}`,
                sizeClasses[size],
                className
            )}
        >
            <span className="relative z-10 drop-shadow-sm">{initials}</span>
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5" />
        </div>
    );
}
