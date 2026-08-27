import { useEffect } from 'react';

const SITE_NAME = 'GS Motors';

/** Sets the document title and meta description for the current page (client-rendered SPA). */
export function usePageMeta(title: string, description: string, ogImage?: string) {
  useEffect(() => {
    document.title = title === SITE_NAME ? SITE_NAME : `${title} — ${SITE_NAME}`;

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    if (ogImage) setMeta('property', 'og:image', ogImage);
  }, [title, description, ogImage]);
}
