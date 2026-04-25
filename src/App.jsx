import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ChevronDown, Zap, Shield, Target, Clock, Rocket, Menu, 
  Circle, Square, Triangle, Lock, Unlock, RefreshCw, 
  CheckCircle2, XCircle, AlertTriangle, Info, Play, ArrowLeft, Power, X
} from 'lucide-react';
import heroImg from './assets/hero.png';
import cardImg from './assets/card.png';

// --- UTILS ---
const COLORS = [
  '#00f5ff', // Cyan
  '#ff007f', // Pink
  '#9d00ff', // Purple
  '#00ff66', // Green
  '#ffcc00', // Yellow
  '#ff5500', // Orange
  '#ffffff', // White
  '#555555'  // Gray
];

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
      guessCopy.splice(i, 1);
      secretCopy.splice(i, 1);
    }
  }
  for (let i = 0; i < guessCopy.length; i++) {
    const index = secretCopy.indexOf(guessCopy[i]);
    if (index !== -1) {
      white++;
      secretCopy.splice(index, 1);
    }
  }
  return { black, white };
};

// --- SHARED UI ---

const AnimatedBackButton = ({ onClick, label = "RETURN TO BASE" }) => (
  <motion.button 
    onClick={onClick}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover="hover"
    className="absolute top-10 left-10 z-50 flex items-center gap-4 text-nebula-cyan font-black tracking-[0.4em] text-[10px] group"
  >
    <div className="relative">
      <motion.div 
        variants={{ hover: { x: -10, opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 0.5 } } }}
        className="absolute -left-2 top-0 text-white opacity-0"
      >
        <ArrowLeft size={20} />
      </motion.div>
      <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform duration-300" />
    </div>
    <span className="relative">
      {label}
      <motion.div 
        variants={{ hover: { width: '100%' } }}
        className="absolute -bottom-2 left-0 h-[1px] bg-nebula-cyan w-0 transition-all duration-300" 
      />
    </span>
  </motion.button>
);

// --- LANDING PAGE COMPONENTS ---

const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
    <div className="text-xl md:text-2xl font-black text-white tracking-tighter flex items-center gap-2">
      <span className="text-nebula-pink">S</span>PECTRUM
    </div>
    <div className="hidden lg:flex gap-16 text-[10px] font-black tracking-[0.5em] text-gray-500">
      <a href="#objective" className="hover:text-white transition-colors">ABOUT THE MISSION</a>
      <a href="#laws" className="hover:text-white transition-colors">RULES</a>
      <a href="#intel" className="hover:text-white transition-colors">LEVELS</a>
    </div>
    <div className="w-40" />
  </nav>
);

const SectionHeading = ({ children, subtitle }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-20">
      <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className="text-nebula-pink text-xs font-black tracking-[0.6em] mb-6 uppercase">{subtitle}</motion.p>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter">{children}</motion.h2>
    </div>
  );
};

const LawCard = ({ number, title, description }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0.1, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} className="flex gap-12 items-start py-20 border-b border-white/5 group">
      <div className="text-7xl md:text-9xl font-black text-nebula-pink/10 group-hover:text-nebula-pink/30 transition-colors duration-700">{number}</div>
      <div className="pt-4">
        <h3 className="text-2xl md:text-4xl font-black mb-8 text-white uppercase group-hover:text-nebula-cyan transition-colors">{title}</h3>
        <p className="text-gray-500 max-w-md leading-loose text-sm md:text-base font-medium tracking-wide">{description}</p>
      </div>
    </motion.div>
  );
};

