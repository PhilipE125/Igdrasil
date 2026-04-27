import React from 'react';

const CYCLE_SECONDS = 3.5;

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      <style>{`
        .logo-stack {
          --h: 3rem;
          --base-h: 85;
          --base-w: 84;
          position: relative;
          height: var(--h);
          width: calc(var(--h) * var(--base-w) / var(--base-h));
        }
        .logo-stack img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          animation-duration: ${CYCLE_SECONDS}s;
          animation-iteration-count: infinite;
          animation-timing-function: step-end;
        }
        .logo-stack img:nth-child(1) {
          width: calc(var(--h) * 33 / var(--base-h));
          height: calc(var(--h) * 31 / var(--base-h));
          animation-name: group1;
        }
        .logo-stack img:nth-child(2) {
          width: calc(var(--h) * 33 / var(--base-h));
          height: var(--h);
          animation-name: group2;
        }
        .logo-stack img:nth-child(n+3) {
          width: calc(var(--h) * var(--base-w) / var(--base-h));
          height: var(--h);
        }
        .logo-stack img:nth-child(3) { animation-name: group3; }
        .logo-stack img:nth-child(4) { animation-name: group4; }
        .logo-stack img:nth-child(5) { animation-name: group5; }
        .logo-stack img:nth-child(6) { animation-name: group6; }

        /* Forward 1→6, peak on 6, reverse 5→1, then everything vanishes
           briefly before the next cycle. step-end makes each transition
           an instant snap rather than a fade. */
        /* Forward 1→5 + peak g6 + nano-fast reverse 5→1, then vanish. */
        @keyframes group1 {
          0%   { opacity: 1; }
          8%   { opacity: 0; }
          94%  { opacity: 1; }
          95%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes group2 {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          16%  { opacity: 0; }
          93%  { opacity: 1; }
          94%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes group3 {
          0%   { opacity: 0; }
          16%  { opacity: 1; }
          24%  { opacity: 0; }
          92%  { opacity: 1; }
          93%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes group4 {
          0%   { opacity: 0; }
          24%  { opacity: 1; }
          32%  { opacity: 0; }
          91%  { opacity: 1; }
          92%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes group5 {
          0%   { opacity: 0; }
          32%  { opacity: 1; }
          40%  { opacity: 0; }
          90%  { opacity: 1; }
          91%  { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes group6 {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          90%  { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
      <div className="logo-stack">
        <img src="/logo-frames/group1.svg" alt="" />
        <img src="/logo-frames/group2.svg" alt="" />
        <img src="/logo-frames/group3.svg" alt="" />
        <img src="/logo-frames/group4.svg" alt="" />
        <img src="/logo-frames/group5.svg" alt="" />
        <img src="/logo-frames/group6.svg" alt="Igdrasil AB" />
      </div>
      <span className="font-light tracking-[0.12em] text-2xl text-neutral-900 dark:text-neutral-100">
        IGDRASIL<span className="font-bold text-neutral-500 ml-1">AB</span>
      </span>
    </div>
  );
};

export default Logo;
