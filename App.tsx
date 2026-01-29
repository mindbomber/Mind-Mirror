
import React, { useState, useCallback } from 'react';
import { AppStatus, Question, UserAnswer, ROUND_THEMES, ArchetypeResult, Option } from './types';
import { GeminiService } from './services/geminiService';
import QuestionCard from './components/QuestionCard';
import RoundTransition from './components/RoundTransition';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [roundIndex, setRoundIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState('');

  const currentTheme = ROUND_THEMES[roundIndex];

  const fetchQuestionsForRound = useCallback(async (idx: number, currentAnswers: UserAnswer[]) => {
    setStatus(AppStatus.LOADING_QUESTIONS);
    setLoadingMsg(`The Story Weaver is drafting ${ROUND_THEMES[idx].name}...`);
    try {
      const q = await GeminiService.generateRoundQuestions(idx + 1, ROUND_THEMES[idx].name, currentAnswers);
      setQuestions(q);
      setQuestionIndex(0);
      setStatus(AppStatus.TRANSITIONING);
    } catch (error: any) {
      handleApiError(error);
    }
  }, []);

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    setLoadingMsg("The narrative thread has snapped. Let us try to mend it...");
    setTimeout(() => setStatus(AppStatus.IDLE), 3000);
  };

  const handleStart = () => {
    fetchQuestionsForRound(0, []);
  };

  const handleAnswer = (option: Option) => {
    const currentQuestion = questions[questionIndex];
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      selectedOptionText: option.text,
      round: roundIndex + 1
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    } else {
      if (roundIndex < ROUND_THEMES.length - 1) {
        const nextRound = roundIndex + 1;
        setRoundIndex(nextRound);
        fetchQuestionsForRound(nextRound, updatedAnswers);
      } else {
        finalizeArchetype(updatedAnswers);
      }
    }
  };

  const finalizeArchetype = async (finalAnswers: UserAnswer[]) => {
    setStatus(AppStatus.ANALYZING);
    setLoadingMsg("Calculating the culmination of your choices...");
    try {
      const analysis = await GeminiService.analyzeArchetype(finalAnswers);
      setResult(analysis);
      setStatus(AppStatus.REVEALED);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const resetQuiz = () => {
    setRoundIndex(0);
    setQuestions([]);
    setQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setStatus(AppStatus.IDLE);
  };

  const renderContent = () => {
    switch (status) {
      case AppStatus.IDLE:
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-3xl mx-auto px-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              Begin your <span className="gradient-text">Odyssey</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
              This is not a quiz. It is a story where your choices weave the fabric of your soul's identity. 
              Step into the mirror.
            </p>
            <button
              onClick={handleStart}
              className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-indigo-100 transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/10"
            >
              Enter the Dream
            </button>
          </div>
        );

      case AppStatus.LOADING_QUESTIONS:
      case AppStatus.ANALYZING:
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
            <div className="relative w-32 h-32 mb-8">
               <div className="absolute inset-0 border-2 border-indigo-500/5 rounded-full"></div>
               <div className="absolute inset-0 border-2 border-t-indigo-400 rounded-full animate-spin"></div>
               <div className="absolute inset-4 border border-purple-500/10 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xl font-serif italic text-indigo-300 tracking-wide">{loadingMsg}</p>
          </div>
        );

      case AppStatus.TRANSITIONING:
        return (
          <RoundTransition
            roundNumber={roundIndex + 1}
            themeName={currentTheme.name}
            description={currentTheme.description}
            onContinue={() => setStatus(AppStatus.ANSWERING)}
          />
        );

      case AppStatus.ANSWERING:
        const progress = ((roundIndex * 3 + questionIndex) / (ROUND_THEMES.length * 3)) * 100;
        return (
          <div className="flex flex-col min-h-[80vh] py-12 px-4">
            <div className="w-full max-w-2xl mx-auto mb-12">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-semibold text-indigo-400 tracking-[0.3em] uppercase">
                  {currentTheme.name}
                </span>
                <span className="text-[10px] text-slate-500 tracking-widest uppercase">
                  Echo {questionIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] progress-bar" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <QuestionCard 
              question={questions[questionIndex]} 
              onSelect={handleAnswer} 
            />
          </div>
        );

      case AppStatus.REVEALED:
        if (!result) return null;
        return (
          <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in text-center">
            <div className="mb-12">
              <div className="inline-block px-4 py-1 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-widest uppercase">
                Your Legend is Written
              </div>
              <h1 className="text-6xl md:text-8xl font-serif mb-8 gradient-text font-bold leading-tight italic drop-shadow-sm">
                {result.title}
              </h1>
            </div>

            <div className="glass p-8 md:p-14 rounded-[3rem] border border-white/5 mb-16 max-w-3xl mx-auto text-left shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 p-8 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                 <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-indigo-400 font-semibold tracking-[0.2em] uppercase text-[10px] mb-8 border-l-2 border-indigo-500/50 pl-4">The Traveler's Essence</h3>
                <p className="text-xl md:text-2xl text-slate-200 leading-[1.8] font-serif italic mb-12">
                  {result.description}
                </p>

                <div>
                  <h3 className="text-indigo-400 font-semibold tracking-[0.2em] uppercase text-[10px] mb-8 border-l-2 border-indigo-500/50 pl-4">Manifested Virtues</h3>
                  <div className="flex flex-wrap gap-4">
                    {result.traits.map(trait => (
                      <span key={trait} className="px-6 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-slate-300 text-sm font-light hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all cursor-default">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-8">
              <button
                onClick={resetQuiz}
                className="px-12 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
              >
                Dream Anew
              </button>
              <p className="mt-8 text-slate-500 text-[10px] uppercase tracking-[0.4em]">
                The mirror fades, but the legend remains.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 bg-[#030712] text-[#f9fafb] flex flex-col">
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-serif font-bold italic tracking-tighter cursor-pointer group" onClick={resetQuiz}>
          <span className="text-slate-400 group-hover:text-white transition-colors">MIND</span>
          <span className="text-indigo-500 group-hover:text-indigo-400 transition-colors">MIRROR</span>
        </div>
        {status !== AppStatus.IDLE && status !== AppStatus.REVEALED && (
          <button 
            onClick={() => { if(window.confirm("Abandon this journey? Your choices will be lost to the void.")) resetQuiz(); }} 
            className="text-[10px] uppercase tracking-[0.3em] text-slate-600 hover:text-red-400 transition-colors"
          >
            Shatter
          </button>
        )}
      </nav>

      <main className="container mx-auto flex-grow flex flex-col justify-center">
        {renderContent()}
      </main>

      <footer className="py-10 text-center text-slate-800 text-[9px] tracking-[0.5em] uppercase pointer-events-none">
        Cognitive Exploration Collective // Protocol 9.2 // Established 2024
      </footer>
    </div>
  );
};

export default App;
