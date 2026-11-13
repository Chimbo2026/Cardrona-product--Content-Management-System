import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { RoleProvider } from '@/lib/RoleContext';
import { useRole } from '@/lib/RoleContext';
import { ALL_NAV_ITEMS, navLabel } from './nav';
import { useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

function NoAccess({ moduleLabel }) {
  const { roleLabel } = useRole();
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-md rounded-xl border border-border bg-card px-6 py-12 text-center">
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 text-forest-700">
        <Lock className="h-5 w-5" />
      </span>
      <h2 className="text-[16px] font-semibold text-forest-900">{t('此角色无法访问该模块', 'Not available for this role')}</h2>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        {t(`${roleLabel}角色无法打开${moduleLabel || '此模块'}。请在右上角头像菜单中切换角色后继续。`, `The ${roleLabel} role cannot open ${moduleLabel || 'this module'}. Switch roles from the profile menu to continue.`)}
      </p>
      <Link to="/dashboard" className="mt-4 inline-block text-[12px] font-medium text-forest-700 hover:text-forest-900">
        {t('返回驾驶舱 →', 'Return to dashboard →')}
      </Link>
    </div>
  );
}

function Shell() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('cardrona_sidebar') === 'collapsed'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { can } = useRole();
  const { lang, t } = useLang();
  const location = useLocation();

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem('cardrona_sidebar', prev ? 'open' : 'collapsed');
      return !prev;
    });
  };

  const current = ALL_NAV_ITEMS.find((i) =>
    i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)
  );
  const blocked = current && !can(current.key);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggle}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('transition-[padding] duration-300', collapsed ? 'md:pl-[76px]' : 'md:pl-[264px]')}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          {blocked ? <NoAccess moduleLabel={current ? navLabel(current.label, lang) : ''} /> : <Outlet />}
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-2 px-4 pb-6 text-[11px] text-muted-foreground lg:px-8">
          <p className="max-w-3xl">
            {t('Cardrona Resort Management · 演示原型，数据均为虚构示例，并非 Cardrona Alpine Resort 官方系统。', 'Cardrona Resort Management · Demonstration prototype with fictional sample data. Not an official Cardrona Alpine Resort system.')}
          </p>
          <Link to="/support" className="font-medium text-forest-700 transition-colors hover:text-forest-900">
            {t('支持与数据所有权', 'Support & Data Ownership')}
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default function AppShell() {
  return (
    <RoleProvider>
      <Shell />
    </RoleProvider>
  );
}
