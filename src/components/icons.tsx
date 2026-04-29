import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Circular Micro mark — the "o" from the wordmark, used in the floating bubble nav. */
export function MicroMarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 471 471" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M235.46 336.293C291.148 336.293 336.293 291.149 336.293 235.46C336.293 179.772 291.148 134.628 235.46 134.628C179.772 134.628 134.627 179.772 134.627 235.46C134.627 291.149 179.772 336.293 235.46 336.293ZM235.46 391.168C321.455 391.168 391.168 321.455 391.168 235.46C391.168 149.465 321.455 79.7527 235.46 79.7527C149.465 79.7527 79.7525 149.465 79.7525 235.46C79.7525 321.455 149.465 391.168 235.46 391.168Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** The Micro wordmark logo, viewBox 0 0 95 22, currentColor. */
export function MicroLogoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 95 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3079 9.25599V21.9561H18.481L18.481 18.8389V9.25599C18.481 6.48297 20.7498 4.235 23.5484 4.235C26.347 4.235 28.6158 6.48297 28.6158 9.25599V21.9561H32.7889V9.25599C32.7889 4.19931 28.6518 0.100067 23.5484 0.100067C20.6644 0.100067 18.089 1.40915 16.3944 3.46032C14.6999 1.40915 12.1245 0.100067 9.2405 0.100067C4.13711 0.100067 0 4.19931 0 9.25599V21.9561H4.17313V9.25599C4.17313 6.48297 6.44187 4.235 9.2405 4.235C12.0391 4.235 14.3079 6.48297 14.3079 9.25599Z"
        fill="currentColor"
      />
      <path d="M34.0731 21.9561V0.100067H38.2463V21.9561H34.0731Z" fill="currentColor" />
      <path
        d="M49.8514 22C47.7968 22 45.9751 21.5395 44.3862 20.6186C42.7974 19.6976 41.5646 18.411 40.688 16.7586C39.8114 15.0792 39.373 13.1696 39.373 11.0297C39.373 8.88984 39.8114 6.99374 40.688 5.34143C41.5646 3.68911 42.7974 2.40247 44.3862 1.48151C45.9751 0.560548 47.7968 0.100067 49.8514 0.100067C52.2895 0.100067 54.3441 0.736615 56.0152 2.00971C57.7136 3.25572 58.7409 4.94866 59.097 7.08854L55.3166 7.77927H55.1522C54.9057 6.53326 54.303 5.51749 53.3442 4.73197C52.3854 3.94644 51.2348 3.55367 49.8925 3.55367C47.9749 3.55367 46.4271 4.2444 45.2492 5.62584C44.0712 6.9802 43.4822 8.78149 43.4822 11.0297C43.4822 13.278 44.0712 15.0928 45.2492 16.4742C46.4271 17.8557 47.9749 18.5464 49.8925 18.5464C51.317 18.5464 52.5087 18.1536 53.4675 17.3681C54.4263 16.5555 55.0427 15.4178 55.3166 13.9551L59.2614 14.6865C58.8231 16.9618 57.7547 18.7495 56.0563 20.0497C54.3852 21.3499 52.3169 22 49.8514 22Z"
        fill="currentColor"
      />
      <path
        d="M60.3721 10.4994C60.3721 4.75628 65.071 0.100067 70.8675 0.100067H73.7992V4.21345H70.8675C67.3638 4.21345 64.5235 7.02793 64.5235 10.4994V21.8546H60.3721V10.4994Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M83.8948 18.1233C87.8666 18.1233 91.0863 14.9341 91.0863 11C91.0863 7.06586 87.8666 3.87664 83.8948 3.87664C79.9231 3.87664 76.7034 7.06586 76.7034 11C76.7034 14.9341 79.9231 18.1233 83.8948 18.1233ZM83.8948 21.9999C90.0281 21.9999 95 17.0751 95 11C95 4.92485 90.0281 0 83.8948 0C77.7616 0 72.7897 4.92485 72.7897 11C72.7897 17.0751 77.7616 21.9999 83.8948 21.9999Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Used as expand caret next to nav dropdowns and accordions. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/** Sun (theme toggle, light mode) — drawn outline style to match site. */
export function SunIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

/** Moon — theme toggle, dark mode. */
export function MoonIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

/** Play (filled triangle) — used by music player and video buttons. */
export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="6" y="4" width="4" height="16" rx="0.5" />
      <rect x="14" y="4" width="4" height="16" rx="0.5" />
    </svg>
  );
}

export function SkipBackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 5L9 12l10 7V5zM5 5h2v14H5z" />
    </svg>
  );
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 5l10 7-10 7V5zM17 5h2v14h-2z" />
    </svg>
  );
}

export function XSocialIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M20.452 20.452h-3.554v-5.569c0-1.327-.025-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.357V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

/** Search */
export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

/** Plus (used in some CTAs). */
export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Arrow right (used in CTA chips). */
export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

/** Download (email signup form CTA). */
export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
