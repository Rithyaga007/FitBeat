import { motion } from "framer-motion";

export function HoloBody({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
      >
        <defs>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Abstract Human Silhouette */}
        <motion.path
          d="M100 20 C110 20 120 30 120 45 C120 60 110 70 100 70 C90 70 80 60 80 45 C80 30 90 20 100 20 Z 
             M100 80 C130 80 150 90 160 110 L170 200 L150 200 L140 130 C140 130 135 150 130 200 L130 300 L115 500 L95 500 L100 300 L100 200 C95 150 90 130 90 130 L80 200 L60 200 L70 110 C80 90 100 80 100 80 Z"
          stroke="url(#neonGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Internal Systems Lines */}
        <motion.path
          d="M100 85 L100 280 M90 120 L110 120 M85 140 L115 140 M85 160 L115 160"
          stroke="#06B6D4"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 1 }}
        />

        {/* Brain Node */}
        <circle cx="100" cy="45" r="4" fill="#7C3AED" filter="url(#glow)" />
        {/* Heart Node */}
        <circle cx="105" cy="115" r="5" fill="#06B6D4" filter="url(#glow)" />
        {/* Core Node */}
        <circle cx="100" cy="180" r="4" fill="#7C3AED" filter="url(#glow)" />
      </svg>

      {/* Pulse Rings */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 border-2 border-cyan-400 rounded-[100%] opacity-0"
        style={{ boxShadow: "0 0 10px rgba(6,182,212,0.5) inset" }}
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
