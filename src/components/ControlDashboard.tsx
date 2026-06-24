/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Clock, 
  Sliders, 
  Cpu, 
  Play, 
  RotateCcw, 
  Gauge, 
  Info,
  ShieldCheck,
  ChevronsUp
} from 'lucide-react';
import RosePetalEffect from './RosePetalEffect';
import BalloonEffect from './BalloonEffect';
import BryantParkBackground from './BryantParkBackground';

const playCrowdCheer = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Create main destination node with master volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.25); // Smooth rise / attack
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.0); // Gentle decay to 5.0s
    masterGain.connect(ctx.destination);

    // --- Noise generator for the collective crowd background sound ---
    const bufferSize = ctx.sampleRate * 5.0; // 5.0 seconds long
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter the noise to sound like human vocal formants (bandpass around 850Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(850, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, ctx.currentTime);

    // Let the filter frequency rise up slightly then fall to mimic cheering energy
    bandpass.frequency.linearRampToValueAtTime(1100, ctx.currentTime + 0.4);
    bandpass.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 4.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(masterGain);

    // --- Individual voice components (adds individual cheering characteristics) ---
    const frequencies = [220, 275, 330, 440, 520, 660];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const oscFilter = ctx.createBiquadFilter();

      // Triangle wave provides soft human-like hum/cheer tone
      osc.type = 'triangle';
      const detune = (Math.random() - 0.5) * 12;
      osc.frequency.setValueAtTime(freq + detune, ctx.currentTime);

      // Modulate frequency to simulate a dynamic cheer contour (rising in pitch, then decaying)
      const attackDelay = 0.1 + Math.random() * 0.15;
      osc.frequency.linearRampToValueAtTime((freq + detune) * 1.15, ctx.currentTime + attackDelay);
      osc.frequency.exponentialRampToValueAtTime((freq + detune) * 0.85, ctx.currentTime + 4.2);

      // Gain envelope for individual voice
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.setValueAtTime(0, ctx.currentTime + attackDelay);
      oscGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + attackDelay + 0.25);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8 + Math.random() * 0.8);

      // Formant-like bandpass filtering
      oscFilter.type = 'bandpass';
      oscFilter.frequency.setValueAtTime(freq * 1.6, ctx.currentTime);
      oscFilter.Q.setValueAtTime(2.2, ctx.currentTime);

      osc.connect(oscFilter);
      oscFilter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 5.0);
    });

    // Start background crowd roar
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 5.0);

    // --- Procedural Crowd Clapping Simulation (for 5 seconds) ---
    // Create a short white noise buffer specifically for claps to save resources
    const clapBufferSize = ctx.sampleRate;
    const clapNoiseBuffer = ctx.createBuffer(1, clapBufferSize, ctx.sampleRate);
    const clapNoiseData = clapNoiseBuffer.getChannelData(0);
    for (let i = 0; i < clapBufferSize; i++) {
      clapNoiseData[i] = Math.random() * 2 - 1;
    }

    // Simulate 8 independent clappers clapping at semi-random intervals
    const clapperCount = 8;
    for (let c = 0; c < clapperCount; c++) {
      let time = ctx.currentTime + Math.random() * 0.4; // Staggered entry
      while (time < ctx.currentTime + 5.0) {
        const clapSource = ctx.createBufferSource();
        clapSource.buffer = clapNoiseBuffer;
        clapSource.loop = true;

        const clapFilter = ctx.createBiquadFilter();
        clapFilter.type = 'bandpass';
        // Randomize frequency slightly per clap to represent different hands/positions
        clapFilter.frequency.setValueAtTime(1100 + Math.random() * 500, time);
        clapFilter.Q.setValueAtTime(2.5, time);

        const clapGain = ctx.createGain();
        clapGain.gain.setValueAtTime(0, time);
        clapGain.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.06, time + 0.003); // Instant attack
        clapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.025 + Math.random() * 0.03); // Quick decay

        clapSource.connect(clapFilter);
        clapFilter.connect(clapGain);
        clapGain.connect(masterGain);

        clapSource.start(time);
        clapSource.stop(time + 0.07);

        // Next clap interval (approx. 3-5 claps per second per person)
        const interval = 0.18 + Math.random() * 0.16;
        time += interval;
      }
    }
  } catch (e) {
    console.warn("Audio Context playback failed or blocked:", e);
  }
};

