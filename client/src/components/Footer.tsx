import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { BUSINESS, NAV_LINKS } from '../lib/constants';

export function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <img src="/logo_light.png" alt="GS Motors" className="h-9 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              Second-hand vehicles, inspected and documented, in Kathmandu.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs tracking-[0.2em] text-cream/50">VISIT</p>
            <div className="flex items-start gap-2 text-sm text-cream/80">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>{BUSINESS.address}</span>
            </div>
            <p className="mt-3 font-mono text-xs text-cream/50">{BUSINESS.hours}</p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs tracking-[0.2em] text-cream/50">CONTACT</p>
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2 text-sm text-cream/80 hover:text-cream">
              <Phone size={16} />
              {BUSINESS.phoneDisplay}
            </a>
            <a
              href={BUSINESS.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 text-sm text-cream/80 hover:text-cream"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="mt-2 flex items-center gap-2 text-sm text-cream/80 hover:text-cream">
              <Mail size={16} />
              {BUSINESS.email}
            </a>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs tracking-[0.2em] text-cream/50">QUICK LINKS</p>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-cream/80 hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-cream/10 pt-6">
          <p className="text-xs text-cream/40">© {new Date().getFullYear()} GS Motors. All prices in NPR.</p>
        </div>
      </div>
    </footer>
  );
}
