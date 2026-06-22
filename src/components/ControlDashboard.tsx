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
          <div className="fixed bottom-4 right-4 z-50 bg-white/92 backdrop-blur-md border border-[#E2E8F0]/80 rounded-lg p-2 shadow-lg flex flex-col gap-1.5 max-w-[165px] w-full">
            
            {/* Segment Header */}
            <div className="pb-1.5 flex justify-between items-center bg-[#156ddf] px-1.5 py-1 rounded-md text-white">
              <h3 className="font-display font-bold text-[8px] text-white/95 uppercase tracking-wider">
                Simulation
              </h3>
              <div className="text-[7px] text-blue-105 font-mono font-bold">
                {activeEffect !== 'idle' ? `${timeLeft.toFixed(1)}s` : 'STBY'}
              </div>
            </div>

            {/* Custom Grid matching the exact design button layout */}
            <div className="grid grid-cols-2 gap-1.5">
              
              {/* Trigger Rose Petals Button */}
              <button
                id="btn-trigger-rosepetals"
                onClick={() => triggerSimulation('rosepetals')}
                className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all duration-300 relative overflow-hidden group w-full bg-[#1e28ac] text-[#eb1121] ${
                  activeEffect === 'rosepetals'
                    ? 'border-rose-400 ring-1 ring-rose-200'
                    : 'border-[#1e28ac]/15 hover:border-rose-400 cursor-pointer'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-transform duration-500 ${activeEffect === 'rosepetals' ? 'bg-rose-600 text-white rotate-12 scale-105 animate-pulse' : 'bg-[#FFF1F2] text-rose-600 group-hover:scale-105'}`}>
                  🌹
                </div>
                <div className="text-center leading-none">
                  <span className="block font-normal text-[9px] text-[#ec0e4b]">Rose Petal</span>
                  <span className="text-[6.5px] text-[#eb1121]/75 block mt-0.5">Petal fall</span>
                </div>
                {activeEffect === 'rosepetals' && (
                  <span className="absolute bottom-0.2 font-mono text-[6px] text-[#eb1121] font-bold uppercase tracking-wider">{timeLeft.toFixed(1)}s</span>
                )}
              </button>

              {/* Trigger Balloons Button */}
              <button
                id="btn-trigger-balloons"
                onClick={() => triggerSimulation('balloons')}
                className={`py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all duration-300 relative overflow-hidden group w-full bg-[#2b1bc6] text-white ${
                  activeEffect === 'balloons'
                    ? 'border-blue-400 ring-1 ring-blue-200'
                    : 'border-[#2b1bc6]/15 hover:border-blue-400 cursor-pointer'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-transform duration-500 ${activeEffect === 'balloons' ? 'bg-[#2563EB] text-white -translate-y-0.5 scale-105' : 'bg-[#F1F5F9] text-rose-500 group-hover:scale-105'}`}>
                  🎈
                </div>
                <div className="text-center leading-none">
                  <span className="block font-normal text-[9px] text-[#f00f46]">Balloon</span>
                  <span className="text-[6.5px] text-white/70 block mt-0.5">Helium rise</span>
                </div>
                {activeEffect === 'balloons' && (
                  <span className="absolute bottom-0.2 font-mono text-[6px] text-blue-200 font-bold uppercase tracking-wider">{timeLeft.toFixed(1)}s</span>
                )}
              </button>

            </div>

            {/* Design Dashed Alert box */}
            {activeEffect === 'idle' ? (
              <div className="p-1 bg-white/50 border border-dashed border-[#CBD5E1] rounded-md text-center backdrop-blur-sm">
                <p className="text-[7.5px] text-[#64748B] font-semibold leading-tight">Pick an event.</p>
              </div>
            ) : (
              <div className="p-1 bg-blue-50/90 border border-blue-200 rounded-md flex flex-col items-center gap-1 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-blue-800 font-bold uppercase tracking-wider font-mono text-[7px]">
                    ON: {activeEffect === 'rosepetals' ? 'PETALS' : 'BALLOONS'}
                  </span>
                </div>
                <button
                  id="btn-cancel-simulation"
                  onClick={cancelActiveSimulation}
                  className="px-1.5 py-0.5 w-full rounded bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[7.5px] font-bold transition-all focus:outline-none flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-2 h-2" />
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
