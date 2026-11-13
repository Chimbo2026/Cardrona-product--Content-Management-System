import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Mountain, HelpCircle } from 'lucide-react';
import { ALL_NAV_ITEMS, navLabel } from './nav';
import { useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import GlobalSearch from './GlobalSearch';
import WalkthroughDialog from './WalkthroughDialog';
import NotificationsMenu from './NotificationsMenu';
import ProfileMenu from './ProfileMenu';

export default function Topbar({ onOpenMobile }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLang();
  const current = [...ALL_NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((i) => (i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)));

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-forest-900 hover:bg-forest-50 md:hidden"
          aria-label={t('打开菜单', 'Open menu')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2 md:hidden">
          <Mountain className="h-4 w-4 text-forest-700" />
          <span className="truncate font-heading text-[13px] font-semibold text-forest-900">
            Cardrona
          </span>
        </div>

        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <p className="truncate text-[13px] font-medium text-forest-900">
            {current ? navLabel(current.label, lang) : t('度假村管理', 'Resort Management')}
          </p>
          <span className="rounded border border-forest-200 bg-forest-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-forest-700">
            {t('演示', 'Demo')}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border bg-white p-0.5" role="group" aria-label={t('切换语言', 'Switch language')}>
            {[
              ['zh', '中文'],
              ['en', 'EN'],
            ].map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-semibold transition-colors',
                  lang === code ? 'bg-forest-900 text-white' : 'text-muted-foreground hover:text-forest-900'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-border bg-white px-2.5 py-2 text-[12.5px] text-muted-foreground transition-colors hover:border-forest-200 hover:text-forest-900 md:flex md:w-[260px]"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">{t('搜索度假村…', 'Search resort…')}</span>
            <kbd className="rounded border border-border px-1 text-[10px]">⌘K</kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-forest-800 hover:bg-forest-50 md:hidden"
            aria-label={t('搜索', 'Search')}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={() => setWalkthroughOpen(true)}
            className="hidden rounded-lg p-2 text-forest-800 hover:bg-forest-50 sm:block"
            aria-label={t('演示导览', 'Demo walkthrough')}
            title={t('打开演示导览', 'Open the demo walkthrough')}
          >
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
          <NotificationsMenu />
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <ProfileMenu />
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <WalkthroughDialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen} />
    </header>
  );
}