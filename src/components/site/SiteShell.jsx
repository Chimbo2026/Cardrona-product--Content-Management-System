import { Link, Outlet } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { useLang } from '@/lib/i18n';

export default function SiteShell() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-6">
          <Link to="/site" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-900 text-white">
              <Mountain className="h-4 w-4" />
            </span>
            <span className="font-heading text-[15px] font-semibold tracking-[0.08em] text-forest-950">
              CARDRONA
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-[12.5px] font-medium text-forest-900">
            <Link to="/site" className="hover:text-forest-600">
              {t('首页', 'Home')}
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full border border-border px-3 py-1.5 transition-colors hover:bg-muted"
            >
              {t('返回后台', 'Back to dashboard')}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border/70 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-6 text-[11.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Cardrona Alpine Resort</span>
          <span>{t('内容由 Website Builder 管理', 'Content managed in the Website Builder')}</span>
        </div>
      </footer>
    </div>
  );
}
