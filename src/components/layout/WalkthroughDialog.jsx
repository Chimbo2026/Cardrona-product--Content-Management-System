import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLang } from '@/lib/i18n';

export default function WalkthroughDialog({ open, onOpenChange }) {
  const { t } = useLang();

  const STEPS = [
    { path: '/dashboard', label: `1 · ${t('管理驾驶舱', 'Executive dashboard')}`, detail: t('从今日预订、营收、人员和山况总览开始。', 'Start with today’s bookings, revenue, staffing and mountain status.') },
    { path: '/bookings', label: `2 · ${t('预订与宾客', 'Bookings & guests')}`, detail: t('创建一条预订，打开详情查看支付与宾客历史。', 'Create a booking, then open it to see payments and guest history.') },
    { path: '/passes', label: `3 · ${t('缆车票', 'Lift passes')}`, detail: t('发放一张缆车票，观察使用中、未使用与已过期数量变化。', 'Issue a pass and watch active, unused and expired counts move.') },
    { path: '/lessons', label: `4 · ${t('课程与排班', 'Lessons & rosters')}`, detail: t('查看每日课程表、容量预警与教练时间冲突。', 'Review the daily roster, capacity warnings and instructor overlaps.') },
    { path: '/operations', label: `5 · ${t('山地运营', 'Mountain operations')}`, detail: t('调整缆车与雪道状态，记录天气观测并处理事件。', 'Change lift and trail status, log a weather observation and resolve an incident.') },
    { path: '/reports', label: `6 · ${t('财务报告', 'Financial Reporting')}`, detail: t('筛选演示交易数据并导出品类汇总。', 'Filter the demo transactions and export the category summary.') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-forest-700" /> {t('演示导览', 'Demo walkthrough')}
          </DialogTitle>
          <DialogDescription>
            {t('这是一条建议的演示路线。每一步都使用虚构示例数据——未连接 Cardrona 任何实时系统。', 'A suggested tour through the prototype. Every step uses fictional sample records — nothing here is connected to Cardrona’s live systems.')}
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-1.5">
          {STEPS.map((s) => (
            <li key={s.path}>
              <Link
                to={s.path}
                onClick={() => onOpenChange(false)}
                className="group flex items-start justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 transition-colors hover:border-forest-200 hover:bg-forest-50/60"
              >
                <span>
                  <span className="block text-[12.5px] font-medium text-forest-900">{s.label}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">{s.detail}</span>
                </span>
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-forest-700" />
              </Link>
            </li>
          ))}
        </ol>
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
          {t('可在右上角头像菜单中切换演示角色，体验宾客服务、运营、教练、租赁及只读管理视角。', 'Use the role switch in the profile menu to demonstrate guest services, operations, instructor, rental and read-only management views.')}
        </p>
      </DialogContent>
    </Dialog>
  );
}
