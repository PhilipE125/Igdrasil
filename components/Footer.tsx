import React from 'react';
import { Plus, ArrowUpRight, Mail, Linkedin } from 'lucide-react';

type FooterProps = {
  onTermsClick: () => void;
  onContactClick: () => void;
};

type LinkItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
};

type Group = { id: string; title: string; links: LinkItem[] };

const Footer: React.FC<FooterProps> = ({ onTermsClick, onContactClick }) => {
  const groups: Group[] = [
    {
      id: 'footer-services',
      title: 'Services',
      links: [
        { label: 'Bookkeeping', href: '#services' },
        { label: 'Payroll', href: '#services' },
        { label: 'VAT', href: '#services' },
        { label: 'Employer Reporting', href: '#services' },
        { label: 'Recurring Reports', href: '#services' },
      ],
    },
    {
      id: 'footer-company',
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Waitlist', href: '#waitlist' },
        { label: 'Contact', onClick: onContactClick },
      ],
    },
    {
      id: 'footer-legal',
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', onClick: onTermsClick },
        { label: 'Terms of Service', onClick: onTermsClick },
        { label: 'GDPR', onClick: onTermsClick },
      ],
    },
  ];

  const linkClass =
    'group inline-flex items-center text-[15px] text-gray-900 hover:text-gray-900 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-igdrasil-accent rounded-sm';

  const linkInner = (label: string) => (
    <>
      <span className="inline-flex items-center justify-center overflow-hidden w-0 opacity-0 transition-all duration-300 group-hover:w-[14px] group-hover:opacity-100 group-hover:mr-2">
        <ArrowUpRight size={14} className="text-igdrasil-accent" />
      </span>
      <span>{label}</span>
    </>
  );

  const renderLink = (link: LinkItem) => {
    if (link.onClick) {
      return (
        <button type="button" onClick={link.onClick} className={linkClass}>
          {linkInner(link.label)}
        </button>
      );
    }
    return (
      <a
        href={link.href}
        className={linkClass}
        {...(link.external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {linkInner(link.label)}
      </a>
    );
  };

  return (
    <footer className="w-full relative z-10 bg-white/50 backdrop-blur-sm border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
      

        <nav
          aria-label="Footer"
          className="grid gap-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0 mb-12 md:mb-16"
        >
          {groups.map((group, index) => (
            <React.Fragment key={group.id}>
              {index > 0 && (
                <div
                  className="hidden md:flex md:flex-col md:items-center md:gap-1.5 md:mx-7"
                  role="separator"
                  aria-hidden
                >
                  <Plus size={12} className="text-igdrasil-accent" />
                  <div className="w-px flex-1 bg-black/10" />
                  <Plus size={12} className="text-igdrasil-accent" />
                </div>
              )}
              <section aria-labelledby={group.id}>
                <h4
                  id={group.id}
                  className="text-base font-medium text-gray-900 mb-4 tracking-tight"
                >
                  {group.title}
                </h4>
                <ul className="flex flex-col gap-2 list-none m-0 p-0">
                  {group.links.map((link) => (
                    <li key={link.label}>{renderLink(link)}</li>
                  ))}
                </ul>
              </section>
            </React.Fragment>
          ))}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-black/5 items-center">
          <p className="font-mono text-xs uppercase tracking-wider text-gray-900 order-2 md:order-1">
            &copy; 2026 &ndash; Igdrasil AB
          </p>
          <nav
            aria-label="Social media"
            className="flex flex-wrap items-center gap-4 md:gap-6 md:justify-end order-1 md:order-2"
          >
            <a
              href="https://www.linkedin.com/company/igdrasil-ab/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-igdrasil-accent transition-colors focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-igdrasil-accent rounded-sm"
              aria-label="LinkedIn (opens in new tab)"
            >
              <Linkedin size={14} />
              LinkedIn
              <ArrowUpRight size={10} className="text-igdrasil-accent" />
            </a>
            <div className="w-px h-2.5 bg-black/15" aria-hidden />
            <a
              href="mailto:support@igdrasil.se"
              className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-igdrasil-accent transition-colors focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-igdrasil-accent rounded-sm"
              aria-label="Email support"
            >
              <Mail size={14} />
              support@igdrasil.se
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
