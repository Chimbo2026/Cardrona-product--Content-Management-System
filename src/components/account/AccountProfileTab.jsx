import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Heart,
  HelpCircle,
  LayoutDashboard,
  Map as MapIcon,
  LogOut,
  Mail,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import { useAuth } from '@/lib/AuthContext';
import { useFavourites } from '@/lib/favourites';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AccountProfileTab({ user }) {
  const { bi } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const favourites = useFavourites();

  return (
    <div className="mt-3 space-y-3 px-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          <Mail className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">{bi('邮箱', 'Email')}</p>
            <p className="truncate text-[12.5px]">{user?.email || bi('未登录', 'Not signed in')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border/70 px-4 py-3">
          <UserRound className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">{bi('姓名', 'Name')}</p>
            <p className="truncate text-[12.5px]">
              {(isAuthenticated && (user?.full_name || user?.email)) || bi('游客浏览', 'Browsing as guest')}
            </p>
          </div>
        </div>
        {!isAuthenticated && (
          <div className="flex gap-2 border-t border-border/70 px-4 py-3">
            <Button asChild variant="outline" className="h-8 flex-1 rounded-full text-[11px]">
              <Link to="/login">{bi('登录', 'Sign in')}</Link>
            </Button>
            <Button asChild className="h-8 flex-1 rounded-full text-[11px]">
              <Link to="/register">{bi('注册', 'Sign up')}</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Link
          to="/favorites"
          className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Heart className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px]">{bi('我的收藏', 'Saved items')}</span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
              {favourites.length > 0
                ? bi(`已收藏 ${favourites.length} 件`, `${favourites.length} saved`)
                : bi('收藏的雪票与商店单品', 'Saved passes and store items')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        <Link
          to="/info"
          className="flex items-center gap-3 border-t border-border/70 px-4 py-3 transition hover:bg-secondary/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <HelpCircle className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px]">{bi('山地信息与帮助', 'Mountain info & help')}</span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
              {bi('交通、雪道与常见问题', 'Access, trails and FAQs')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        <Link
          to="/map"
          className="flex items-center gap-3 border-t border-border/70 px-4 py-3 transition hover:bg-secondary/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <MapIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px]">{bi('功能地图', 'Feature map')}</span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
              {bi('全部功能一览', 'Every feature in one view')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        <Link
          to="/features"
          className="flex items-center gap-3 border-t border-border/70 px-4 py-3 transition hover:bg-secondary/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <MapIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px]">{bi('全部功能', 'All features')}</span>
            <span className="mt-0.5 block truncate text-[10.5px] text-muted-foreground">
              {bi('按板块列出的完整功能清单', 'The full feature list by section')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-3 border-t border-border/70 px-4 py-3 transition hover:bg-secondary/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 text-[13px]">{bi('管理后台', 'Admin console')}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
        <span className="text-[13px]">{bi('语言 / Language', 'Language / 语言')}</span>
        <LanguageToggle />
      </div>

      {isAuthenticated && (
        <Button
          variant="outline"
          className="h-10 w-full rounded-full text-[12px]"
          onClick={() => logout()}
        >
          <LogOut className="h-3.5 w-3.5" /> {bi('退出登录', 'Sign out')}
        </Button>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        {bi(
          '演示环境 · 支付与 Aspenware 对接为模拟流程',
          'Demo build · payments and Aspenware sync are simulated',
        )}
      </p>
    </div>
  );
}