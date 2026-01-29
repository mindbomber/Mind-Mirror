
import React from 'react';
import { Question, Option } from '../types';

interface QuestionCardProps {
  question: Question;
  onSelect: (option: Option) => void;
  isLoading?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelect, isLoading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in flex flex-col items-center">
      {question.narrativeContext && (
        <div className="mb-8 p-6 glass rounded-2xl border-indigo-500/20 text-slate-300 italic font-serif text-lg leading-relaxed text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 bg-[#030712] text-indigo-400 text-[10px] tracking-[0.3em] uppercase">
            The Story Unfolds
          </div>
          "{question.narrativeContext}"
        </div>
      )}
      
      <h3 className="text-xl md:text-2xl font-serif mb-8 text-center leading-relaxed text-white">
        {question.text}
      </h3>
      
      <div className="grid grid-cols-1 gap-4 w-full">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            disabled={isLoading}
            className={`
              glass group relative overflow-hidden p-6 text-left transition-all duration-300
              hover:bg-indigo-500/10 hover:border-indigo-500/50 hover:translate-x-1
              rounded-xl disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center gap-4">
              <span className="flex-none w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-colors">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-lg text-slate-200 group-hover:text-white">
                {option.text}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
