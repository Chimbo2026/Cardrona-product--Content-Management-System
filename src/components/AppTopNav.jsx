import { Link, useLocation } from 'react-router-dom';
import { Mountain, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const LINKS = [
  { path: '/tickets', zh: '雪票', en: 'Passes' },
  { path: '/rentals', zh: '租赁', en: 'Rentals' },
  { path: '/lessons', zh: '课程', en: 'Lessons' },
];

export default function AppTopNav() {
  const { pathname } = useLocation();
  const { bi } = useLanguage();
  const accountActive = pathname === '/me';

  return (
    <header className="z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border/70 bg-background/95 px-3 backdrop-blur">
      <Link to="/" className="flex shrink-0 items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Mountain className="h-3.5 w-3.5" />
        </span>
        <span className="font-heading text-[13px] font-semibold tracking-tight">
          {bi('雪峰', 'Peak')}
        </span>
      </Link>

      <nav className="ml-auto flex items-center gap-0.5">
        {LINKS.map((item) => {
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-full px-2 py-1 text-[11px] transition ${
                active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'
              }`}
            >
              {bi(item.zh, item.en)}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/me"
        aria-label={bi('我的账户', 'My account')}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
          accountActive
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-foreground/70'
        }`}
      >
        <User className="h-3.5 w-3.5" />
      </Link>
    </header>
  );
}