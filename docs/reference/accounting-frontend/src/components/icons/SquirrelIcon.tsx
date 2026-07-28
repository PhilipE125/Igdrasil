import { cn } from "@/lib/utils";

interface SquirrelIconProps {
  className?: string;
  size?: number;
}

export const SquirrelIcon = ({ className, size = 24 }: SquirrelIconProps) => (
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
    <path d="M15.236 22a3 3 0 0 0-2.2-5" />
    <path d="M16 20a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2v-2a4 4 0 0 0-4-4V4" />
    <path d="M18 13h.01" />
    <path d="M18 6a4 4 0 0 0-4 4 7 7 0 0 0-7 7c0-5 4-5 4-10.5a4.5 4.5 0 1 0-9 0 2.5 2.5 0 0 0 5 0C7 11 4 13 4 17c0 2.8 2.2 5 5 5h8" />
  </svg>
);
