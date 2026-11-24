import { Check, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRole } from '@/lib/RoleContext';
import { ROLES, ROLE_KEYS } from '@/lib/roles';
import { useLang } from '@/lib/i18n';
import { initials } from '@/lib/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const { role, roleDetail, setRole } = useRole();
  const { lang, t } = useLang();
  const pick = (pair) => (lang === 'zh' ? pair[0] : pair[1]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-forest-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-800 text-[11px] font-semibold text-white">
            {initials(user?.full_name || 'Demo Admin')}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[140px] truncate text-[12.5px] font-medium leading-tight text-forest-900">
              {user?.full_name || t('演示管理员', 'Demo Administrator')}
            </span>
            <span className="block text-[10.5px] text-muted-foreground">{pick(ROLES[role]?.label)}</span>
          </span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2.5">
          <p className="truncate text-[13px] font-medium text-forest-900">
            {user?.full_name || t('演示管理员', 'Demo Administrator')}
          </p>
          <p className="truncate text-[11.5px] text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> {t('演示角色', 'Demo role')}
        </DropdownMenuLabel>
        {ROLE_KEYS.map((key) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => setRole(key)}
            className="flex items-start gap-2 py-2"
          >
            <span className="mt-0.5 w-3.5">
              {role === key && <Check className="h-3.5 w-3.5 text-forest-700" />}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium text-forest-900">
                {pick(ROLES[key].label)}
              </span>
              <span className="block text-[11px] leading-snug text-muted-foreground">
                {pick(ROLES[key].detail)}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-3 py-1.5 text-[10.5px] leading-snug text-muted-foreground">
          {t('当前角色：', 'Current: ')}
          {pick(roleDetail)}
        </p>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()} className="gap-2">
          <LogOut className="h-3.5 w-3.5" /> {t('退出登录', 'Sign out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}