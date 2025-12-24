
import React, { useState, useEffect, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { COLORS, TreeState } from '../constants';

interface UIOverlayProps {
  mode: TreeState;
  onToggleMode: () => void;
  selectedWish: string | null;
  onClearWish: () => void;
  isMuted: boolean;
  onToggleMusic: () => void;
  handStatus: string;
  magnifiedItem: string | null;
  onCloseMagnification: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, 
  onToggleMode, 
  selectedWish, 
  onClearWish,
  isMuted,
  onToggleMusic,
  handStatus,
  magnifiedItem,
  onCloseMagnification
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 overflow-hidden z-20">
      {/* Header */}
      <div className="pointer-events-auto flex justify-between items-start">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-serif text-[#D4AF37] leading-tight drop-shadow-lg">
            ARIX <br />
            <span className="text-white opacity-90 italic">Signature Morph</span>
          </h1>
          <p className="text-[#D4AF37]/70 tracking-[0.2em] uppercase text-[10px] mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Gesture Control Active: {handStatus}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={onToggleMusic} className="bg-white/5 border border-[#D4AF37]/30 w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center pointer-events-auto">
             {isMuted ? '🔇' : '🔊'}
          </button>
          <button onClick={onToggleMode} className="bg-[#D4AF37]/20 border border-[#D4AF37] px-6 py-2 rounded-full text-white font-serif italic backdrop-blur-md pointer-events-auto">
             {mode === TreeState.TREE ? "Deconstruct" : "Manifest Tree"}
          </button>
        </div>
      </div>

      {/* Hand Gesture HUD (Bottom Left) */}
      <div className="absolute bottom-6 left-6 pointer-events-none flex flex-col gap-2">
          <div className="w-32 h-24 bg-black/40 backdrop-blur-xl border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-2xl">
             <canvas id="hud-canvas" className="w-full h-full opacity-80" />
             <div className="absolute top-1 left-2 text-[8px] text-[#D4AF37] uppercase tracking-widest">Live Hand Tracking</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-tighter">
            ✊ Fist: Tree | ✋ Open: Scatter | 🤏 Grab: View
          </div>
      </div>

      {/* Magnification Escape */}
      {magnifiedItem && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <button 
            onClick={onCloseMagnification}
            className="mt-[400px] pointer-events-auto bg-[#D4AF37] text-emerald-950 px-8 py-2 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform"
           >
             Close View
           </button>
        </div>
      )}

      {/* AI Concierge (Bottom Right) */}
      {!magnifiedItem && (
        <div className="pointer-events-auto self-end w-full md:w-[400px] bg-black/60 backdrop-blur-2xl border border-[#D4AF37]/40 rounded-2xl p-6 shadow-2xl transition-all duration-700">
           <p className="text-sm text-[#D4AF37] font-serif italic mb-2">Arix Concierge Intelligence</p>
           <p className="text-white text-lg leading-snug italic font-serif">
             {selectedWish || "The festive stardust awaits your hand gesture. Use an open palm to explore, or a fist to return to symmetry."}
           </p>
        </div>
      )}
    </div>
  );
};
