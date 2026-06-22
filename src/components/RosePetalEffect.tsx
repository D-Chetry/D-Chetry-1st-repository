/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { RosePetalItem } from '../types';

interface RosePetalEffectProps {
  key?: React.Key;
  intensity?: number; // scale factor for density
  durationLeft: number; // to control fade-out near completion
}

export default function RosePetalEffect({ intensity = 1, durationLeft }: RosePetalEffectProps) {
  // Generate a stable list of rose petals when mounted
  const petals = useMemo(() => {
    const items: RosePetalItem[] = [];
    const count = Math.floor(120 * intensity); // Generates approx 120 petals for lush coverage
    
    // Different rose tones for rich variation
    const gradientClasses = [
      'from-[#FF2E93] via-[#E11D48] to-[#880F2F]', // Classic rich crimson red
      'from-[#FF4D80] via-[#F43F5E] to-[#9F1239]', // Vibrant ruby red
      'from-[#FDA4AF] via-[#F43F5E] to-[#BE123C]', // Pinkish accent rose
      'from-[#F43F5E] via-[#BE123C] to-[#4C0519]', // Deep velvet bordeaux
    ];

    for (let i = 0; i < count; i++) {
      const size = Math.random() * 12 + 18; // 18px to 30px
      const left = Math.random() * 100;
      const speed = Math.random() * 3.0 + 3.5; // Sweet slow-motion fall speed (3.5s to 6.5s)
      const sway = Math.random() * 55 + 25; // 25px to 80px horizontal drifting swing
      const swaySpeed = Math.random() * 2.0 + 1.8; // Sway timing
      const opacity = Math.random() * 0.3 + 0.7; // 0.7 to 1.0 opacity
      const delay = Math.random() * 2.2; // Stagger release to look like realistic cascading downpour
      const rotationStart = Math.random() * 360;
      const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 240 + 120); // tumbling spin degree

      items.push({
        id: `rosepetal-${i}`,
        left,
        size,
        speed,
        sway,
        swaySpeed,
        opacity,
        delay,
        rotationStart,
        rotationSpeed,
      });
    }
    return items;
  }, [intensity]);

  // Handle global fade-out when the simulation is finishing
  const isEnding = durationLeft < 0.6;
  const containerOpacity = isEnding ? Math.max(0, durationLeft / 0.6) : 1;

  // Let's alternate the petal curve/skew directions for maximum realism
  const getPetalShape = (idNumber: number) => {
    // Alternates between asymmetric curved biological petal structures
    if (idNumber % 2 === 0) {
      return "rounded-tl-[85%] rounded-br-[85%] rounded-tr-[25%] rounded-bl-[25%]";
    } else {
      return "rounded-tr-[85%] rounded-bl-[85%] rounded-tl-[25%] rounded-br-[25%]";
    }
  };

  return (
    <motion.div
      id="rosepetal-canvas-container"
      className="fixed inset-0 pointer-events-none z-45 overflow-hidden"
      style={{ opacity: containerOpacity }}
      animate={{ opacity: containerOpacity }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {petals.map((petal, idx) => {
        const shapeClass = getPetalShape(idx);
        // Distribute gradient class selection based on idx to stay deterministic
        const gradientClass = [
          'from-[#FF2E93] via-[#E11D48] to-[#880F2F]',
          'from-[#FF4D80] via-[#F43F5E] to-[#9F1239]',
          'from-[#FDA4AF] via-[#F43F5E] to-[#BE123C]',
          'from-[#F43F5E] via-[#BE123C] to-[#4C0519]',
        ][idx % 4];

        return (
          <motion.div
            key={petal.id}
            id={`rosepetal-particle-${petal.id}`}
            className="absolute top-0 select-none pointer-events-none"
            style={{
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size,
            }}
            initial={{
              y: '-12vh',
              x: 0,
              opacity: 0,
              rotate: petal.rotationStart,
              scale: 0.6 + Math.random() * 0.5,
            }}
            animate={{
              y: '108vh',
              x: [0, -petal.sway, 0, petal.sway, 0],
              opacity: [0, petal.opacity, petal.opacity, 0],
              rotate: [petal.rotationStart, petal.rotationStart + petal.rotationSpeed],
              scale: [1, 1.1, 1],
            }}
            transition={{
              y: {
                duration: petal.speed,
                ease: 'linear',
                delay: petal.delay,
              },
              x: {
                duration: petal.swaySpeed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: petal.delay,
              },
              opacity: {
                times: [0, 0.15, 0.85, 1],
                duration: petal.speed,
                ease: 'linear',
                delay: petal.delay,
              },
              rotate: {
                duration: petal.speed,
                ease: 'linear',
                delay: petal.delay,
              },
              scale: {
                duration: petal.swaySpeed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: petal.delay,
              }
            }}
          >
            {/* Organic, velvety soft-shadowed rose petal element */}
            <div 
              className={`w-full h-full bg-gradient-to-br ${gradientClass} ${shapeClass} shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(159,18,57,0.15)]`}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
