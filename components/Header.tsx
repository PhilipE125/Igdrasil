import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { Menu as MenuIcon, X } from 'lucide-react';

type HeaderProps = {
  onContactClick: () => void;
};

const NAV_ITEMS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
] as const;

const Header: React.FC<HeaderProps> = ({ onContactClick }) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={`sticky top-0 w-full z-50 backdrop-blur-md bg-[#faf9f6]/70 transition-shadow duration-200 ${
        hasScrolled ? 'shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <nav
          className="flex items-center justify-between min-h-[48px]"
          aria-label="Primary navigation"
        >
          <a
            href="#top"
            aria-label="Home"
            className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-igdrasil-accent rounded"
          >
            <Logo />
          </a>

          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {NAV_ITEMS.map((item, i) => (
              <React.Fragment key={item.label}>
                <li>
                  <a
                    href={item.href}
                    className="font-mono text-xs uppercase tracking-wider text-gray-700 hover:text-igdrasil-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
                <li aria-hidden className="h-2.5 w-px bg-black/20" />
              </React.Fragment>
            ))}
            <li>
              <button
                type="button"
                onClick={onContactClick}
                className="font-mono text-xs uppercase tracking-wider text-gray-700 hover:text-igdrasil-accent transition-colors focus:outline-none"
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="#waitlist"
              className="px-4 py-2 border border-black/10 rounded-full font-mono text-[11px] uppercase tracking-wider text-gray-900 hover:bg-black/5 transition-colors"
            >
              Join waitlist
            </a>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <a
              href="#waitlist"
              className="px-3 py-1.5 bg-gray-900 text-white rounded-full font-mono text-[11px] uppercase tracking-wider hover:bg-black transition-colors"
            >
              Get started
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="w-10 h-10 flex items-center justify-center border border-black/10 rounded-full text-gray-900 hover:bg-black/5 transition-colors"
            >
              {isMenuOpen ? <X size={14} /> : <MenuIcon size={14} />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-2 border-t border-black/5">
            <ul className="flex flex-col gap-4 list-none m-0 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block font-mono text-sm uppercase tracking-wider text-gray-700 hover:text-igdrasil-accent transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onContactClick();
                  }}
                  className="block font-mono text-sm uppercase tracking-wider text-gray-700 hover:text-igdrasil-accent transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