export default function ControlDashboard() {
  const [activeEffect, setActiveEffect] = useState<'idle' | 'rosepetals' | 'balloons'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [intensity, setIntensity] = useState<number>(1.0);
  const [ambientSwayMultiplier, setAmbientSwayMultiplier] = useState<number>(1.0);
  
  // Real-time auxiliary telemetry
  const [currentTime, setCurrentTime] = useState<string>('');
  const [simulatedFps, setSimulatedFps] = useState<number>(60.0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live formatted timezone digital clock conforming to high-end executive layouts
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Soft random fluctuations to the FPS display to simulate active physics engine telemetry
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      if (activeEffect !== 'idle') {
        setSimulatedFps(parseFloat((58.6 + Math.random() * 1.3).toFixed(1)));
      } else {
        setSimulatedFps(parseFloat((59.8 + Math.random() * 0.2).toFixed(1)));
      }
    }, 600);
    return () => {
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
    };
  }, [activeEffect]);

  // Clean trigger routines to start simulations for exactly 5.0 seconds
  const triggerSimulation = (type: 'rosepetals' | 'balloons') => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setActiveEffect('idle');
    setTimeLeft(5.0);
    
    // Play synthesized crowd cheering sound effect
    playCrowdCheer();
    
    setTimeout(() => {
      setActiveEffect(type);
      
      const updateInterval = 20; 
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - (updateInterval / 1000);
          if (nextVal <= 0.01) {
            if (timerRef.current) clearInterval(timerRef.current);
            setActiveEffect('idle');
            return 0;
          }
          return Math.max(0, nextVal);
        });
      }, updateInterval);
    }, 40);
  };

  const cancelActiveSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveEffect('idle');
    setTimeLeft(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentParticleCount = useMemo(() => {
    if (activeEffect === 'rosepetals') return Math.floor(120 * intensity);
    if (activeEffect === 'balloons') return Math.floor(120 * intensity);
    return 0;
  }, [activeEffect, intensity]);

  const activeProgressPercent = (timeLeft / 5.0) * 100;

  return (
    <div id="main-application-frame" className="min-h-screen text-[#1E293B] flex flex-col font-sans selection:bg-blue-500/25 selection:text-blue-900 relative">
      
      {/* Bryant Park Background Backdrop */}
      <BryantParkBackground />

      {/* Simulation Layers */}
      <AnimatePresence mode="wait">
        {activeEffect === 'rosepetals' && (
          <RosePetalEffect 
            key="rosepetal-effect" 
            intensity={intensity} 
            durationLeft={timeLeft} 
          />
        )}
        {activeEffect === 'balloons' && (
          <BalloonEffect 
            key="balloon-effect" 
            intensity={intensity} 
            durationLeft={timeLeft} 
          />
        )}
      </AnimatePresence>

      {/* Top Banner / Navigation - Strats / Professional Polish styling */}
      <header id="top-nav-bar" className="h-[64px] bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]/80 sticky top-0 z-30 flex items-center shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center shadow-sm border border-blue-400/20">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 id="app-brand" className="font-display font-extrabold text-lg tracking-tight uppercase text-[#1E293B] flex items-center gap-1.5">
                Stratos Systems
              </h1>
            </div>
          </div>

          {/* Right Header Controls / Profile design */}
          <div className="flex items-center space-x-6 text-sm text-slate-500 font-medium">
            <div className="hidden sm:flex items-center space-x-2 border-r border-[#E2E8F0]/80 pr-6">
              <span className={`w-2.5 h-2.5 rounded-full ${activeEffect === 'idle' ? 'bg-slate-300' : 'bg-blue-600 animate-pulse'}`} />
              <span className="text-slate-400 font-bold text-xs tracking-wider uppercase">SIM ENGINE:</span>
              <span className="text-[#1E293B] font-mono text-xs">{activeEffect === 'idle' ? 'STANDBY' : 'RENDERING_ACTIVE'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-md border border-[#E2E8F0]">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-[#1E293B] font-mono font-semibold tabular-nums text-xs">{currentTime || "14:52:51"}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#CBD5E1] border border-white shadow-inner flex items-center justify-center text-[10px] font-bold text-slate-700">ST</div>
          </div>

        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-grow flex max-w-7xl w-full mx-auto relative z-10">
        
        {/* Left Sidebar Menu */}
        <aside id="menu-sidebar" className="hidden lg:flex w-60 bg-white/80 border-r border-[#E2E8F0]/80 backdrop-blur-md py-8 px-6 flex-col justify-between flex-shrink-0">
          <div className="flex flex-col gap-6">
            
            {/* Nav Group 1 */}
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider pl-3 mb-2">Main Menu</div>
              <div className="px-3 py-2.5 rounded-md text-sm font-semibold cursor-pointer text-blue-600 bg-[#EFF6FF]/90 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Simulation Engine</span>
              </div>
              <div className="px-3 py-2.5 rounded-md text-sm font-medium cursor-not-allowed text-slate-400 hover:bg-slate-50/50 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Analytics Desk</span>
              </div>
              <div className="px-3 py-2.5 rounded-md text-sm font-medium cursor-not-allowed text-slate-400 hover:bg-slate-50/50 flex items-center gap-2">
                <span className="text-xs">📂</span>
                <span>Data Integration</span>
              </div>
            </div>

            {/* Nav Group 2 */}
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider pl-3 mb-2">System</div>
              <div className="px-3 py-2.5 rounded-md text-sm font-medium cursor-not-allowed text-slate-400 hover:bg-slate-50/50 flex items-center gap-2">
                <span>📋</span>
                <span>Audit Logs</span>
              </div>
              <div className="px-3 py-2.5 rounded-md text-sm font-medium cursor-not-allowed text-slate-400 hover:bg-slate-50/50 flex items-center gap-2">
                <span>⚙️</span>
                <span>Config</span>
              </div>
            </div>

          </div>

          {/* Quick Engine Telemetry */}
          <div className="bg-white/60 border border-[#E2E8F0] p-4 rounded-xl flex flex-col gap-2">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">ENGINE REFRESH</div>
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-mono font-bold text-[#1E293B] tabular-nums">{simulatedFps}</span>
              <span className="text-[10px] font-mono text-slate-400">FPS</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-1 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(simulatedFps / 60) * 100}%` }} />
            </div>
          </div>
        </aside>

        {/* Content Area Wrap */}
        <main id="main-content-layout" className="flex-1 p-6 md:p-10 flex flex-col gap-8 overflow-y-auto">
          
          {/* Header Section */}
          <div id="content-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]/80">
            <div>
              <h2 className="text-3xl font-display font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Atmospheric Simulations
              </h2>
              <p className="text-base text-emerald-100/90 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] mt-1.5">
                Run environmental physics simulations for structural impact analysis.
              </p>
            </div>

            {/* Simulated Live Alert Pill */}
            <div className="self-start md:self-auto bg-white/90 backdrop-blur-sm border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Matrix Sync Ready</span>
            </div>
          </div>



          {/* Simulation Primary Card */}
          <div className="fixed bottom-4 right-4 z-50 bg-white/92 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl p-3 shadow-lg flex flex-col gap-2.5 max-w-[260px] w-full">
            
            {/* Segment Header */}
            <div className="pb-2 flex justify-between items-center bg-[#156ddf] px-2 py-1.5 rounded-lg text-white">
              <h3 className="font-display font-bold text-xs text-white/95 uppercase tracking-wider">
                Simulation Controls
              </h3>
              <div className="text-[9px] text-blue-100 font-mono font-bold">
                {activeEffect !== 'idle' ? `${timeLeft.toFixed(1)}s` : 'STANDBY'}
              </div>
            </div>

            {/* Custom Grid matching the exact design button layout */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Trigger Rose Petals Button */}
              <button
                id="btn-trigger-rosepetals"
                onClick={() => triggerSimulation('rosepetals')}
                className={`py-2 px-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden group w-full bg-[#1e28ac] text-[#eb1121] ${
                  activeEffect === 'rosepetals'
                    ? 'border-[#eb1121] ring-2 ring-rose-200'
                    : 'border-[#eb1121]/60 hover:border-[#eb1121] cursor-pointer'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-transform duration-500 ${activeEffect === 'rosepetals' ? 'bg-rose-600 text-white rotate-12 scale-105 animate-pulse' : 'bg-[#FFF1F2] text-rose-600 group-hover:scale-105'}`}>
                  🌹
                </div>
                <div className="text-center leading-none">
                  <span className="block font-bold text-xs text-[#ec0e4b]">Rose Petal</span>
                  <span className="text-[8.5px] text-[#eb1121]/80 block mt-1">Petal fall</span>
                  <span className="block font-black text-[9px] text-black tracking-wider mt-1.5 bg-white/90 px-1 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.15)] uppercase">CLICK ME</span>
                </div>
                {activeEffect === 'rosepetals' && (
                  <span className="absolute bottom-0.2 font-mono text-[7px] text-[#eb1121] font-bold uppercase tracking-wider">{timeLeft.toFixed(1)}s</span>
                )}
              </button>

              {/* Trigger Balloons Button */}
              <button
                id="btn-trigger-balloons"
                onClick={() => triggerSimulation('balloons')}
                className={`py-2 px-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative overflow-hidden group w-full bg-[#2b1bc6] text-white ${
                  activeEffect === 'balloons'
                    ? 'border-blue-300 ring-2 ring-blue-200'
                    : 'border-white/70 hover:border-white cursor-pointer'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-transform duration-500 ${activeEffect === 'balloons' ? 'bg-[#2563EB] text-white -translate-y-0.5 scale-105' : 'bg-[#F1F5F9] text-rose-500 group-hover:scale-105'}`}>
                  🎈
                </div>
                <div className="text-center leading-none">
                  <span className="block font-bold text-xs text-[#f00f46]">Balloon</span>
                  <span className="text-[8.5px] text-white/85 block mt-1">Helium rise</span>
                  <span className="block font-black text-[9px] text-black tracking-wider mt-1.5 bg-white/90 px-1 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.15)] uppercase">CLICK ME</span>
                </div>
                {activeEffect === 'balloons' && (
                  <span className="absolute bottom-0.2 font-mono text-[7px] text-blue-200 font-bold uppercase tracking-wider">{timeLeft.toFixed(1)}s</span>
                )}
              </button>

            </div>

            {/* Design Dashed Alert box */}
            {activeEffect === 'idle' ? (
              <div className="p-2 bg-white/50 border border-dashed border-[#CBD5E1] rounded-lg text-center backdrop-blur-sm">
                <p className="text-[10px] text-[#64748B] font-semibold leading-tight">Pick a simulation event.</p>
              </div>
            ) : (
              <div className="p-1.5 bg-blue-50/90 border border-blue-200 rounded-lg flex flex-col items-center gap-1.5 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-blue-800 font-bold uppercase tracking-wider font-mono text-[8px]">
                    ON: {activeEffect === 'rosepetals' ? 'PETALS' : 'BALLOONS'}
                  </span>
                </div>
                <button
                  id="btn-cancel-simulation"
                  onClick={cancelActiveSimulation}
                  className="px-2 py-1 w-full rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[9px] font-bold transition-all focus:outline-none flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Abort</span>
                </button>
              </div>
            )}
          </div>

        </main>

      </div>

      {/* Formal Executive Footer */}
      <footer id="bottom-footer" className="mt-auto border-t border-[#E2E8F0]/85 bg-white/90 backdrop-blur-md py-4 px-8 text-center text-xs font-mono text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>ATMOSPHERIC EFFECTS SIMULATOR CLIENT © 2026</span>
          <div className="flex items-center space-x-4">
            <span className="text-blue-600 font-bold">STRATOS CORE v1.4.0</span>
            <span>NODE ID: PASS_01_PRO_POLISH</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
