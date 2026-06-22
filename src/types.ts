/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EffectType = 'idle' | 'rosepetals' | 'balloons';

export interface RosePetalItem {
  id: string;
  left: number; // percentage Across screen (0 - 100)
  size: number; // size in pixels
  speed: number; // transition duration in seconds
  sway: number; // horizontal drift amplitude in pixels
  swaySpeed: number; // sway oscillation frequency
  opacity: number;
  delay: number; // initial entry delay in seconds
  rotationStart: number; // random starting angle
  rotationSpeed: number; // spin rate
}

export interface BalloonItem {
  id: string;
  left: number; // percentage Across screen (5 - 95)
  size: number; // width in pixels
  aspectRatio: number; // height-to-width ratio (approx 1.3 - 1.4)
  speed: number; // ascent duration in seconds
  sway: number; // horizontal drift amplitude
  blur: boolean; // subtle depth-of-field effect
  color: {
    from: string; // gradient start
    to: string; // gradient end
    glow: string; // shadow glow color
    text: string; // text tone for details
  };
  delay: number; // initial start delay in seconds
  opacity: number;
}
