import { NavLink } from 'react-router-dom';
import { Mountain, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS, navLabel } from './nav';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const { can, roleLabel } = useRole();
  const { lang, t } = useLang();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-forest-900 via-forest-900 to-forest-950 text-forest-100 transition-[width,transform] duration-300 ease-out',
          collapsed ? 'md:w-[76px]' : 'md:w-[264px]',
          'w-[264px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ice-500/15 text-ice-300 ring-1 ring-inset ring-ice-400/25">
            <Mountain className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[13.5px] font-semibold leading-tight text-white">
                Cardrona Resort
              </p>
              <span className="flex items-center gap-1.5">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ice-300/80">
                  {t('度假村管理系统', 'Management')}
                </p>
                <span className="rounded bg-white/10 px-1 py-px text-[8px] font-bold uppercase tracking-[0.12em] text-white/70 ring-1 ring-inset ring-white/15">
                  {t('演示', 'Demo')}
                </span>
              </span>
            </div>
          )}
          <button
            onClick={onCloseMobile}
            className="ml-auto rounded-md p-1.5 text-forest-200 hover:bg-white/10 md:hidden"
            aria-label={t('关闭菜单', 'Close menu')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="thin-scroll flex-1 overflow-y-auto px-2.5 py-3">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((item) => can(item.key));
            if (!items.length) return null;
            return (
              <div key={section.label[0]} className="mb-3">
                {!collapsed && (
                  <p className="mb-1 px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-forest-300/60">
                    {navLabel(section.label, lang)}
                  </p>
                )}
                {collapsed && <div className="mx-2 mb-2 border-t border-white/5" />}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.key}>
                        <NavLink
                          to={item.path}
                          end={item.path === '/'}
                          onClick={onCloseMobile}
                          title={collapsed ? navLabel(item.label, lang) : undefined}
                          className={({ isActive }) =>
                            cn(
                              'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                              collapsed && 'justify-center px-0',
                              isActive
                                ? 'bg-white/[0.09] font-medium text-white'
                                : 'text-forest-200/85 hover:bg-white/[0.05] hover:text-white'
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span
                                className={cn(
                                  'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-ice-400 transition-opacity',
                                  isActive ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <Icon
                                className={cn(
                                  'h-[16px] w-[16px] shrink-0',
                                  isActive ? 'text-ice-300' : 'text-forest-300 group-hover:text-forest-100'
                                )}
                                strokeWidth={1.9}
                              />
                              {!collapsed && <span className="truncate">{navLabel(item.label, lang)}</span>}
                            </>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-2.5">
          {!collapsed ? (
            <div className="mb-2 rounded-lg bg-white/[0.05] px-3 py-2.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-forest-300/70">
                {t('当前角色', 'Viewing as')}
              </p>
              <p className="mt-0.5 truncate text-[12.5px] font-medium text-white">{roleLabel}</p>
            </div>
          ) : null}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-forest-300 transition-colors hover:bg-white/[0.05] hover:text-white md:flex',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" /> {t('收起侧边栏', 'Collapse sidebar')}
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}