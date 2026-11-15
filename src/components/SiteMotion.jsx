import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '@/site-motion.css';

// Route-level entrance and opt-in-on-visibility reveals are kept separate from form state.
// Only offscreen sections/cards are prepared for scroll reveals, so the first viewport
// never flashes hidden while React mounts a page or async data finishes loading.
export default function SiteMotion({ children }) {
  const { pathname } = useLocation();
  const rootRef = useRef(null);
  const lastPathRef = useRef(pathname);

  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      if (!window.location.hash) window.scrollTo(0, 0);
    }
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const seen = new WeakSet();
    let frame = 0;
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('iq-is-visible');
        intersection.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

    const scan = () => {
      frame = 0;
      const candidates = root.querySelectorAll('section, article, [data-iq-reveal], .grid > a, .grid > div');
      let count = 0;
      for (const node of candidates) {
        if (count++ > 120) break;
        if (seen.has(node)) continue;
        if (node.closest('[role="dialog"], [data-no-reveal]')) continue;
        const rect = node.getBoundingClientRect();
        if (rect.height < 32 || rect.width < 60) continue;
        if (rect.top < window.innerHeight * 0.87 || rect.bottom <= 0) continue;
        seen.add(node);
        node.classList.add('iq-scroll-reveal');
        intersection.observe(node);
      }
    };
    const scheduleScan = () => {
      if (!frame) frame = window.requestAnimationFrame(scan);
    };
    scheduleScan();

    // Pages refresh server lists asynchronously; observe only newly inserted content.
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(root, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      intersection.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <div key={pathname} ref={rootRef} className="iq-page-enter" data-iq-motion-root>{children}</div>;
}
