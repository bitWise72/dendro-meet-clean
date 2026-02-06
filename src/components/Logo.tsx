import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 32 }) => {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                <defs>
                    <linearGradient id="tree-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="node-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Stylized Tree Trunk / Network Base */}
                <path
                    d="M50 85 V45 M50 65 L35 55 M50 60 L65 50 M50 45 L30 30 M50 45 L70 30"
                    stroke="url(#tree-gradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#glow)"
                />

                {/* Digital Nodes */}
                <circle cx="50" cy="85" r="4" fill="#10b981" />
                <circle cx="35" cy="55" r="5" fill="#34d399" filter="url(#glow)" />
                <circle cx="65" cy="50" r="5" fill="#34d399" filter="url(#glow)" />
                <circle cx="30" cy="30" r="6" fill="url(#node-gradient)" filter="url(#glow)" />
                <circle cx="70" cy="30" r="6" fill="url(#node-gradient)" filter="url(#glow)" />
                <circle cx="50" cy="45" r="4" fill="#10b981" />

                {/* Connective Arcs */}
                <path
                    d="M30 30 Q50 15 70 30"
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    fill="none"
                    opacity="0.6"
                />
            </svg>
        </div>
    );
};

export const LogoWithText: React.FC<LogoProps> = ({ className, size = 28 }) => {
    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <Logo size={size} />
            <span className="font-bold text-xl tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700">
                Dendro-Meet
            </span>
        </div>
    );
};
