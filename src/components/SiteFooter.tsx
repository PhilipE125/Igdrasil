import Image from "next/image";
import Link from "next/link";
import { LinkedInIcon, XSocialIcon } from "@/components/icons";
import { footerColumns, siteCopy } from "@/lib/content";

export function SiteFooter() {
  const f = siteCopy.footer;
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-10">
          <div>
            <Link
              aria-label="go home"
              href="/"
              className="inline-flex items-center gap-0 text-foreground hover:opacity-80 transition-opacity"
            >
              <Image src="/igdrasil_logo.svg" alt="" width={44} height={44} className="size-10" />
              <span className="font-display text-xl font-semibold tracking-wider">
                Igdrasil
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">{f.tagline}</p>
            <div className="mt-5 flex items-center gap-2">
              <Link
                href={f.twitter}
                aria-label="X/Twitter"
                className="size-9 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
              >
                <XSocialIcon className="size-4" />
              </Link>
              <Link
                href={f.linkedin}
                aria-label="LinkedIn"
                className="size-9 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
              >
                <LinkedInIcon className="size-4" />
              </Link>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-subtle-foreground">
                {col.heading}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} {f.copyrightHolder}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
