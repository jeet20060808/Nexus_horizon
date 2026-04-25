import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ChevronDown, Zap, Shield, Target, Clock, Rocket, Menu, Circle, Square, Triangle } from 'lucide-react';
import heroImg from './assets/hero.png';
import cardImg from './assets/card.png';

const Navbar = () => (
  <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
    <div className="text-xl md:text-2xl font-black text-white tracking-tighter flex items-center gap-2">
      <span className="text-nebula-pink">Q</span>UEST <span className="text-gray-500 font-light">PRO</span>
    </div>
    <div className="hidden lg:flex gap-16 text-[10px] font-black tracking-[0.5em] text-gray-500">
      <a href="#" className="hover:text-white transition-colors">ABOUT THE MISSION</a>
      <a href="#" className="hover:text-white transition-colors">PRICING</a>
      <a href="#" className="hover:text-white transition-colors">ENCRYPT</a>
    </div>
    <button className="px-8 py-3 bg-nebula-pink text-white text-[10px] font-black tracking-[0.3em] rounded-full hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,0,127,0.4)]">
      PLAY MISSION
    </button>
  </nav>
);

const SectionHeading = ({ children, subtitle }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="mb-20">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-nebula-pink text-xs font-black tracking-[0.6em] mb-6 uppercase"
      >
        {subtitle}
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tighter"
      >
        {children}
      </motion.h2>
    </div>
  );
};

