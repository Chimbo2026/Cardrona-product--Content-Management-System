import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon,
  Mountain,
  Ticket,
  ClipboardList,
  User,
  LayoutDashboard,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import HelpFab from '@/components/support/HelpFab';
import { isCustomerView, stopCustomerView } from '@/lib/customerView';
import { useFavourites } from '@/lib/favourites';

const TABS = [
  { key: 'home', path: '/', icon: HomeIcon },
  { key: 'passes', path: '/tickets', icon: Mountain },
  { key: 'booking', path: '/booking', icon: Ticket },
  { key: 'orders', path: '/orders', icon: ClipboardList },
  { key: 'me', path: '/me', icon: User },
];

export default function MiniShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { t } = useLanguage();
  const favourites = useFavourites();
  const mainRef = useRef(null);
  const [customerView, setCustomerView] = useState(() => isCustomerView());

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0 });
  }, [pathname]);

  const isAdmin = user?.role === 'admin';
  const previewAsCustomer = isAdmin && customerView;
  const tabs = TABS;
  const isHome = pathname === '/';

  // 从分享链接直接进入详情页时，返回键不应退出小程序，回到首页
  const goBack = () => {
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/');
  };

  // 详情页底部有固定购买条，悬浮客服按钮会挡住按钮
  const hasBottomBar =
    pathname.startsWith('/product/') || pathname.startsWith('/booking/') || pathname.startsWith('/configure/') || pathname.startsWith('/bike/') || pathname === '/pass-cart';

  const exitCustomerView = () => {
    stopCustomerView();
    setCustomerView(false);
    navigate('/admin');
  };

  const titleKey =
    pathname === '/'
      ? 'title.home'
      : pathname === '/me'
        ? 'title.me'
        : pathname === '/booking'
          ? 'tickets.title'
          : pathname.startsWith('/shop')
        ? 'shop.title'
        : pathname.startsWith('/tickets')
          ? 'tickets.title'
          : pathname.startsWith('/lessons/first-timer')
            ? 'firstTimer.title'
          : pathname.startsWith('/lessons')
            ? 'lessons.title'
          : pathname.startsWith('/rentals')
            ? 'rentals.title'
          : pathname.startsWith('/favorites')
            ? 'favorites.title'
            : pathname.startsWith('/info')
              ? 'title.info'
              : pathname.startsWith('/resort')
                ? 'title.resort'
            : pathname === '/map'
              ? 'title.map'
            : pathname === '/features'
              ? 'title.features'
            : pathname === '/pass-cart'
              ? 'title.cart'
            : pathname.startsWith('/orders')
        ? 'nav.orders'
        : pathname.startsWith('/order')
          ? 'title.order'
          : pathname.startsWith('/product')
            ? 'title.product'
            : pathname.startsWith('/configure')
              ? 'title.configure'
            : pathname.startsWith('/bike')
              ? 'title.bike'
            : pathname.startsWith('/booking')
              ? 'title.booking'
              : pathname.startsWith('/agent')
                ? 'nav.agent'
                : 'title.home';
  const title = t(titleKey);

  return (
    <div className="min-h-screen flex justify-center bg-[#31465f] md:py-10">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background md:h-[880px] md:max-w-[430px] md:rounded-[2rem] md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)]">
        {!isHome && (
          <header className="z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/85 px-4 backdrop-blur">
            <button
              type="button"
              onClick={goBack}
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
              aria-label={t('common.back')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-0 flex-1 truncate font-heading text-[15px] font-semibold">{title}</span>
            <LanguageToggle />
          </header>
        )}

        {previewAsCustomer && (
          <div className="z-10 flex shrink-0 items-center justify-between gap-2 border-b border-accent/40 bg-accent/10 px-4 py-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/75">
              <Eye className="h-3.5 w-3.5" /> {t('view.customer')}
            </span>
            <button
              type="button"
              onClick={exitCustomerView}
              className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-[3px] text-[10.5px] font-medium text-background transition hover:bg-foreground/85"
            >
              <LayoutDashboard className="h-3 w-3" /> {t('view.exit')}
            </button>
          </div>
        )}

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <Outlet />
        </main>

        {!hasBottomBar && <HelpFab />}

        <nav className="z-20 flex shrink-0 items-center justify-around border-t border-border/70 bg-background/95 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur">
          {tabs.map((tab) => {
            const bookingArea =
              pathname.startsWith('/booking/') ||
              pathname.startsWith('/configure/') ||
              pathname.startsWith('/bike/') ||
              pathname === '/pass-cart';
            const active =
              tab.path === '/'
                ? pathname === '/'
                : tab.key === 'booking'
                  ? bookingArea || pathname === '/booking'
                  : tab.key === 'passes'
                    ? pathname.startsWith('/tickets') || pathname.startsWith('/product/')
                  : tab.key === 'me'
                    ? pathname === '/me' || pathname.startsWith('/agent') || pathname.startsWith('/favorites') || pathname.startsWith('/info')
                  : pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] transition ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="relative">
                  <Icon className={`h-[19px] w-[19px] ${active ? 'stroke-[2.4]' : 'stroke-[1.7]'}`} />
                  {tab.key === 'me' && favourites.length > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                      {favourites.length}
                    </span>
                  )}
                </span>
                <span className={tab.key === 'booking' ? 'text-[11px] font-semibold tracking-wide' : ''}>
                  {t(`nav.${tab.key}`)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
