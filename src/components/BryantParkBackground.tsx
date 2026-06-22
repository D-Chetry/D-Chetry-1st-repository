/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
// @ts-ignore
import bryantParkBg from '../assets/images/bryant_park_bg_1782166511779.jpg';

export default function BryantParkBackground() {
  return (
    <div 
      id="bryant-park-canvas" 
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
    >
      {/* High-resolution rendering of Bryant Park */}
      <img
        src={bryantParkBg}
        alt="Bryant Park backdrop"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover select-none pointer-events-none filter brightness-105"
      />
      
      {/* Ambient glass-morphic & vignette overlay for visual focus and superior contrast */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/10 to-black/30" 
      />
      
      {/* Soft color-enriching bottom overlay */}
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-100/10 via-transparent to-transparent" 
      />
    </div>
  );
}
