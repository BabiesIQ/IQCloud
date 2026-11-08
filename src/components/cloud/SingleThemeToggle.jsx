import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SingleThemeToggle() {
  const { theme, setTheme } = useTheme();
  const systemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && systemDark);

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="group grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-foreground transition-all duration-500 hover:bg-accent active:scale-95"
    >
      <span key={dark ? 'sun' : 'moon'} className="theme-icon-enter">{dark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}</span>
    </button>
  );
}
