import { cn } from "@/lib/utils";

interface EagleIconProps {
  className?: string;
  size?: number;
}

export const EagleIcon = ({ className, size = 24 }: EagleIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("", className)}
  >
    {/* Bird body */}
    <path d="M12 8c-2 0-4 1.5-5 4l-4 1c0 0 2.5 2 6 2s6-2 6-2l-4-1c-1-2.5-3-4-5-4" />
    {/* Head */}
    <circle cx="14" cy="6" r="2" />
    {/* Beak */}
    <path d="M16 6l2-1" />
    {/* Eye */}
    <circle cx="14.5" cy="5.5" r="0.5" fill="currentColor" />
    {/* Left wing spread */}
    <path d="M7 13c-3-1-5-3-6-5c1 0 3 1 5 2" />
    {/* Right wing spread */}
    <path d="M17 13c3-1 5-3 6-5c-1 0-3 1-5 2" />
    {/* Tail feathers */}
    <path d="M10 15l-2 5" />
    <path d="M12 15l0 5" />
    <path d="M14 15l2 5" />
  </svg>
);
