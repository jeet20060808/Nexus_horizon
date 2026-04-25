import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ChevronDown, Zap, Shield, Target, Clock, Rocket, Menu, 
  Circle, Square, Triangle, Lock, Unlock, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, Info, Play, ArrowLeft, Power, X, Trophy, Eye, EyeOff, User, 
  Timer as TimerIcon, Volume2, VolumeX, Settings, History, BarChart3, HelpCircle, Pause, PlayCircle, Share2, Award, Lightbulb
} from 'lucide-react';
import heroImg from './assets/hero.png';
import cardImg from './assets/card.png';

// --- GLOBAL STATE / SOUND ENGINE ---
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playSound = (type, settings = { muted: false, volume: 0.5 }) => {
  if (settings.muted) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    const vol = settings.volume || 0.5;

    switch (type) {
      case 'hover':
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);
        gain.gain.setValueAtTime(0.05 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05); break;
      case 'click':
        osc.type = 'square'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1); break;
      case 'init':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
        gain.gain.setValueAtTime(0.1 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5); break;
      case 'win':
        [440, 554.37, 659.25].forEach((f, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(f, now + i * 0.1); g.gain.setValueAtTime(0.1 * vol, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.4);
        }); break;
      case 'loss':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        gain.gain.setValueAtTime(0.2 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5); break;
      case 'tick':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.05 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        osc.start(now); osc.stop(now + 0.02); break;
      case 'hint':
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now); osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.1 * vol, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3); break;
      default: break;
    }
  } catch (e) { console.warn("Audio Context failed", e); }
};

// --- UTILS ---
const COLORS = ['#00f5ff', '#ff007f', '#9d00ff', '#00ff66', '#ffcc00', '#ff5500', '#ffffff', '#555555'];
const SYMBOLS = [Circle, Square, Triangle, Zap, Target, Shield, Rocket, Clock];

const generateSecretCode = (slots, colorCount) => {
  return Array.from({ length: slots }, () => Math.floor(Math.random() * colorCount));
};

const getFeedback = (guess, secret) => {
  const black = guess.filter((c, i) => c === secret[i]).length;
  let white = 0;
  const secretCopy = [...secret];
  const guessCopy = [...guess];
  for (let i = guessCopy.length - 1; i >= 0; i--) {
    if (guessCopy[i] === secretCopy[i]) {
      guessCopy.splice(i, 1); secretCopy.splice(i, 1);
    }
  }
  for (let i = 0; i < guessCopy.length; i++) {
    const index = secretCopy.indexOf(guessCopy[i]);
    if (index !== -1) {
      white++; secretCopy.splice(index, 1);
    }
  }
  return { black, white };
};

// --- SHARED UI ---

const ChevronPattern = () => (
  <div className="absolute inset-0 opacity-[0.08] overflow-hidden flex flex-col items-center">
    {Array.from({ length: 25 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: -100 }}
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: i * -1.5 }}
        className="w-full flex justify-center mb-[-50px]"
      >
        <svg width="600" height="150" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L200 80L400 0" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    ))}
  </div>
);

const AbstractCircuitry = () => (
  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1000 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow-circuit">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <motion.path
      d="M 50,0 V 200 H 250 V 400 H 450 V 600"
      fill="none"
      stroke="#00f5ff"
      strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }}
      filter="url(#glow-circuit)"
    />
    <motion.path
      d="M 950,1000 V 800 H 750 V 600 H 550 V 400"
      fill="none"
      stroke="#ff007f"
      strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3, times: [0, 0.4, 0.6, 1] }}
      filter="url(#glow-circuit)"
    />
    <motion.path d="M 0,100 H 50 V 0" fill="none" stroke="#00f5ff" strokeWidth="1" animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 4, repeat: Infinity }} />
    <motion.path d="M 1000,900 H 950 V 1000" fill="none" stroke="#ff007f" strokeWidth="1" animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
    <motion.circle cx="450" cy="600" r="4" fill="#00f5ff" animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 6 }} filter="url(#glow-circuit)" />
    <motion.circle cx="550" cy="400" r="4" fill="#ff007f" animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 9 }} filter="url(#glow-circuit)" />
  </svg>
);

const CyberBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    
    <ChevronPattern />
    <AbstractCircuitry />

    <div className="absolute inset-0 opacity-[0.15]" 
         style={{ 
           backgroundImage: `linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)`,
           backgroundSize: '80px 80px',
           transform: 'perspective(1000px) rotateX(60deg) translateY(0%) scale(2)',
           maskImage: 'linear-gradient(to bottom, transparent, black 40%, black)',
           WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black)',
           transformOrigin: 'center center'
         }} 
    >
      <motion.div 
        animate={{ backgroundPositionY: ['0px', '80px'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      />
    </div>

    <motion.div 
      animate={{ scale: [1, 1.1, 1], rotate: [0, 3, 0], x: ['-2%', '2%', '-2%'], y: ['-2%', '2%', '-2%'] }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-[0.05] bg-[radial-gradient(circle_at_20%_20%,#00f5ff_0%,transparent_50%),radial-gradient(circle_at_80%_80%,#ff007f_0%,transparent_50%)]"
    />

    {Array.from({ length: 25 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: '110vh', x: `${Math.random() * 100}vw` }}
        animate={{ 
          opacity: [0, 0.5, 0], 
          y: '-10vh',
          x: [`${Math.random() * 100}vw`, `${(Math.random() * 100) + (Math.random() * 10 - 5)}vw`]
        }}
        transition={{ 
          duration: 15 + Math.random() * 20, 
          repeat: Infinity, 
          delay: Math.random() * 10,
          ease: "linear"
        }}
        className="absolute w-[2px] h-[2px] bg-nebula-cyan rounded-full shadow-[0_0_5px_rgba(0,245,255,0.5)]"
      />
    ))}

    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] z-50 pointer-events-none bg-[length:100%_4px]" />
  </div>
);

const AnimatedBackButton = ({ onClick, label = "RETURN TO BASE", soundSettings }) => (
  <motion.button 
    onClick={() => { playSound('click', soundSettings); onClick(); }}
    onMouseEnter={() => playSound('hover', soundSettings)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover="hover"
    className="absolute top-10 left-10 z-50 flex items-center gap-4 text-nebula-cyan font-black tracking-[0.4em] text-[10px] group"
  >
    <div className="relative">
      <motion.div variants={{ hover: { x: -10, opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.5 } } }} className="absolute -left-2 top-0 text-white opacity-0"><ArrowLeft size={20} /></motion.div>
      <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-300" />
    </div>
    <span className="relative">{label}<motion.div variants={{ hover: { width: '100%' } }} className="absolute -bottom-2 left-0 h-[1px] bg-nebula-cyan w-0 transition-all duration-300" /></span>
  </motion.button>
);

// --- MODALS & OVERLAYS ---

const SettingsPanel = ({ settings, setSettings, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="max-w-md w-full glass p-10 rounded-[2rem] border border-nebula-cyan/30 relative" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
      <h3 className="text-2xl font-black text-white mb-10 uppercase tracking-tighter flex items-center gap-4"><Settings className="text-nebula-cyan" /> System Configuration</h3>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Audio Matrix</label><span className="text-white font-black">{Math.round(settings.volume * 100)}%</span></div>
          <input type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })} className="w-full accent-nebula-cyan bg-white/10 h-1 rounded-full appearance-none cursor-pointer" />
        </div>
        <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Silence Mode</label><button onClick={() => setSettings({ ...settings, muted: !settings.muted })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.muted ? 'bg-nebula-pink' : 'bg-nebula-cyan'}`}><motion.div animate={{ x: settings.muted ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-black rounded-full shadow-lg" /></button></div>
        <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-500 tracking-widest uppercase">High Contrast</label><button onClick={() => setSettings({ ...settings, highContrast: !settings.highContrast })} className={`w-12 h-6 rounded-full relative transition-colors ${settings.highContrast ? 'bg-white' : 'bg-white/10'}`}><motion.div animate={{ x: settings.highContrast ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-black rounded-full" /></button></div>
      </div>
      <button onClick={onClose} className="mt-12 w-full py-4 bg-nebula-cyan text-black font-black tracking-widest uppercase hover:scale-105 transition-transform">Save Parameters</button>
    </motion.div>
  </motion.div>
);

const MissionIntel = ({ soundSettings }) => (
  <section id="objective" className="relative py-60 px-6 max-w-7xl mx-auto z-10">
    <SectionHeading subtitle="TACTICAL OVERVIEW">ABOUT THE MISSION</SectionHeading>
    <div className="grid md:grid-cols-3 gap-12">
      {[
        { title: "THE MISSION", content: "Crack the secret code before the timer expires. Each color sequence is a potential key.", icon: Target },
        { title: "THE FEEDBACK", content: "White pegs mean correct color, wrong slot. Black pegs mean perfect match.", icon: Info },
        { title: "THE TOOLS", content: "Use the selection matrix at the bottom. Keyboard keys 1-8 also select colors.", icon: Zap }
      ].map((item, i) => (
        <motion.div key={i} whileHover={{ y: -10 }} className="glass p-10 rounded-3xl border border-white/5 group hover:border-nebula-cyan/30 transition-all">
          <item.icon className="text-nebula-cyan mb-8 w-10 h-10 group-hover:scale-110 transition-transform" />
          <h4 className="text-xl font-black text-white mb-6 uppercase tracking-tighter">{item.title}</h4>
          <p className="text-gray-500 text-sm leading-loose font-medium">{item.content}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

// --- LANDING PAGE COMPONENTS ---

const Navbar = ({ soundSettings }) => (
  <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
    <div className="text-xl md:text-2xl font-black text-white tracking-tighter flex items-center gap-0"><span className="text-nebula-pink -mr-[0.05em]">S</span>PECTRUM</div>
    <div className="hidden lg:flex gap-16 text-[10px] font-black tracking-[0.5em] text-gray-500">
      <a href="#objective" onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-white transition-colors">ABOUT THE MISSION</a>
      <a href="#laws" onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-white transition-colors">RULES</a>
      <a href="#intel" onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-white transition-colors">LEVELS</a>
    </div>
    <div className="w-40" />
  </nav>
);

const SectionHeading = ({ children, subtitle }) => {
  const ref = useRef(null); const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-20">
      <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-nebula-pink text-xs font-black tracking-[0.6em] mb-6 uppercase">{subtitle}</motion.p>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter">{children}</motion.h2>
    </div>
  );
};

const LawCard = ({ number, title, description, soundSettings }) => {
  const ref = useRef(null); const isInView = useInView(ref, { amount: 0.5 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0.1, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex gap-12 items-start py-20 border-b border-white/5 group" onMouseEnter={() => playSound('hover', soundSettings)}>
      <div className="text-7xl md:text-9xl font-black text-nebula-pink/10 group-hover:text-nebula-pink/30 transition-colors duration-700">{number}</div>
      <div className="pt-4">
        <h3 className="text-2xl md:text-4xl font-black mb-8 text-white uppercase group-hover:text-nebula-cyan transition-colors">{title}</h3>
        <p className="text-gray-500 max-w-md leading-loose text-sm md:text-base font-medium tracking-wide">{description}</p>
      </div>
    </motion.div>
  );
};

const LandingPage = ({ onStart, soundSettings }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const levels = [
    { id: 1, title: 'LEVEL 01: THE AWAKENING', description: 'Enter the neon void. Master the basic 4-slot sequence with a limited palette. This is where your journey into the Spectrum begins.' },
    { id: 2, title: 'LEVEL 02: NEBULA CORRIDOR', description: 'Gravity shifts. The complexity increases as you face 5-slot challenges with new spectral frequencies. Speed is your only ally.' },
    { id: 3, title: 'LEVEL 03: EVENT HORIZON', description: 'The absolute limit. 6-slot sequences and 8 unique color codes. Only the most precise minds can survive the void here.' }
  ];

  return (
    <div className="relative min-h-screen text-white font-nebula selection:bg-nebula-cyan selection:text-nebula-dark overflow-x-hidden">
      <Navbar soundSettings={soundSettings} />
      <section className="relative h-screen flex flex-col items-center justify-center z-10">
        <div className="relative flex flex-col items-center justify-center w-full max-w-[1400px] px-4">
          <div className="relative w-full flex justify-center items-center">
            {/* LAYER 01: TYPOGRAPHY (BEHIND) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[15vw] md:text-[18rem] font-black tracking-[0.2em] text-nebula-pink leading-none select-none z-0 text-center w-full scale-x-110 flex justify-center items-center absolute inset-0">
              <span className="inline-block mr-[12vw]">RE</span>
              <span className="inline-block ml-[12vw]">DY</span>
            </motion.div>

            {/* LAYER 02: ASTRONAUT (MIDDLE) */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20 w-[350px] md:w-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible">
              <div className="absolute inset-0 bg-nebula-pink/40 blur-[200px] rounded-full scale-150" />
              <div className="relative z-10 w-full h-full flex items-center justify-center" style={{ maskImage: 'radial-gradient(circle at center, black 0%, black 20%, transparent 80%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 0%, black 20%, transparent 80%, transparent 100%)' }}>
                <img src={heroImg} alt="Mask" className="w-full h-auto brightness-150 saturate-150" />
              </div>
            </motion.div>

            {/* LAYER 03: TYPOGRAPHY (FRONT) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[15vw] md:text-[18rem] font-black tracking-[0.2em] text-nebula-pink leading-none select-none z-30 text-center w-full scale-x-110 flex justify-center items-center pointer-events-none">
              <span className="inline-block opacity-0 mr-[12vw]">RE</span>
              <span className="inline-block opacity-0 ml-[12vw]">DY</span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 md:mt-0 flex flex-col items-center z-30 pointer-events-none">
            <div className="flex gap-4 md:gap-8 items-center"><span className="text-3xl md:text-5xl font-light text-white tracking-[0.4em] uppercase opacity-90 leading-none">TO</span><span className="text-3xl md:text-5xl font-light text-white tracking-[0.4em] uppercase opacity-90 leading-none">REACH?</span></div>
          </motion.div>
        </div>
        <div className="absolute bottom-10 flex flex-col items-center gap-8 z-40">
          <div className="text-2xl font-black tracking-tighter uppercase text-white flex items-center gap-0"><span className="text-nebula-pink -mr-[0.05em]">S</span>PECTRUM</div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-12 text-white/30"><Circle size={24} onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-nebula-pink cursor-pointer transition-colors" /><Square size={24} onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-nebula-pink cursor-pointer transition-colors" /><Triangle size={24} onMouseEnter={() => playSound('hover', soundSettings)} className="hover:text-nebula-pink cursor-pointer transition-colors" /></div>
            <button onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => { playSound('click', soundSettings); onStart(); }} className="px-10 py-3 bg-nebula-pink text-white text-[12px] font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,0,127,0.6)] uppercase">Play Game</button>
          </div>
        </div>
      </section>
      <MissionIntel soundSettings={soundSettings} />
      <section id="laws" className="relative py-60 px-6 max-w-7xl mx-auto z-10">
        <SectionHeading subtitle="SURVIVAL PROTOCOL">RULES OF SURVIVAL</SectionHeading>
        <div className="grid md:grid-cols-2 gap-x-24 gap-y-10">
          <LawCard number="1" title="THE CORE EVOLVES" description="The logic deepens with your ambition. Choose your difficulty tier wisely—the Cipher scales from Recruit to Master without mercy." soundSettings={soundSettings} />
          <LawCard number="2" title="NO RETRACTIONS" description="Attempts are finite. Every submitted row is a permanent record in the void. Waste a guess, lose your life." soundSettings={soundSettings} />
          <LawCard number="3" title="TRUST THE PEGS" description="Your intuition is flawed; the algorithm is absolute. Believe the HUD—the two-pass matching logic handles duplicates with certainty." soundSettings={soundSettings} />
          <LawCard number="4" title="MOMENTUM IS LIFE" description="Decode before the SVG timer drains and your session self-destructs into data dust. Seconds are the difference between life and the abyss." soundSettings={soundSettings} />
        </div>
      </section>
      <section id="intel" className="relative py-60 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6"><SectionHeading subtitle="INTEL GATHERED">INSIDE THE GAME</SectionHeading></div>
        <div className="flex gap-12 px-10 overflow-x-auto pb-24 no-scrollbar snap-x relative">
          {levels.map((level) => (
            <motion.div key={level.id} whileHover={{ y: -20, scale: 1.02 }} onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => { playSound('click', soundSettings); setSelectedLevel(level); }} className="min-w-[340px] md:min-w-[600px] aspect-video bg-nebula-gray rounded-sm overflow-hidden relative group snap-center cursor-pointer">
              <img src={heroImg} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0" style={{ filter: `hue-rotate(${level.id * 45}deg) brightness(0.8)` }} alt={level.title} /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute bottom-12 left-12 z-20"><h4 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase">{level.title.split(':')[0]}</h4><p className="text-xs text-nebula-pink font-black tracking-[0.4em] uppercase">ACCESS GRANTED</p></div>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>{selectedLevel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md" onClick={() => { playSound('click', soundSettings); setSelectedLevel(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="max-w-xl w-full glass p-12 rounded-3xl border border-nebula-cyan/30 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => { playSound('click', soundSettings); setSelectedLevel(null); }} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              <h3 className="text-3xl font-black text-nebula-cyan mb-6 uppercase tracking-tighter">{selectedLevel.title}</h3><p className="text-gray-400 text-lg leading-relaxed font-medium mb-10">{selectedLevel.description}</p>
              <button onClick={() => { playSound('click', soundSettings); setSelectedLevel(null); }} className="w-full py-4 bg-nebula-cyan text-black font-black tracking-widest uppercase hover:scale-105 transition-transform">CLOSE INTEL</button>
            </motion.div>
          </motion.div>
        )}</AnimatePresence>
      </section>
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden z-10 py-60">
        <div className="text-center mb-24"><h2 className="text-5xl md:text-8xl font-black tracking-widest opacity-20 uppercase">Welcome Players</h2></div>
        <div className="relative z-20 flex flex-col md:flex-row items-center gap-20 max-w-6xl w-full">
          <div className="absolute -inset-40 bg-nebula-pink/10 blur-[200px] rounded-full pointer-events-none" />
          <motion.div initial={{ rotate: 10, y: 50 }} whileInView={{ rotate: -8, y: 0 }} transition={{ duration: 0.8, type: "spring" }} className="relative z-10"><img src={cardImg} alt="Mission Card" className="w-full max-w-md drop-shadow-[0_0_80px_rgba(255,0,127,0.4)]" /></motion.div>
          <div className="text-center md:text-left">
            <h3 className="text-8xl md:text-[10rem] font-black text-nebula-pink leading-none mb-4 uppercase">Hold</h3><p className="text-3xl md:text-5xl font-light tracking-[0.4em] uppercase text-white mb-12">The Card</p>
            <p className="text-gray-500 mb-12 max-w-sm leading-loose text-lg font-medium">Begin the game. Accept it or walk away.</p>
            <button onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => { playSound('click', soundSettings); onStart(); }} className="px-16 py-5 bg-nebula-pink text-white font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,0,127,0.5)] uppercase">Accept</button>
          </div>
        </div>
      </section>
      <footer className="relative py-20 text-center z-10">
        <div className="text-2xl font-black tracking-tighter mb-8 opacity-20 uppercase text-white">SPECTRUM</div><p className="text-[10px] text-gray-800 tracking-[0.8em] uppercase font-black">&copy; 2026 MISSION CONTROL. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

// --- GAME PHASES ---

const CalibrationScreen = ({ onSelect, onBack, soundSettings }) => {
  const tiers = [
    { name: 'RECRUIT', difficulty: 'Easy', slots: 4, colors: 4, guesses: 8, time: 90, icon: Zap },
    { name: 'OPERATIVE', difficulty: 'Medium', slots: 5, colors: 6, guesses: 10, time: 120, icon: Shield },
    { name: 'MASTER', difficulty: 'Hard', slots: 6, colors: 8, guesses: 12, time: 180, icon: Target },
  ];
  return (
    <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] z-50 overflow-hidden relative">
      <AnimatedBackButton onClick={onBack} soundSettings={soundSettings} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <motion.h2 initial={{ y: -50 }} animate={{ y: 0 }} className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Deployment <span className="text-nebula-cyan">Calibration</span></motion.h2>
      <p className="text-gray-500 font-bold tracking-[0.4em] uppercase mb-16">Select Mission Parameters</p>
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {tiers.map((tier) => (
          <motion.div key={tier.name} whileHover={{ scale: 1.05, y: -10 }} onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => { playSound('init', soundSettings); onSelect(tier); }} className="group cursor-pointer p-8 rounded-2xl border border-white/10 glass transition-all hover:border-nebula-cyan/50 hover:shadow-[0_0_50px_rgba(0,245,255,0.1)]">
            <tier.icon className="w-12 h-12 text-nebula-cyan mb-6 group-hover:rotate-12 transition-transform" /><h3 className="text-3xl font-black text-white mb-2 uppercase">{tier.name}</h3><p className="text-nebula-pink text-xs font-bold tracking-widest mb-8 uppercase">{tier.difficulty}</p>
            <div className="space-y-4 text-sm font-medium text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-2"><span>SLOTS</span> <span className="text-white font-black">{tier.slots}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>ATTEMPTS</span> <span className="text-white font-black">{tier.guesses}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>TIME LIMIT</span> <span className="text-nebula-cyan font-black">{tier.time}s</span></div>
            </div>
            <button className="mt-10 w-full py-4 bg-transparent border border-nebula-cyan/30 text-nebula-cyan text-xs font-black tracking-widest group-hover:bg-nebula-cyan group-hover:text-black transition-all animate-pulse">INITIALIZE</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ProtocolBriefing = ({ onAccept, onBack, soundSettings }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
    <AnimatedBackButton onClick={onBack} label="ABORT LINK" soundSettings={soundSettings} />
    <div className="max-w-2xl w-full glass p-10 md:p-16 rounded-[2rem] border border-nebula-pink/30 relative">
      <div className="absolute top-0 right-0 p-8 opacity-10"><AlertTriangle className="w-32 h-32 text-nebula-pink" /></div>
      <h2 className="text-4xl font-black text-white mb-10 tracking-tight uppercase">Laws of <span className="text-nebula-pink">the Void</span></h2>
      <div className="space-y-8 mb-12">
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">01</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">The Core Evolves:</span> Logic deepens with ambition. Cipher scales without mercy.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">02</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">No Retractions:</span> Attempts are finite. Waste a guess, lose your life.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">03</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">Trust the Pegs:</span> Black (Correct Place), White (Correct Color). Logic is absolute.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">04</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">Momentum is Life:</span> Decode before the arc drains. Failure results in destruction.</p></div>
      </div>
      <button onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => { playSound('init', soundSettings); onAccept(); }} className="w-full py-5 bg-nebula-pink text-white font-black tracking-[0.3em] uppercase hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,0,127,0.4)]">Initiate Link</button>
    </div>
  </motion.div>
);

const GhostMarquee = () => {
  const text = " READY ".repeat(8);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] opacity-[0.03] select-none flex items-center justify-center">
      <div className="flex whitespace-nowrap animate-marquee text-[15rem] md:text-[25rem] font-mono font-black text-white will-change-transform uppercase">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
};

const GameBoard = ({ config, onReset, soundSettings }) => {
  const [secret, setSecret] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [gameState, setGameState] = useState('PLAYING'); // PLAYING, PAUSED, WIN_NAME, ARCHIVES, LOST
  const [timeLeft, setTimeLeft] = useState(config.time);
  const [isRevealing, setIsRevealing] = useState(false);
  const [operativeName, setOperativeName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [activeHint, setActiveHint] = useState(null); // { slot, colorIdx }

  // Use useCallback to stabilize the secret generation and prevent React Hook errors
  const initGame = useCallback(() => {
    setSecret(generateSecretCode(config.slots, config.colors));
    const saved = localStorage.getItem(`leaderboard_${config.name}`);
    if (saved) setLeaderboard(JSON.parse(saved));
    const savedHistory = localStorage.getItem('mission_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [config]);

  useEffect(() => { initGame(); }, [initGame]);

  // Timer loop with Pause support
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => { 
      setTimeLeft((prev) => { 
        if (prev <= 0) { playSound('loss', soundSettings); handleGameEnd('LOST'); return 0; } 
        if (prev <= 10) playSound('tick', soundSettings); return prev - 1; 
      }); 
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, soundSettings]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeys = (e) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Backspace') handleRemoveColor();
      if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (idx < config.colors) handleColorSelect(idx);
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [currentGuess, gameState]);

  const handleColorSelect = (i) => { if (currentGuess.length < config.slots && gameState === 'PLAYING') { playSound('hover', soundSettings); setCurrentGuess([...currentGuess, i]); } };
  const handleRemoveColor = () => { if (currentGuess.length > 0) { playSound('click', soundSettings); setCurrentGuess(currentGuess.slice(0, -1)); } };

  const handleSubmit = () => {
    if (currentGuess.length !== config.slots || isRevealing || gameState !== 'PLAYING') return;
    playSound('click', soundSettings); setIsRevealing(true);
    const result = getFeedback(currentGuess, secret);
    setTimeout(() => {
      const newG = [currentGuess, ...guesses];
      const newF = [result, ...feedback];
      setGuesses(newG); setFeedback(newF); setCurrentGuess([]); setIsRevealing(false);
      if (result.black === config.slots) { playSound('win', soundSettings); setGameState('WIN_NAME'); }
      else if (newG.length >= config.guesses) { handleGameEnd('LOST'); }
    }, 500);
  };

  const handleGameEnd = (state) => {
    setGameState(state);
    if (state === 'LOST') playSound('loss', soundSettings);
    const stats = JSON.parse(localStorage.getItem('spectrum_stats') || '{"wins":0,"losses":0,"totalTime":0}');
    if (state === 'LOST') stats.losses++;
    else stats.wins++;
    stats.totalTime += (config.time - timeLeft);
    localStorage.setItem('spectrum_stats', JSON.stringify(stats));
    
    const mission = { tier: config.name, result: state, time: config.time - timeLeft, date: new Date().toISOString() };
    const newHistory = [mission, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('mission_history', JSON.stringify(newHistory));
  };

  const useHint = () => {
    if (hintsUsed >= 2 || gameState !== 'PLAYING') return;
    playSound('hint', soundSettings);
    const unusedIdx = Array.from({length: config.slots}, (_, i) => i).filter(i => !guesses.some(g => g[i] === secret[i]));
    if (unusedIdx.length > 0) {
      const hintIdx = unusedIdx[Math.floor(Math.random() * unusedIdx.length)];
      setActiveHint({ slot: hintIdx + 1, colorIdx: secret[hintIdx] });
      setHintsUsed(h => h + 1);
    }
  };

  const saveToLeaderboard = () => {
    if (!operativeName.trim()) return;
    playSound('click', soundSettings);
    const entry = { name: operativeName.trim(), guesses: guesses.length, timeRemaining: timeLeft, timeUsed: config.time - timeLeft, date: new Date().toLocaleDateString() };
    const newLeaderboard = [...leaderboard, entry].sort((a, b) => {
      if (a.guesses !== b.guesses) return a.guesses - b.guesses;
      return b.timeRemaining - a.timeRemaining;
    }).slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem(`leaderboard_${config.name}`, JSON.stringify(newLeaderboard));
    setGameState('ARCHIVES');
  };

  const reinitializeMission = () => {
    playSound('init', soundSettings);
    setGuesses([]); setFeedback([]); setCurrentGuess([]); setTimeLeft(config.time); setGameState('PLAYING'); setHintsUsed(0);
    setSecret(generateSecretCode(config.slots, config.colors));
  };

  const ColorCircle = ({ colorIndex, size = "w-full h-full" }) => {
    const Icon = SYMBOLS[colorIndex];
    return (
      <motion.div whileHover={{ scale: 1.1, filter: "brightness(1.2) drop-shadow(0 0 8px currentColor)" }} whileTap={{ scale: 0.9 }} className={`${size} rounded-full flex items-center justify-center relative shadow-lg overflow-hidden`} style={{ backgroundColor: COLORS[colorIndex], color: COLORS[colorIndex] }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        <Icon className="text-black/30 w-1/2 h-1/2" />
      </motion.div>
    );
  };

  const GlitchTitle = ({ text, color = "text-white" }) => (
    <div className="relative inline-block">
      <motion.h2 animate={{ x: [-1, 1, -1, 0], opacity: [0.8, 1, 0.9, 1] }} transition={{ repeat: Infinity, duration: 0.2 }} className={`text-6xl md:text-8xl font-black uppercase tracking-tighter relative z-10 ${color}`}>{text}</motion.h2>
      <motion.h2 animate={{ x: [2, -2, 2], y: [1, -1, 1] }} transition={{ repeat: Infinity, duration: 0.1 }} className={`text-6xl md:text-8xl font-black uppercase tracking-tighter absolute top-0 left-0 z-0 text-nebula-pink opacity-50`}>{text}</motion.h2>
      <motion.h2 animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 0.15 }} className={`text-6xl md:text-8xl font-black uppercase tracking-tighter absolute top-0 left-0 z-0 text-nebula-cyan opacity-50`}>{text}</motion.h2>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 relative font-nebula text-white overflow-hidden">
      <AnimatedBackButton onClick={onReset} label="QUIT MISSION" soundSettings={soundSettings} />
      
      <div className="absolute top-10 right-10 flex gap-4 z-50">
        <button onClick={useHint} disabled={hintsUsed >= 2} className={`p-3 rounded-full glass border transition-colors ${hintsUsed < 2 ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10' : 'border-white/5 text-gray-800'}`} title="Get Hint"><Lightbulb size={20} /></button>
        <button onClick={() => { playSound('click', soundSettings); setGameState(prev => prev === 'PAUSED' ? 'PLAYING' : 'PAUSED'); }} className={`p-3 rounded-full glass border border-white/10 text-gray-500 hover:text-white transition-colors`}>{gameState === 'PAUSED' ? <PlayCircle size={20} /> : <Pause size={20} />}</button>
      </div>

      <div className="w-full max-w-2xl flex justify-between items-end mb-12 relative z-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-black text-nebula-cyan tracking-[0.4em] uppercase opacity-60">Mission Status: {gameState}</p>
          <div className="flex gap-2">{secret.map((_, i) => (
            <motion.div key={i} initial={false} animate={gameState === 'LOST' || gameState === 'WIN_NAME' ? { rotateY: 180 } : {}} className="w-12 h-12 glass border border-white/10 flex items-center justify-center rounded-lg relative preserve-3d transition-transform duration-1000">
              <div className="absolute inset-0 backface-hidden flex items-center justify-center"><Lock size={16} className="text-gray-600" /></div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-2"><ColorCircle colorIndex={secret[i]} /></div>
            </motion.div>
          ))}</div>
        </div>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" /><motion.circle cx="48" cy="48" r="40" fill="transparent" stroke={timeLeft < 10 ? "#ff007f" : "#00f5ff"} strokeWidth="4" strokeDasharray="251.2" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 251.2 * (1 - timeLeft / config.time) }} transition={{ duration: 1, ease: "linear" }} /></svg>
          <div className={`absolute text-xl font-black ${timeLeft < 10 ? 'text-nebula-pink animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
        </div>
      </div>

      <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/5 space-y-4 mb-12 relative z-10 max-h-[50vh] overflow-y-auto no-scrollbar">
        <div className="flex gap-4 items-center">
          <div className="w-8 text-[10px] font-black text-nebula-pink">{guesses.length + 1}</div>
          <div className="flex-1 flex gap-3">{Array.from({ length: config.slots }).map((_, i) => (
            <motion.div key={i} whileTap={{ scale: 0.9 }} onClick={handleRemoveColor} className="flex-1 aspect-square rounded-xl glass border border-nebula-cyan/20 flex items-center justify-center cursor-pointer">
              {currentGuess[i] !== undefined && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-[80%] h-[80%]"><ColorCircle colorIndex={currentGuess[i]} /></motion.div>}
            </motion.div>
          ))}</div>
          <div className="w-20 flex justify-center"><button onMouseEnter={() => playSound('hover', soundSettings)} disabled={currentGuess.length !== config.slots || isRevealing || gameState !== 'PLAYING'} onClick={handleSubmit} className={`w-full py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${currentGuess.length === config.slots && gameState === 'PLAYING' ? 'bg-nebula-cyan text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]' : 'bg-white/5 text-gray-500'}`}>TX</button></div>
        </div>
        {guesses.map((g, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4 items-center opacity-60">
            <div className="w-8 text-[10px] font-black text-gray-700">{guesses.length - idx}</div>
            <div className="flex-1 flex gap-3">{g.map((c, i) => (<div key={i} className="flex-1 aspect-square rounded-xl glass border border-white/5 flex items-center justify-center p-1"><ColorCircle colorIndex={c} size="w-full h-full" /></div>))}</div>
            <div className="w-20 flex flex-wrap gap-1 justify-center">
              {Array.from({ length: feedback[idx].black }).map((_, i) => (<motion.div key={`b-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring", bounce: 0.5 }} className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />))}
              {Array.from({ length: feedback[idx].white }).map((_, i) => (<motion.div key={`w-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: (feedback[idx].black + i) * 0.1, type: "spring", bounce: 0.5 }} className="w-2 h-2 rounded-full border border-white/40" />))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 glass px-8 py-6 rounded-full border border-white/10 flex gap-6 z-20">
        {Array.from({ length: config.colors }).map((_, i) => (
          <motion.button key={i} whileHover={{ scale: 1.2, y: -5 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => handleColorSelect(i)} className="w-12 h-12 relative group" disabled={gameState !== 'PLAYING'}>
            <ColorCircle colorIndex={i} />
          </motion.button>
        ))}
        <div className="w-[1px] h-10 bg-white/10 mx-2" /><button onMouseEnter={() => playSound('hover', soundSettings)} onClick={handleRemoveColor} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors"><RefreshCw size={20} /></button>
      </motion.div>

      {/* WIN POPUP: NAME ENTRY */}
      <AnimatePresence>
        {gameState === 'WIN_NAME' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-nebula-cyan/40 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nebula-cyan to-transparent animate-pulse" />
              <CheckCircle2 className="w-20 h-20 text-nebula-cyan mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Protocol Success</h2>
              <div className="relative mb-10 group"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-nebula-cyan transition-colors" size={18} /><input autoFocus type="text" value={operativeName} onChange={(e) => setOperativeName(e.target.value)} placeholder="ENTER CALLSIGN..." className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-black tracking-widest focus:outline-none focus:border-nebula-cyan transition-colors uppercase placeholder:text-gray-700" /></div>
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="glass p-4 rounded-xl border border-white/5"><p className="text-[8px] text-gray-600 font-black uppercase mb-1">Efficiency</p><p className="text-xl font-black text-white">{guesses.length} TRIES</p></div>
                <div className="glass p-4 rounded-xl border border-white/5"><p className="text-[8px] text-gray-600 font-black uppercase mb-1">Time Remaining</p><p className="text-xl font-black text-white">{timeLeft}s</p></div>
              </div>
              <button onClick={saveToLeaderboard} disabled={!operativeName.trim()} className="w-full py-5 bg-nebula-cyan text-black font-black tracking-[0.4em] uppercase hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,245,255,0.4)] disabled:opacity-20">Sync Archives</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARCHIVES / LEADERBOARD */}
      <AnimatePresence>
        {gameState === 'ARCHIVES' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#020617]/98 backdrop-blur-3xl overflow-y-auto">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="max-w-4xl w-full my-10">
              <div className="text-center mb-12"><Trophy className="w-16 h-16 text-nebula-cyan mx-auto mb-4" /><h2 className="text-5xl font-black text-white tracking-tighter uppercase">Mission <span className="text-nebula-cyan">Archives</span></h2><p className="text-gray-600 font-bold tracking-[0.5em] uppercase text-[10px]">Top Operatives - {config.name} TIER</p></div>
              <div className="glass border border-white/10 rounded-3xl overflow-hidden mb-12">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-white/5 text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase"><th className="p-6">Rank</th><th className="p-6">Operative Name</th><th className="p-6">Efficiency</th><th className="p-6 text-right">Time Used</th></tr></thead>
                  <tbody>
                    {leaderboard.map((entry, i) => (
                      <motion.tr key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={`border-b border-white/5 text-sm font-black transition-colors hover:bg-white/5 ${i < 3 ? 'bg-nebula-cyan/5' : ''}`}>
                        <td className="p-6">{i === 0 ? <span className="text-yellow-400">#01 GOLD</span> : i === 1 ? <span className="text-gray-400">#02 SILVER</span> : i === 2 ? <span className="text-amber-600">#03 BRONZE</span> : <span className="text-gray-700">#{i + 1}</span>}</td>
                        <td className="p-6 text-white uppercase tracking-widest">{entry.name}</td>
                        <td className="p-6 text-nebula-pink">{entry.guesses} ATTEMPTS</td>
                        <td className="p-6 text-right text-gray-400">{entry.timeUsed}s</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="glass p-8 rounded-3xl border border-white/10">
                  <h3 className="text-xs font-black text-nebula-pink tracking-widest uppercase mb-6 flex items-center gap-2"><History size={14}/> Recent History</h3>
                  <div className="space-y-4">{history.map((h, i) => (<div key={i} className="flex justify-between items-center py-2 border-b border-white/5 opacity-60"><span className={`text-[10px] font-black ${h.result === 'LOST' ? 'text-red-500' : 'text-green-500'}`}>{h.result}</span><span className="text-[10px] text-gray-500 uppercase">{h.tier} | {h.time}s</span></div>))}</div>
                </div>
                <div className="glass p-8 rounded-3xl border border-white/10">
                  <h3 className="text-xs font-black text-nebula-cyan tracking-widest uppercase mb-6 flex items-center gap-2"><Award size={14}/> Achievements</h3>
                  <div className="flex flex-wrap gap-4">{guesses.length <= 4 && <div className="p-3 glass rounded-xl border border-yellow-500/30 text-yellow-500 text-[8px] font-black uppercase">Speed Demon</div>}{timeLeft >= 30 && <div className="p-3 glass rounded-xl border border-nebula-cyan/30 text-nebula-cyan text-[8px] font-black uppercase">Tactical Ace</div>}<div className="p-3 glass rounded-xl border border-white/5 text-gray-700 text-[8px] font-black uppercase">First Blood</div></div>
                </div>
              </div>
              <div className="flex gap-4"><button onMouseEnter={() => playSound('hover', soundSettings)} onClick={reinitializeMission} className="flex-1 py-6 bg-nebula-cyan text-black font-black tracking-[0.5em] uppercase hover:scale-105 transition-transform">Reinitialize Mission</button><button onMouseEnter={() => playSound('hover', soundSettings)} onClick={onReset} className="px-12 py-6 glass border border-white/10 text-white font-black tracking-[0.5em] uppercase hover:bg-white/5 transition-colors">Return to Base</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOSS SCREEN */}
      <AnimatePresence>
        {gameState === 'LOST' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-2xl overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div key={i} initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, ease: "linear", delay: i * 0.5 }} className="absolute h-[1px] w-full bg-nebula-pink top-0" style={{ top: `${i * 10}%` }} />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div key={i} initial={{ y: '100vh', opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 1, 0] }} transition={{ duration: 3 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }} className="absolute w-[2px] h-10 bg-nebula-pink/40 left-0" style={{ left: `${Math.random() * 100}%` }} />
              ))}
            </div>
            
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center max-w-2xl w-full relative z-10">
              <div className="mb-10 relative"><XCircle className="w-24 h-24 text-nebula-pink mx-auto animate-pulse" /><div className="absolute inset-0 bg-nebula-pink/20 blur-[60px] rounded-full" /></div>
              <div className="mb-8"><GlitchTitle text="Connection" color="text-white" /><br /><GlitchTitle text="Severed" color="text-nebula-pink" /></div>
              <p className="text-gray-600 font-black tracking-[0.4em] uppercase mb-12">Data Corrupted. Mission Failed.</p>
              <div className="flex justify-center gap-4 mb-16">{secret.map((c, i) => (<motion.div key={i} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="w-16 h-16 rounded-2xl glass border border-nebula-pink/30 flex items-center justify-center p-2"><ColorCircle colorIndex={c} /></motion.div>))}</div>
              <div className="max-w-md mx-auto grid grid-cols-2 gap-6 mb-16"><div className="glass p-6 rounded-2xl border border-white/5 text-center"><p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Attempts Used</p><p className="text-3xl font-black text-white">{guesses.length}</p></div><div className="glass p-6 rounded-2xl border border-white/5 text-center"><p className="text-[10px] text-gray-600 font-black uppercase mb-2 tracking-widest">Final Time</p><p className="text-3xl font-black text-white">{config.time - timeLeft}s</p></div></div>
              <div className="flex flex-col md:flex-row gap-6 justify-center"><button onMouseEnter={() => playSound('hover', soundSettings)} onClick={onReset} className="px-16 py-6 bg-nebula-pink text-white font-black tracking-[0.5em] uppercase hover:scale-110 transition-all shadow-[0_0_50px_rgba(255,0,127,0.5)]">Reinitialize</button><button onMouseEnter={() => playSound('hover', soundSettings)} onClick={() => setGameState('ARCHIVES')} className="px-12 py-6 glass border border-white/10 text-white font-black tracking-[0.5em] uppercase hover:bg-white/5 transition-colors">View Archives</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAUSE OVERLAY */}
      <AnimatePresence>
        {gameState === 'PAUSED' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[40px]"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
              <Pause className="w-20 h-20 text-nebula-cyan mx-auto mb-8 animate-pulse" />
              <h2 className="text-6xl font-black text-white mb-12 uppercase tracking-tighter">System <span className="text-nebula-cyan">Paused</span></h2>
              <button 
                onClick={() => { playSound('click', soundSettings); setGameState('PLAYING'); }}
                className="px-16 py-6 bg-nebula-cyan text-black font-black tracking-[0.5em] uppercase hover:scale-110 transition-all shadow-[0_0_50px_rgba(0,245,255,0.4)] flex items-center justify-center gap-4 mx-auto"
              >
                <PlayCircle size={24} /> Resume Mission
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTEL HINT MODAL */}
      <AnimatePresence>
        {activeHint && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md" onClick={() => setActiveHint(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-xs w-full glass p-10 rounded-[2.5rem] border border-yellow-500/30 text-center relative" onClick={e => e.stopPropagation()}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-4 glass border border-yellow-500/50 rounded-full bg-black shadow-[0_0_20px_rgba(234,179,8,0.3)]"><Lightbulb className="text-yellow-500" size={24} /></div>
              <h3 className="text-xs font-black text-yellow-500 mb-8 tracking-[0.4em] uppercase">Tactical Intel</h3>
              <p className="text-gray-400 text-[10px] font-black tracking-widest uppercase mb-10">Revealing Slot <span className="text-white">{activeHint.slot}</span></p>
              <div className="w-24 h-24 mx-auto mb-10 relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-[30px] rounded-full animate-pulse" />
                <ColorCircle colorIndex={activeHint.colorIdx} showSymbol={true} />
              </div>
              <button onClick={() => setActiveHint(null)} className="w-full py-4 bg-yellow-500 text-black font-black tracking-widest uppercase hover:scale-105 transition-transform">Acknowledged</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [phase, setPhase] = useState('LANDING');
  const [gameConfig, setGameConfig] = useState(null);
  const [settings, setSettings] = useState({ volume: 0.5, muted: false, highContrast: false });
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`relative min-h-screen bg-[#020617] ${settings.highContrast ? 'contrast-125 saturate-150' : ''}`}>
      <CyberBackground />
      <GhostMarquee />
      <div className="fixed bottom-10 right-10 z-[1000] flex gap-4">
        <button onClick={() => setSettings(s => ({ ...s, muted: !s.muted }))} className="p-4 glass rounded-full border border-white/10 text-gray-500 hover:text-white transition-colors">{settings.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
        <button onClick={() => setShowSettings(true)} className="p-4 glass rounded-full border border-white/10 text-gray-500 hover:text-white transition-colors"><Settings size={20} /></button>
      </div>
      <AnimatePresence mode="wait">
        {phase === 'LANDING' && (<motion.div key="landing" exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.8 }}><LandingPage onStart={() => setPhase('CALIBRATION')} soundSettings={settings} /></motion.div>)}
        {phase === 'CALIBRATION' && (<CalibrationScreen key="calibration" onBack={() => setPhase('LANDING')} onSelect={(c) => { setGameConfig(c); setPhase('BRIEFING'); }} soundSettings={settings} />)}
        {phase === 'GAME' && (<GameBoard key="game" config={gameConfig} onReset={() => setPhase('CALIBRATION')} soundSettings={settings} />)}
      </AnimatePresence>
      <AnimatePresence>{phase === 'BRIEFING' && (<ProtocolBriefing key="briefing" onBack={() => setPhase('CALIBRATION')} onAccept={() => setPhase('GAME')} soundSettings={settings} />)}</AnimatePresence>
      <AnimatePresence>{showSettings && <SettingsPanel settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />}</AnimatePresence>
    </div>
  );
}
