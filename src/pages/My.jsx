import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronRight,
  CircleHelp,
  Heart,
  LogOut,
  Mail,
  Share2,
  Ticket,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useAuth } from '@/lib/AuthContext';
import { useAgent } from '@/lib/AgentContext';
import { useFavourites } from '@/lib/favourites';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function My() {
  const { bi } = useLanguage();
  const { user } = useCurrentUser();
  const { isAuthenticated, logout } = useAuth();
  const { agent, logout: logoutAgent } = useAgent();
  const favourites = useFavourites();
  const name = (user?.full_name || user?.email || bi('普通访客', 'Normal visitor')).trim();
  const initial = name.charAt(0).toUpperCase();

  const rows = [
    {
      label: bi('我的预订', 'My bookings'),
      detail: bi('预订记录与电子票', 'Bookings and e-tickets'),
      icon: Ticket,
      to: '/orders',
    },
    {
      label: bi('已保存项目', 'Saved items'),
      detail: favourites.length ? bi(`已保存 ${favourites.length} 项`, `${favourites.length} saved`) : bi('收藏雪票与商店商品', 'Saved passes and store items'),
      icon: Heart,
      to: '/favorites',
    },
    ...(agent
      ? [{
          label: bi('代理分销中心', 'Agent distribution centre'),
          detail: bi('折扣码、订单与佣金', 'Discount codes, orders and commission'),
          icon: Share2,
          to: '/agent',
        }]
      : []),
    {
      label: bi('雪山信息与帮助', 'Mountain info & help'),
      detail: bi('交通、雪道及常见问题', 'Access, trails and FAQs'),
      icon: CircleHelp,
      to: '/info',
    },
  ];

  return (
    <div className="space-y-3 px-4 pb-8 pt-4">
      <div className="rounded-2xl border border-border bg-card p-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-[16px] text-accent-foreground">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{name}</p>
            {agent ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-900">
                <BadgeCheck className="h-3 w-3" /> Gold agent · {agent.rate}% off
              </span>
            ) : (
              <span className="mt-1 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">
                {bi('普通访客', 'Normal visitor')}
              </span>
            )}
          </div>
          {isAuthenticated && (
            <Button variant="outline" className="h-7 shrink-0 rounded-full px-2.5 text-[9px]" onClick={() => logout()}>
              <LogOut className="mr-1 h-3 w-3" /> {bi('退出', 'Log out')}
            </Button>
          )}
        </div>
        {agent && (
          <button type="button" onClick={logoutAgent} className="mt-2.5 w-full border-t border-border pt-2 text-center text-[9px] text-muted-foreground">
            {bi('退出代理模式', 'Exit agent mode')}
          </button>
        )}
        {!agent && !isAuthenticated && (
          <p className="mt-2.5 border-t border-border pt-2 text-center text-[9px] text-muted-foreground">
            {bi('已经是代理？', 'Already an agent?')} <Link to="/agent" className="font-medium text-primary">{bi('代理登录', 'Agent login')}</Link>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground">{bi('邮箱', 'Email')}</p>
            <p className="truncate text-[11px]">{user?.email || bi('访客模式', 'Guest mode')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border/70 px-3.5 py-2.5">
          <UserRound className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-[9px] text-muted-foreground">{bi('姓名', 'Name')}</p>
            <p className="truncate text-[11px]">{isAuthenticated ? user?.full_name || user?.email : bi('普通访客', 'Normal visitor')}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <Link key={row.to} to={row.to} className={`flex items-center gap-3 px-3.5 py-2.5 transition hover:bg-secondary/50 ${index > 0 ? 'border-t border-border/70' : ''}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11.5px]">{row.label}</span>
                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">{row.detail}</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>

      {!isAuthenticated && (
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="h-9 rounded-full text-[10px]"><Link to="/login">{bi('登录', 'Sign in')}</Link></Button>
          <Button asChild className="h-9 rounded-full text-[10px]"><Link to="/register">{bi('注册', 'Create account')}</Link></Button>
        </div>
      )}

      <p className="pt-1 text-center text-[9px] text-muted-foreground">
        {bi('演示版本 · 支付与 Aspenware 同步为模拟流程', 'Demo build · payments and Aspenware sync are simulated')}
      </p>
    </div>
  );
}
