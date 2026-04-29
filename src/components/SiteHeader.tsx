"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
} from "@/components/icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navDropdowns, navLinks, siteCopy } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Click-outside closes the dropdown
  useEffect(() => {
    if (!openId) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <div ref={headerRef} className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none">
      <header
        role="banner"
        data-state={openId || menuOpen ? "active" : "inactive"}
        className={cn(
          "pointer-events-auto relative bg-popover/50 ring-1 ring-border shadow-md shadow-black/[0.065] rounded-xl backdrop-blur-xl",
          "transition-[max-width,padding] duration-300 ease-out",
          openId ? "max-w-[640px] py-1.5 px-1.5" : "max-w-xl py-1.5 pl-1.5 pr-1.5",
          menuOpen && "max-lg:max-w-[calc(100vw-2rem)]",
        )}
      >
        <div className="flex items-center gap-1">
          {/* Logo + wordmark */}
          <Link
            aria-label="home"
            href="/"
            className="flex items-center gap-2 px-2 py-1 rounded-md text-foreground hover:bg-foreground/5 transition-colors shrink-0"
          >
            <Image src="/logo.svg" alt="" width={20} height={20} className="size-5" />
            <span className="font-display text-sm font-semibold tracking-tight">Igdrasil</span>
          </Link>
          <div className="h-5 w-px bg-foreground/10 mx-1.5 shrink-0" aria-hidden="true" />

          {/* Desktop nav */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5">
            {navDropdowns.map((d) => {
              const isOpen = openId === d.label;
              return (
                <div key={d.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    data-state={isOpen ? "open" : "closed"}
                    onClick={() =>
                      setOpenId((cur) => (cur === d.label ? null : d.label))
                    }
                    className={cn(
                      "group inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                      isOpen
                        ? "bg-foreground/5 text-foreground"
                        : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {d.label}
                    <ChevronDownIcon
                      className={cn(
                        "size-3 opacity-75 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </div>
              );
            })}
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-foreground/75 hover:bg-foreground/5 hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <Link
              href={siteCopy.authBar.signUp.href}
              className="hidden lg:inline-flex h-8 items-center rounded-md bg-foreground px-3 text-xs font-semibold text-background shadow-[inset_0_-2px_0_0_rgba(0,0,0,0.2)] hover:bg-foreground/85 hover:shadow-none transition-all"
            >
              {siteCopy.authBar.signUp.label}
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden h-8 w-8 grid place-items-center text-foreground rounded-md hover:bg-foreground/5 transition-colors"
            >
              {menuOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
            </button>
          </div>
        </div>

        {/* Dropdown viewport (desktop) */}
        <div
          className={cn(
            "hidden lg:grid absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 w-[600px]",
            "transition-all duration-200 ease-out origin-top",
            openId
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-1 scale-[0.98] pointer-events-none",
          )}
        >
          <div className="rounded-xl bg-popover/80 ring-1 ring-border shadow-md shadow-black/[0.1] backdrop-blur-xl p-2">
            {navDropdowns.map((d) =>
              openId === d.label ? (
                <ul key={d.label} className="grid grid-cols-2 gap-0.5">
                  {d.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenId(null)}
                        className="block rounded-md p-3 hover:bg-foreground/5 transition-colors"
                      >
                        <div className="text-sm font-semibold text-foreground">
                          {item.label}
                        </div>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null,
            )}
          </div>
        </div>

        {/* Mobile sheet — expanded below the bubble when menuOpen */}
        {menuOpen && (
          <div className="lg:hidden mt-2 pt-3 border-t border-border">
            <div className="flex flex-col gap-1">
              {navDropdowns.map((d) => (
                <details key={d.label} className="group">
                  <summary className="flex h-9 items-center justify-between rounded-md px-3 text-sm font-medium text-foreground/85 list-none cursor-pointer hover:bg-foreground/5">
                    {d.label}
                    <ChevronDownIcon className="size-3 opacity-75 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="mt-1 mb-2 ml-2 flex flex-col gap-0.5">
                    {d.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm text-foreground/85 hover:bg-foreground/5 hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="h-9 flex items-center rounded-md px-3 text-sm font-medium text-foreground/85 hover:bg-foreground/5 hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={siteCopy.authBar.signUp.href}
                  className="h-9 inline-flex items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-background"
                >
                  {siteCopy.authBar.signUp.label}
                </Link>
                <Link
                  href={siteCopy.authBar.logIn.href}
                  className="h-9 inline-flex items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground"
                >
                  {siteCopy.authBar.logIn.label}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
