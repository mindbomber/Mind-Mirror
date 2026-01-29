
import React from 'react';

interface RoundTransitionProps {
  roundNumber: number;
  themeName: string;
  description: string;
  onContinue: () => void;
}

const RoundTransition: React.FC<RoundTransitionProps> = ({ roundNumber, themeName, description, onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="max-w-md text-center">
        <div className="inline-block px-4 py-1 mb-4 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 text-sm font-semibold tracking-wider uppercase">
          Phase {roundNumber}
        </div>
        <h2 className="text-4xl md:text-5xl font-serif mb-6 gradient-text font-bold">
          {themeName}
        </h2>
        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          {description}
        </p>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          Begin Exploration
        </button>
      </div>
    </div>
  );
};

export default RoundTransition;