const LandingPage = ({ onStart }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const levels = [
    { id: 1, title: 'LEVEL 01: THE AWAKENING', description: 'Enter the neon void. Master the basic 4-slot sequence with a limited palette. This is where your journey into the Spectrum begins.' },
    { id: 2, title: 'LEVEL 02: NEBULA CORRIDOR', description: 'Gravity shifts. The complexity increases as you face 5-slot challenges with new spectral frequencies. Speed is your only ally.' },
    { id: 3, title: 'LEVEL 03: EVENT HORIZON', description: 'The absolute limit. 6-slot sequences and 8 unique color codes. Only the most precise minds can survive the void here.' },
    { id: 4, title: 'LEVEL 04: SINGULARITY', description: 'Everything collapses. The ultimate test of logic and intuition. Crack the code before the system self-destructs into data dust.' }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white font-nebula selection:bg-nebula-cyan selection:text-nebula-dark overflow-x-hidden">
      <Navbar />
      <section className="relative h-screen flex flex-col items-center justify-center z-10 overflow-hidden">
        <div className="relative flex flex-col items-center justify-center w-full max-w-[1400px] px-4">
          <div className="relative w-full flex justify-center items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-[15vw] md:text-[18rem] font-black tracking-[-0.05em] text-nebula-pink leading-none select-none z-0 text-center w-full">
              <span className="inline-block px-[2vw]">READY</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute z-20 w-[250px] md:w-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="absolute inset-0 bg-nebula-pink/20 blur-[100px] rounded-full" />
              <div className="relative z-10" style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 85%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 85%)' }}><img src={heroImg} alt="Mask" className="w-full h-auto brightness-125" /></div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-4 md:mt-0 flex flex-col items-center z-30 pointer-events-none">
            <div className="flex gap-4 md:gap-8 items-center">
              <span className="text-3xl md:text-5xl font-light text-white tracking-[0.4em] uppercase opacity-90 leading-none">TO</span>
              <span className="text-3xl md:text-5xl font-light text-white tracking-[0.4em] uppercase opacity-90 leading-none">REACH?</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center gap-8 z-40">
          <div className="text-2xl font-black tracking-tighter opacity-80 uppercase text-white">
            <span className="text-nebula-pink">S</span>PECTRUM
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-12 text-white/30">
              <Circle size={24} className="hover:text-nebula-pink cursor-pointer transition-colors" /> 
              <Square size={24} className="hover:text-nebula-pink cursor-pointer transition-colors" /> 
              <Triangle size={24} className="hover:text-nebula-pink cursor-pointer transition-colors" />
            </div>
            <button onClick={onStart} className="px-10 py-3 bg-nebula-pink text-white text-[12px] font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,0,127,0.6)] uppercase">Play Game</button>
          </div>
        </div>
      </section>
      
      <section id="laws" className="relative py-60 px-6 max-w-7xl mx-auto z-10">
        <SectionHeading subtitle="SURVIVAL PROTOCOL">RULES OF SURVIVAL</SectionHeading>
        <div className="grid md:grid-cols-2 gap-x-24 gap-y-10">
          <LawCard number="1" title="THE CORE EVOLVES" description="The logic deepens with your ambition. Choose your difficulty tier wisely—the Cipher scales from Recruit to Master without mercy." />
          <LawCard number="2" title="NO RETRACTIONS" description="Attempts are finite. Every submitted row is a permanent record in the void. Waste a guess, lose your life." />
          <LawCard number="3" title="TRUST THE PEGS" description="Your intuition is flawed; the algorithm is absolute. Believe the HUD—the two-pass matching logic handles duplicates with certainty." />
          <LawCard number="4" title="MOMENTUM IS LIFE" description="Decode before the SVG timer drains and your session self-destructs into data dust. Seconds are the difference between life and the abyss." />
        </div>
      </section>

      <section id="intel" className="relative py-60 overflow-hidden z-10 bg-black/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6"><SectionHeading subtitle="INTEL GATHERED">INSIDE THE GAME</SectionHeading></div>
        <div className="flex gap-12 px-10 overflow-x-auto pb-24 no-scrollbar snap-x relative">
          {levels.map((level) => (
            <motion.div 
              key={level.id} 
              whileHover={{ y: -20, scale: 1.02 }} 
              onClick={() => setSelectedLevel(level)}
              className="min-w-[340px] md:min-w-[600px] aspect-video bg-nebula-gray rounded-sm overflow-hidden relative group snap-center cursor-pointer"
            >
              <img src={heroImg} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0" style={{ filter: `hue-rotate(${level.id * 45}deg) brightness(0.8)` }} alt={level.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute bottom-12 left-12 z-20">
                <h4 className="text-4xl md:text-5xl font-black mb-4 text-white uppercase">{level.title.split(':')[0]}</h4>
                <p className="text-xs text-nebula-pink font-black tracking-[0.4em] uppercase">ACCESS GRANTED</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Level Detail Modal */}
        <AnimatePresence>
          {selectedLevel && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedLevel(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="max-w-xl w-full glass p-12 rounded-3xl border border-nebula-cyan/30 relative"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setSelectedLevel(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <h3 className="text-3xl font-black text-nebula-cyan mb-6 uppercase tracking-tighter">{selectedLevel.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed font-medium mb-10">{selectedLevel.description}</p>
                <button onClick={() => setSelectedLevel(null)} className="w-full py-4 bg-nebula-cyan text-black font-black tracking-widest uppercase hover:scale-105 transition-transform">CLOSE INTEL</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden z-10 py-60">
        <div className="text-center mb-24"><h2 className="text-5xl md:text-8xl font-black tracking-widest opacity-20 uppercase">Welcome Players</h2></div>
        <div className="relative z-20 flex flex-col md:flex-row items-center gap-20 max-w-6xl w-full">
          <div className="absolute -inset-40 bg-nebula-pink/10 blur-[200px] rounded-full pointer-events-none" />
          <motion.div initial={{ rotate: 10, y: 50 }} whileInView={{ rotate: -8, y: 0 }} transition={{ duration: 0.8, type: "spring" }} className="relative z-10"><img src={cardImg} alt="Mission Card" className="w-full max-w-md drop-shadow-[0_0_80px_rgba(255,0,127,0.4)]" /></motion.div>
          <div className="text-center md:text-left">
            <h3 className="text-8xl md:text-[10rem] font-black text-nebula-pink leading-none mb-4 uppercase">Hold</h3>
            <p className="text-3xl md:text-5xl font-light tracking-[0.4em] uppercase text-white mb-12">The Card</p>
            <p className="text-gray-500 mb-12 max-w-sm leading-loose text-lg font-medium">Begin the game. Accept it <span className="w-20 h-[2px] bg-white/20 inline-block align-middle mx-3" /> or walk away.</p>
            <button onClick={onStart} className="px-16 py-5 bg-nebula-pink text-white font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,0,127,0.5)] uppercase">Accept</button>
          </div>
        </div>
      </section>
      
      <footer className="relative py-20 border-t border-white/5 text-center z-10 bg-black">
        <div className="text-2xl font-black tracking-tighter mb-8 opacity-20 uppercase text-white">SPECTRUM</div>
        <p className="text-[10px] text-gray-800 tracking-[0.8em] uppercase font-black">&copy; 2026 MISSION CONTROL. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

// --- GAME PHASES ---

const CalibrationScreen = ({ onSelect, onBack }) => {
  const tiers = [
    { name: 'RECRUIT', difficulty: 'Easy', slots: 4, colors: 4, guesses: 8, icon: Zap },
    { name: 'OPERATIVE', difficulty: 'Medium', slots: 5, colors: 6, guesses: 10, icon: Shield },
    { name: 'MASTER', difficulty: 'Hard', slots: 6, colors: 8, guesses: 12, icon: Target },
  ];
  return (
    <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="min-h-screen flex flex-col items-center justify-center p-6 bg-black z-50 overflow-hidden relative">
      <AnimatedBackButton onClick={onBack} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <motion.h2 initial={{ y: -50 }} animate={{ y: 0 }} className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase">Deployment <span className="text-nebula-cyan">Calibration</span></motion.h2>
      <p className="text-gray-500 font-bold tracking-[0.4em] uppercase mb-16">Select Mission Parameters</p>
      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl">
        {tiers.map((tier) => (
          <motion.div key={tier.name} whileHover={{ scale: 1.05, y: -10 }} onClick={() => onSelect(tier)} className="group cursor-pointer p-8 rounded-2xl border border-white/10 glass transition-all hover:border-nebula-cyan/50 hover:shadow-[0_0_50px_rgba(0,245,255,0.1)]">
            <tier.icon className="w-12 h-12 text-nebula-cyan mb-6 group-hover:rotate-12 transition-transform" />
            <h3 className="text-3xl font-black text-white mb-2 uppercase">{tier.name}</h3>
            <p className="text-nebula-pink text-xs font-bold tracking-widest mb-8 uppercase">{tier.difficulty}</p>
            <div className="space-y-4 text-sm font-medium text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-2"><span>SLOTS</span> <span className="text-white font-black">{tier.slots}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>COLORS</span> <span className="text-white font-black">{tier.colors}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>ATTEMPTS</span> <span className="text-white font-black">{tier.guesses}</span></div>
            </div>
            <button className="mt-10 w-full py-4 bg-transparent border border-nebula-cyan/30 text-nebula-cyan text-xs font-black tracking-widest group-hover:bg-nebula-cyan group-hover:text-black transition-all animate-pulse">INITIALIZE</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ProtocolBriefing = ({ onAccept, onBack }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
    <AnimatedBackButton onClick={onBack} label="ABORT LINK" />
    <div className="max-w-2xl w-full glass p-10 md:p-16 rounded-[2rem] border border-nebula-pink/30 relative">
      <div className="absolute top-0 right-0 p-8 opacity-10"><AlertTriangle className="w-32 h-32 text-nebula-pink" /></div>
      <h2 className="text-4xl font-black text-white mb-10 tracking-tight uppercase">Laws of <span className="text-nebula-pink">the Void</span></h2>
      <div className="space-y-8 mb-12">
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">01</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">The Core Evolves:</span> Logic deepens with ambition. Cipher scales without mercy.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">02</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">No Retractions:</span> Attempts are finite. Waste a guess, lose your life.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">03</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">Trust the Pegs:</span> Black (Correct Place), White (Correct Color). Logic is absolute.</p></div>
        <div className="flex gap-6"><div className="text-2xl font-black text-nebula-pink">04</div><p className="text-gray-400 text-sm leading-relaxed uppercase"><span className="text-white font-bold">Momentum is Life:</span> Decode before the arc drains. Failure results in destruction.</p></div>
      </div>
      <button onClick={onAccept} className="w-full py-5 bg-nebula-pink text-white font-black tracking-[0.3em] uppercase hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,0,127,0.4)]">Initiate Link</button>
    </div>
  </motion.div>
);

const GameBoard = ({ config, onReset }) => {
  const [secret, setSecret] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [gameState, setGameState] = useState('PLAYING');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRevealing, setIsRevealing] = useState(false);
  useEffect(() => { setSecret(generateSecretCode(config.slots, config.colors)); }, [config]);
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const timer = setInterval(() => { setTimeLeft((prev) => { if (prev <= 0) { setGameState('LOST'); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);
  const handleColorSelect = (i) => { if (currentGuess.length < config.slots && gameState === 'PLAYING') setCurrentGuess([...currentGuess, i]); };
  const handleRemoveColor = () => setCurrentGuess(currentGuess.slice(0, -1));
  const handleSubmit = () => {
    if (currentGuess.length !== config.slots) return;
    setIsRevealing(true);
    const result = getFeedback(currentGuess, secret);
    setTimeout(() => {
      const newG = [currentGuess, ...guesses];
      const newF = [result, ...feedback];
      setGuesses(newG); setFeedback(newF); setCurrentGuess([]); setIsRevealing(false);
      if (result.black === config.slots) setGameState('WON');
      else if (newG.length >= config.guesses) setGameState('LOST');
    }, 500);
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24 bg-black relative font-nebula text-white overflow-hidden">
      <AnimatedBackButton onClick={onReset} label="QUIT MISSION" />
      <div className="absolute inset-0 bg-nebula-gradient opacity-20 pointer-events-none" />
      <div className="w-full max-w-2xl flex justify-between items-end mb-12 relative z-10">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-black text-nebula-cyan tracking-[0.4em] uppercase">Mission Status</p>
          <div className="flex gap-2">{secret.map((_, i) => (
            <motion.div key={i} animate={gameState !== 'PLAYING' ? { rotateY: 180 } : {}} className="w-12 h-12 glass border border-white/10 flex items-center justify-center rounded-lg">
              {gameState === 'PLAYING' ? <Lock size={16} className="text-gray-600" /> : <div className="w-6 h-6 rounded-full" style={{ backgroundColor: COLORS[secret[i]] }} />}
            </motion.div>
          ))}</div>
        </div>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <motion.circle cx="48" cy="48" r="40" fill="transparent" stroke={timeLeft < 10 ? "#ff007f" : "#00f5ff"} strokeWidth="4" strokeDasharray="251.2" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 251.2 * (1 - timeLeft / 60) }} transition={{ duration: 1, ease: "linear" }} />
          </svg>
          <div className="absolute text-xl font-black text-white">{timeLeft}s</div>
        </div>
      </div>
      <div className="w-full max-w-2xl glass p-8 rounded-3xl border border-white/5 space-y-4 mb-12 relative z-10 max-h-[50vh] overflow-y-auto no-scrollbar">
        <div className="flex gap-4 items-center">
          <div className="w-8 text-[10px] font-black text-nebula-pink">{guesses.length + 1}</div>
          <div className="flex-1 flex gap-3">{Array.from({ length: config.slots }).map((_, i) => (
            <motion.div key={i} whileTap={{ scale: 0.9 }} onClick={handleRemoveColor} className="flex-1 aspect-square rounded-xl glass border border-nebula-cyan/20 flex items-center justify-center">
              {currentGuess[i] !== undefined && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-[70%] h-[70%] rounded-full shadow-lg" style={{ backgroundColor: COLORS[currentGuess[i]], boxShadow: `0 0 15px ${COLORS[currentGuess[i]]}66` }} />}
            </motion.div>
          ))}</div>
          <div className="w-20 flex justify-center"><button disabled={currentGuess.length !== config.slots || isRevealing} onClick={handleSubmit} className={`w-full py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${currentGuess.length === config.slots ? 'bg-nebula-cyan text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]' : 'bg-white/5 text-gray-500'}`}>TX</button></div>
        </div>
        {guesses.map((g, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-center opacity-60">
            <div className="w-8 text-[10px] font-black text-gray-700">{guesses.length - idx}</div>
            <div className="flex-1 flex gap-3">{g.map((c, i) => (<div key={i} className="flex-1 aspect-square rounded-xl glass border border-white/5 flex items-center justify-center"><div className="w-[60%] h-[60%] rounded-full" style={{ backgroundColor: COLORS[c] }} /></div>))}</div>
            <div className="w-20 flex flex-wrap gap-1 justify-center">{Array.from({ length: feedback[idx].black }).map((_, i) => (<div key={`b-${i}`} className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white]" />))}{Array.from({ length: feedback[idx].white }).map((_, i) => (<div key={`w-${i}`} className="w-2 h-2 rounded-full border border-white/40" />))}</div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 glass px-8 py-6 rounded-full border border-white/10 flex gap-6 z-20">
        {Array.from({ length: config.colors }).map((_, i) => (<motion.button key={i} whileHover={{ scale: 1.2, y: -5 }} whileTap={{ scale: 0.9 }} onClick={() => handleColorSelect(i)} className="w-10 h-10 rounded-full shadow-inner relative group" style={{ backgroundColor: COLORS[i] }} />))}
        <div className="w-[1px] h-10 bg-white/10 mx-2" /><button onClick={handleRemoveColor} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white"><RefreshCw size={20} /></button>
      </motion.div>
      <AnimatePresence>{gameState !== 'PLAYING' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 backdrop-blur-2xl ${gameState === 'WON' ? 'bg-nebula-cyan/10' : 'bg-nebula-pink/10'}`}>
          <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="text-center">
            <div className="mb-8 flex justify-center">{gameState === 'WON' ? <CheckCircle2 className="w-32 h-32 text-nebula-cyan animate-bounce" /> : <XCircle className="w-32 h-32 text-nebula-pink animate-pulse" />}</div>
            <h2 className="text-6xl md:text-8xl font-black text-white mb-4 uppercase">{gameState === 'WON' ? 'Extraction Success' : 'Data Corrupted'}</h2>
            <button onClick={onReset} className="px-16 py-5 bg-white text-black font-black tracking-widest rounded-full hover:scale-105 transition-transform uppercase">Reinitialize</button>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

export default function App() {
  const [phase, setPhase] = useState('LANDING');
  const [gameConfig, setGameConfig] = useState(null);
  return (
    <div className="relative min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {phase === 'LANDING' && (<motion.div key="landing" exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.8 }}><LandingPage onStart={() => setPhase('CALIBRATION')} /></motion.div>)}
        {phase === 'CALIBRATION' && (<CalibrationScreen key="calibration" onBack={() => setPhase('LANDING')} onSelect={(c) => { setGameConfig(c); setPhase('BRIEFING'); }} />)}
        {phase === 'GAME' && (<GameBoard key="game" config={gameConfig} onReset={() => setPhase('CALIBRATION')} />)}
      </AnimatePresence>
      <AnimatePresence>{phase === 'BRIEFING' && (<ProtocolBriefing key="briefing" onBack={() => setPhase('CALIBRATION')} onAccept={() => setPhase('GAME')} />)}</AnimatePresence>
    </div>
  );
}
