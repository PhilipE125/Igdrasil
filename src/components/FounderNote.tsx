import Image from "next/image";
import Link from "next/link";
import { LinkedInIcon, XSocialIcon } from "@/components/icons";
import { founderNote } from "@/lib/content";

export function FounderNote() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-12 text-center">
        <p className="font-display text-2xl md:text-3xl lg:text-[34px] leading-snug text-foreground">
          {founderNote.body[0]}
        </p>
        <p className="font-display mt-6 text-2xl md:text-3xl lg:text-[34px] leading-snug text-foreground">
          We believe in a future where everything{" "}
          <em className="italic">just works</em>
          {" "}— all your work in one place, done automatically. All you have to do is press a button and go touch grass.
        </p>

        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-3">
            {founderNote.team.map((member) => (
              <Image
                key={member.name}
                src={member.avatar}
                alt={member.name}
                width={64}
                height={64}
                className="size-12 rounded-full object-cover"
              />
            ))}
          </div>
          <div className="text-sm font-semibold text-foreground">{founderNote.name}</div>
          <div className="text-xs text-muted-foreground">{founderNote.title}</div>
          <div className="mt-2 flex items-center gap-2">
            <Link
              href={founderNote.twitter}
              aria-label="Founder on X"
              className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              <XSocialIcon className="size-3.5" />
            </Link>
            <Link
              href={founderNote.linkedin}
              aria-label="Founder on LinkedIn"
              className="size-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            >
              <LinkedInIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
