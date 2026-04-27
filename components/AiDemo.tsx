import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowUp, CheckCircle2 } from 'lucide-react';

// Step meaning: 0 empty → 1 user 1 → 2 agent 1 typing → 3 agent 1 reply
//             → 4 user 2 → 5 agent 2 typing → 6 agent 2 reply (hold) → loop
const STEP_DURATIONS = [800, 700, 1300, 2600, 700, 1200, 4800];

const TypingDots: React.FC = () => (
  <div className="bg-white border border-black/5 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1.5">
    <span
      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"
      style={{ animationDelay: '0ms', animationDuration: '1.1s' }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"
      style={{ animationDelay: '180ms', animationDuration: '1.1s' }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"
      style={{ animationDelay: '360ms', animationDuration: '1.1s' }}
    />
  </div>
);

const AiDemo: React.FC = () => {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStep(6);
      return;
    }
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % STEP_DURATIONS.length),
      STEP_DURATIONS[step]
    );
    return () => window.clearTimeout(id);
  }, [step, reducedMotion]);

  const visible = (threshold: number) => step >= threshold;
  const typing1 = !reducedMotion && step === 2;
  const typing2 = !reducedMotion && step === 5;

  const rowBase =
    'transition-all duration-500 ease-out will-change-[opacity,transform]';
  const rowOn = 'opacity-100 translate-y-0';
  const rowOff = 'opacity-0 translate-y-2 pointer-events-none';

  const Avatar = (
    <div className="w-7 h-7 rounded-full bg-igdrasil-accent/20 border border-igdrasil-accent/40 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles size={12} className="text-gray-900" />
    </div>
  );

  return (
    <section
      id="assistant"
      aria-labelledby="assistant-heading"
      className="max-w-3xl mx-auto pt-12 pb-8 border-t border-black/5 scroll-mt-24"
    >
      <div className="text-center mb-10">
        <p className="text-sm font-mono uppercase tracking-wider mb-4">
          <span className="text-igdrasil-accent font-medium">03</span>
          <span className="text-gray-400 mx-2">&mdash;</span>
          <span className="text-igdrasil-accent">Assistant</span>
        </p>
        <h2
          id="assistant-heading"
          className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight"
        >
          Your books, in conversation.
        </h2>
        <p className="text-base text-gray-600 font-light mt-3 max-w-xl mx-auto leading-relaxed">
          Stop digging through reports. Just ask.
        </p>
      </div>

      {/* Glow halo behind the box */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 rounded-[2rem] bg-igdrasil-accent/15 blur-2xl pointer-events-none"
        />

        <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-2xl bg-white">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-black/5 bg-white/60 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-black/10" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-black/10" aria-hidden />
            <span className="w-2.5 h-2.5 rounded-full bg-black/10" aria-hidden />
            <span className="ml-3 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
              Igdrasil Assistant
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                <span className="relative rounded-full w-1.5 h-1.5 bg-green-500" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">
                Live
              </span>
            </span>
          </div>

          {/* Chat */}
          <div
            className="px-5 sm:px-8 py-7 space-y-5 text-left bg-gradient-to-b from-[#fafaf9] to-white"
            style={{ minHeight: '340px' }}
            aria-live="polite"
          >
            {/* User 1 */}
            <div
              className={`flex justify-end ${rowBase} ${visible(1) ? rowOn : rowOff}`}
            >
              <div className="max-w-[78%] bg-gray-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm font-light">
                What's my VAT this quarter?
              </div>
            </div>

            {/* Agent 1 */}
            <div
              className={`flex items-start gap-3 ${rowBase} ${visible(2) ? rowOn : rowOff}`}
            >
              {Avatar}
              {typing1 ? (
                <TypingDots />
              ) : (
                <div
                  className={`max-w-[78%] bg-white border border-black/5 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-900 font-light leading-relaxed shadow-sm transition-opacity duration-300 ${
                    visible(3) ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-1">
                    VAT this quarter
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-base font-medium tracking-tight text-gray-900">
                      32,450 SEK
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-igdrasil-accent/15 border border-igdrasil-accent/30 text-gray-900 font-medium">
                      Due 12 May
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    <span>
                      Fortnox &middot; 47 invoices
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* User 2 */}
            <div
              className={`flex justify-end ${rowBase} ${visible(4) ? rowOn : rowOff}`}
            >
              <div className="max-w-[78%] bg-gray-900 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm font-light">
                Set a reminder a week before.
              </div>
            </div>

            {/* Agent 2 */}
            <div
              className={`flex items-start gap-3 ${rowBase} ${visible(5) ? rowOn : rowOff}`}
            >
              {Avatar}
              {typing2 ? (
                <TypingDots />
              ) : (
                <div
                  className={`max-w-[78%] bg-white border border-black/5 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-900 font-light leading-relaxed shadow-sm transition-opacity duration-300 ${
                    visible(6) ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    <span className="font-medium text-gray-900">
                      Reminder set
                    </span>
                  </div>
                  <div className="text-[12.5px] text-gray-500 mt-1 ml-[23px]">
                    5 May, 09:00 &middot; VAT payment
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-black/5 bg-white flex items-center gap-3">
            <span className="flex-1 text-sm text-gray-400 font-light flex items-center">
              Ask anything
              <span
                className="inline-block w-px h-3.5 bg-gray-400 ml-0.5 animate-pulse"
                style={{ animationDuration: '1.1s' }}
                aria-hidden
              />
            </span>
            <span
              className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 shadow-sm"
              aria-hidden
            >
              <ArrowUp size={14} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiDemo;