const LawCard = ({ number, title, description, icon: Icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0.1, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      className="flex gap-12 items-start py-20 border-b border-white/5 group"
    >
      <div className="text-7xl md:text-9xl font-black text-nebula-pink/10 group-hover:text-nebula-pink/30 transition-colors duration-700">{number}</div>
      <div className="pt-4">
        <h3 className="text-2xl md:text-4xl font-black mb-8 text-white uppercase group-hover:text-nebula-cyan transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 max-w-md leading-loose text-sm md:text-base font-medium tracking-wide">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const { scrollYProgress } = useScroll();
  
  return (
    <div className="relative min-h-screen bg-black selection:bg-nebula-cyan selection:text-nebula-dark overflow-x-hidden font-nebula text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center z-10 overflow-hidden">
        <div className="relative flex items-center justify-center w-full max-w-[1400px] px-4">
          
          {/* Main Background Text "READY" */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-[15vw] md:text-[18rem] font-black tracking-[-0.05em] text-nebula-pink leading-none select-none z-0 flex justify-center items-center w-full text-center"
          >
            <span className="inline-block px-[2vw]">READY</span>
          </motion.div>
          
          {/* Masked Head Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="absolute z-20 w-[250px] md:w-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="absolute inset-0 bg-nebula-pink/20 blur-[100px] rounded-full" />
            <div className="relative z-10" style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 85%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 85%)' }}>
              <img 
                src={heroImg} 
                alt="Mask" 
                className="w-full h-auto brightness-125"
              />
            </div>
          </motion.div>

          {/* Subtext - Moved little down as requested */}
          <div className="absolute right-0 md:right-[5%] top-[55%] -translate-y-1/2 flex flex-col items-start z-30 pointer-events-none">
            <div className="flex flex-col">
              <span className="text-3xl md:text-5xl font-light text-white tracking-[0.2em] uppercase opacity-90 leading-none">TO</span>
              <span className="text-3xl md:text-5xl font-light text-white tracking-[0.2em] uppercase opacity-90 leading-none">REACH?</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Logos, Symbols, and Play Game Button below icons */}
        <div className="absolute bottom-10 flex flex-col items-center gap-8 z-40">
          <div className="text-2xl font-black tracking-tighter opacity-80">
            <span className="text-nebula-pink">Q</span>UEST <span className="text-gray-500 font-light">PRO</span>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-12 text-white/30">
              <Circle size={24} className="hover:text-nebula-cyan cursor-pointer transition-colors" />
              <Square size={24} className="hover:text-nebula-pink cursor-pointer transition-colors" />
              <Triangle size={24} className="hover:text-white cursor-pointer transition-colors" />
            </div>
            
            {/* Play Game Button moved here, below symbols */}
            <button className="px-10 py-3 bg-nebula-pink text-white text-[12px] font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,0,127,0.6)] uppercase">
              Play Game
            </button>
          </div>
        </div>
      </section>

      {/* Laws Section */}
      <section className="relative py-60 px-6 max-w-7xl mx-auto z-10">
        <SectionHeading subtitle="SURVIVAL PROTOCOL">RULES OF SURVIVAL</SectionHeading>
        
        <div className="grid md:grid-cols-2 gap-x-24 gap-y-10">
          <LawCard 
            number="1" 
            title="THE CORE EVOLVES" 
            description="The logic deepens with your ambition. Choose your difficulty tier wisely—the Cipher scales from Recruit to Master without mercy, increasing the slots and colors you must master."
            icon={Zap}
          />
          <LawCard 
            number="2" 
            title="NO RETRACTIONS" 
            description="Attempts are finite. Every submitted row is a permanent record in the void. Waste a guess, and the system moves one step closer to a permanent lockout. In the void, precision is the only currency."
            icon={Shield}
          />
          <LawCard 
            number="3" 
            title="TRUST THE PEGS" 
            description="Your intuition is flawed; the algorithm is absolute. When the black and white feedback pegs reveal the truth, believe the HUD—the two-pass matching logic handles duplicates with cold, mathematical certainty."
            icon={Target}
          />
          <LawCard 
            number="4" 
            title="MOMENTUM IS LIFE" 
            description="The clock is an arc of depleting urgency. Decode the sequence before the SVG timer drains and your session self-destructs into data dust. Seconds in the core are the difference between the leaderboard and the abyss."
            icon={Clock}
          />
        </div>
      </section>

      {/* Showcase Section */}
      <section className="relative py-60 overflow-hidden z-10 bg-black/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle="INTEL GATHERED">INSIDE THE GAME</SectionHeading>
        </div>
        
        <div className="flex gap-12 px-10 overflow-x-auto pb-24 no-scrollbar snap-x">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -20, scale: 1.02 }}
              className="min-w-[340px] md:min-w-[600px] aspect-video bg-nebula-gray rounded-sm overflow-hidden relative group snap-center cursor-pointer"
            >
              <img 
                src={heroImg} 
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-60 transition-all duration-1000 grayscale group-hover:grayscale-0"
                style={{ filter: `hue-rotate(${i * 45}deg) brightness(0.8)` }}
                alt={`Level ${i}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <div className="absolute bottom-12 left-12 z-20">
                <h4 className="text-4xl md:text-5xl font-black mb-4 text-white">LEVEL 0{i}</h4>
                <p className="text-xs text-nebula-pink font-black tracking-[0.4em] uppercase">ACCESS GRANTED</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden z-10 py-60">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-widest opacity-20">WELCOME PLAYERS</h2>
        </div>

        <div className="relative z-20 flex flex-col md:flex-row items-center gap-20 max-w-6xl w-full">
          <div className="absolute -inset-40 bg-nebula-pink/10 blur-[200px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ rotate: 10, y: 50 }}
            whileInView={{ rotate: -8, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative z-10"
          >
            <img 
              src={cardImg} 
              alt="Mission Card" 
              className="w-full max-w-md drop-shadow-[0_0_80px_rgba(255,0,127,0.4)]"
            />
          </motion.div>
          
          <div className="text-center md:text-left">
            <h3 className="text-8xl md:text-[10rem] font-black text-nebula-pink leading-none mb-4">HOLD</h3>
            <p className="text-3xl md:text-5xl font-light tracking-[0.4em] uppercase text-white mb-12">THE CARD</p>
            <p className="text-gray-500 mb-12 max-w-sm leading-loose text-lg font-medium">
              Begin the game. Accept it <span className="w-20 h-[2px] bg-white/20 inline-block align-middle mx-3" /> or walk away.
            </p>
            <button className="px-16 py-5 bg-nebula-pink text-white font-black tracking-[0.3em] rounded-full hover:scale-110 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,0,127,0.5)] uppercase">
              ACCEPT
            </button>
          </div>
        </div>
      </section>

      <footer className="relative py-20 border-t border-white/5 text-center z-10 bg-black">
        <div className="text-2xl font-black tracking-tighter mb-8 opacity-20">QUEST PRO</div>
        <p className="text-[10px] text-gray-800 tracking-[0.8em] uppercase font-black">&copy; 2026 MISSION CONTROL. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
