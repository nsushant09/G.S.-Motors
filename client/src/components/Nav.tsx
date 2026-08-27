import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { NAV_LINKS, BUSINESS } from '../lib/constants';

interface NavProps {
  transparentAtTop?: boolean;
}

export function Nav({ transparentAtTop = true }: NavProps) {
  const [scrolled, setScrolled] = useState(!transparentAtTop);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!transparentAtTop) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentAtTop]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dark = scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          dark ? 'border-b border-moss/20 bg-bone' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link to="/" className="flex items-center" aria-label="GS Motors home">
            <img
              src={dark ? '/logo_dark.png' : '/logo_light.png'}
              alt="GS Motors"
              className="h-8 w-auto md:h-10"
            />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  dark ? 'text-slate hover:text-forest' : 'text-cream/75 hover:text-cream'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${
                    dark ? 'bg-forest' : 'bg-cream'
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${BUSINESS.phone}`}
              className={`hidden items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors md:inline-flex ${
                dark ? 'bg-forest text-cream hover:bg-forest-deep' : 'bg-cream text-forest hover:bg-cream/90'
              }`}
            >
              <Phone size={13} />
              Call us
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={`inline-flex h-10 w-10 items-center justify-center rounded md:hidden ${
                dark ? 'text-forest' : 'text-cream'
              }`}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-forest"
          >
            <div className="flex h-16 items-center justify-between px-6">
              <img src="/logo_light.png" alt="GS Motors" className="h-8 w-auto" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded text-cream"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-3xl tracking-tight text-cream"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <a
                href={`tel:${BUSINESS.phone}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-forest"
              >
                <Phone size={15} />
                Call us
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
