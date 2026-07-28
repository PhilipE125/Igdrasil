"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Copy,
  History,
  Plus,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

const STEP_DURATIONS = [800, 700, 1300, 3200, 700, 1200, 5200];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 180, 360].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse"
          style={{ animationDelay: `${delay}ms`, animationDuration: "1.1s" }}
        />
      ))}
    </div>
  );
}

function ActionIcons() {
  return (
    <div className="flex items-center gap-3 mt-2 text-gray-400">
      <Copy size={14} className="cursor-pointer hover:text-gray-600" />
      <ThumbsUp size={14} className="cursor-pointer hover:text-gray-600" />
      <ThumbsDown size={14} className="cursor-pointer hover:text-gray-600" />
    </div>
  );
}

export function ChatAssistantCard({ active = true }: { active?: boolean }) {
  const [step, setStep] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (active && !reducedMotion) setStep(0);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      setStep(6);
      return;
    }
    if (!active) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % STEP_DURATIONS.length),
      STEP_DURATIONS[step],
    );
    return () => window.clearTimeout(id);
  }, [step, reducedMotion, active]);

  const visible = (threshold: number) => step >= threshold;
  const typing1 = !reducedMotion && step === 2;
  const typing2 = !reducedMotion && step === 5;

  const rowBase =
    "transition-all duration-500 ease-out will-change-[opacity,transform]";
  const rowOn = "opacity-100 translate-y-0";
  const rowOff = "opacity-0 translate-y-2 pointer-events-none";

  return (
    <div className="relative w-full">
      <div className="relative rounded-2xl overflow-hidden border border-black/10 shadow-2xl bg-[#f4f3f1] h-[540px] flex flex-col">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-black/5 bg-[#f4f3f1]">
          <span className="text-[13px] font-medium text-gray-900">
            Chat Assistant
          </span>
          <div className="ml-auto flex items-center gap-3 text-gray-500">
            <History size={16} className="cursor-pointer hover:text-gray-800" />
            <Plus size={16} className="cursor-pointer hover:text-gray-800" />
            <X size={16} className="cursor-pointer hover:text-gray-800" />
          </div>
        </div>

        {/* Chat */}
        <div
          className="px-5 sm:px-7 py-6 space-y-5 text-left bg-[#f4f3f1] flex-1 overflow-y-auto"
          aria-live="polite"
        >
          {/* User: hi */}
          <div
            className={`flex justify-end ${rowBase} ${visible(1) ? rowOn : rowOff}`}
          >
            <div className="max-w-[78%] bg-[#ee8fe0] text-gray-900 rounded-2xl rounded-tr-md px-4 py-2 text-sm">
              hi
            </div>
          </div>

          {/* Agent: greeting */}
          <div className={`${rowBase} ${visible(2) ? rowOn : rowOff}`}>
            {typing1 ? (
              <TypingDots />
            ) : (
              <div
                className={`text-sm text-gray-900 leading-relaxed transition-opacity duration-300 ${
                  visible(3) ? "opacity-100" : "opacity-0"
                }`}
              >
                <p>
                  Hej! I am your Igdrasil accounting assistant. How can I help
                  you with your bookkeeping, invoices, or Fortnox integrations
                  today?
                </p>
                <ActionIcons />
              </div>
            )}
          </div>

          {/* User: VAT question */}
          <div
            className={`flex justify-end ${rowBase} ${visible(4) ? rowOn : rowOff}`}
          >
            <div className="max-w-[78%] bg-[#ee8fe0] text-gray-900 rounded-2xl rounded-tr-md px-4 py-2 text-sm">
              What&apos;s my VAT this quarter?
            </div>
          </div>

          {/* Agent: live reasoning */}
          <div className={`${rowBase} ${visible(5) ? rowOn : rowOff}`}>
            {typing2 ? (
              <TypingDots />
            ) : (
              <div
                className={`text-sm text-gray-900 leading-relaxed transition-opacity duration-300 ${
                  visible(6) ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center gap-1.5 text-gray-700">
                  <span
                    className="w-3 h-3 rounded-full border-2 border-[#ee8fe0] border-t-transparent animate-spin"
                    style={{ animationDuration: "1.4s" }}
                  />
                  <span className="text-[13px] text-gray-700 font-light">
                    3 steps in progress
                  </span>
                  <ChevronDown size={13} className="text-gray-400 ml-0.5" />
                </div>
                <div className="mt-3 pl-3 border-l-2 border-[#ee8fe0] space-y-1.5">
                  <div className="text-[11px] font-light uppercase tracking-[0.15em] text-gray-400">
                    Working
                  </div>
                  <div className="text-[12.5px] text-gray-500 italic leading-relaxed font-light">
                    …the core of the query: understanding the user&apos;s VAT
                    liability for this quarter. I&apos;ve noted the request,
                    which specifies a VAT position is sought, which includes
                    the quarter and its relation to today&apos;s date. The user
                    wants a direct answer.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 bg-[#f4f3f1]">
          <div className="flex items-center gap-2 bg-white border border-[#ee8fe0]/60 rounded-2xl px-3 py-2.5 shadow-sm">
            <Image
              src="/owl.png"
              alt=""
              aria-hidden
              width={24}
              height={24}
              className="w-6 h-6 shrink-0 object-contain"
            />
            <span className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0 text-gray-500 cursor-pointer">
              <Plus size={16} />
            </span>
            <span className="flex-1 text-sm text-gray-400 font-light flex items-center">
              Ask about your finances or Swedish tax rules…
              <span
                className="inline-block w-px h-3.5 bg-gray-400 ml-0.5 animate-pulse"
                style={{ animationDuration: "1.1s" }}
              />
            </span>
            <span className="w-8 h-8 rounded-full bg-[#ee8fe0] text-white flex items-center justify-center shrink-0">
              <Send size={14} className="-ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Caption below the card */}
      <div className="mt-5 px-1">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Conversational
        </h3>
        <p className="text-sm text-gray-500 font-light mt-1 leading-relaxed">
          Ask anything about your finances and get clear, sourced answers in
          plain language.
        </p>
      </div>
    </div>
  );
}
