/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { BalloonItem } from '../types';

interface BalloonEffectProps {
  key?: React.Key;
  intensity?: number;
  durationLeft: number;
}

const BALLOON_PALETTES = [
  // Deep Crimson
  { from: '#f43f5e', to: '#be123c', glow: 'rgba(244,63,94,0.35)', text: '#9f1239' },
  // Executive Royal Navy
  { from: '#3b82f6', to: '#1d4ed8', glow: 'rgba(59,130,246,0.35)', text: '#1e40af' },
  // Forest/Sage Emerald
  { from: '#10b981', to: '#047857', glow: 'rgba(16,185,129,0.35)', text: '#065f46' },
  // Premium Marigold Gold
  { from: '#f59e0b', to: '#b45309', glow: 'rgba(245,158,11,0.35)', text: '#92400e' },
  // Luxurious Royal Violet
  { from: '#8b5cf6', to: '#6d28d9', glow: 'rgba(139,92,246,0.35)', text: '#5b21b6' },
  // Coral Salmon
  { from: '#ff7a59', to: '#d14324', glow: 'rgba(255,122,89,0.35)', text: '#992e16' },
  // Muted Platinum Silver
  { from: '#cbd5e1', to: '#475569', glow: 'rgba(148,163,184,0.25)', text: '#334155' }
];

export default function BalloonEffect({ intensity = 1, durationLeft }: BalloonEffectProps) {
  const balloons = useMemo(() => {
    const items: BalloonItem[] = [];
    const count = Math.floor(120 * intensity); // 120 balloons for twice the density

    for (let i = 0; i < count; i++) {
      const left = Math.random() * 88 + 6; // range 6% to 94% to prevent edge clipping
      const size = Math.random() * 12 + 32; // 32px to 44px (perfect medium size)
      const aspectRatio = 1.35 + (Math.random() * 0.1); // classic egg-ovoid ratio
      const speed = Math.random() * 2.5 + 2.4; // float duration 2.4s to 4.9s
      const sway = Math.random() * 40 + 15; // horizontal wander amplitude
      const blur = Math.random() > 0.8; // subtle depth-of-field blur on 20% of balloons
      const color = BALLOON_PALETTES[i % BALLOON_PALETTES.length];
      const delay = Math.random() * 1.5; // smooth staggered entry inside the first 1.5s
      const opacity = Math.random() * 0.12 + 0.85; // highly opaque but with glassmorphic gloss

      items.push({
        id: `balloon-${i}`,
        left,
        size,
        aspectRatio,
        speed,
        sway,
        blur,
        color,
        delay,
        opacity,
      });
    }
    return items;
  }, [intensity]);

  // Handle global fade out as countdown nears completion
  const isEnding = durationLeft < 0.6;
  const containerOpacity = isEnding ? Math.max(0, durationLeft / 0.6) : 1;

  return (
    <motion.div
      id="balloon-canvas-container"
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      style={{ opacity: containerOpacity }}
      animate={{ opacity: containerOpacity }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {balloons.map((balloon) => {
        const height = balloon.size * balloon.aspectRatio;

        return (
          <motion.div
            key={balloon.id}
            id={`balloon-particle-${balloon.id}`}
            className="absolute bottom-0 select-none"
            style={{
              left: `${balloon.left}%`,
              width: balloon.size,
              height: height + 60, // accommodate the string height
              filter: balloon.blur ? 'blur(1.5px)' : 'none',
              zIndex: balloon.blur ? 30 : 41,
            }}
            initial={{
              y: '105vh',
              x: 0,
              opacity: 0,
            }}
            animate={{
              y: `-${height + 150}px`, // float entirely past the Top screen
              x: [0, balloon.sway, 0, -balloon.sway, 0],
              opacity: [0, balloon.opacity, balloon.opacity, 0],
            }}
            transition={{
              y: {
                duration: balloon.speed,
                ease: 'linear',
                delay: balloon.delay,
              },
              x: {
                duration: balloon.speed * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: balloon.delay,
              },
              opacity: {
                times: [0, 0.12, 0.88, 1],
                duration: balloon.speed,
                ease: 'linear',
                delay: balloon.delay,
              },
            }}
          >
            {/* Balloon Body */}
            <div
              className="relative rounded-t-[50%_45%] rounded-b-[50%_55%] transition-transform"
              style={{
                width: balloon.size,
                height: height,
                background: `linear-gradient(135deg, ${balloon.color.from}, ${balloon.color.to})`,
                boxShadow: `inset 4px 6px 12px rgba(255,255,255,0.25), inset -4px -6px 12px rgba(0,0,0,0.35), 0 10px 25px -4px ${balloon.color.glow}`,
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Gloss highlight */}
              <div
                className="absolute top-[12%] left-[12%] rounded-full bg-white/30 filter blur-[0.6px]"
                style={{
                  width: balloon.size * 0.22,
                  height: balloon.size * 0.22,
                }}
              />

              {/* Knot */}
              <div
                className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent"
                style={{
                  borderBottom: `6px solid ${balloon.color.to}`,
                }}
              />
            </div>

            {/* Realistic organic wavy string */}
            <svg
              className="absolute pointer-events-none origin-top"
              style={{
                top: `${height - 1}px`, // align just with the knot bottom
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              width="14"
              height="60"
              viewBox="0 0 14 60"
              fill="none"
            >
              <path
                d="M 7 0 Q 3 15, 7 30 T 7 60"
                stroke={balloon.color.text}
                strokeWidth="1.2"
                strokeOpacity="0.45"
                fill="none"
              />
            </svg>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
