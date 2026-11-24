import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRightLeft, CircleDollarSign, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import StatCard from '@/components/common/StatCard';
import { SearchInput, SelectNative } from '@/components/common/Controls';
import RefundManagerTable from '@/components/refunds/RefundManagerTable';
import RefundFailureDialog from '@/components/refunds/RefundFailureDialog';
import ManualFallbackDialog from '@/components/refunds/ManualFallbackDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD } from '@/lib/format';
import { REFUND_FAILURE_REASONS, resolveManualRefund } from '@/lib/refunds';
import { useToast } from '@/components/ui/use-toast';

const STATUSES = ['Pending', 'Approved', 'Processing', 'Processed', 'Failed', 'Manual required', 'Rejected'];

export default function Refunds() {
  const { can } = useRole();
  const { t, lang } = useLang();
  const { toast } = useToast();
  const canWrite = can('refunds', 'write');

  const { items: refunds, loading, reload } = useList('RefundRequest', {}, { sort: '-created_date', limit: 200 });

  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [failing, setFailing] = useState(null);
  const [fallback, setFallback] = useState(null);

  const totals = useMemo(() => {
    const sum = (rows) => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const pending = refunds.filter((r) => r.status === 'Pending');
    const inFlight = refunds.filter((r) => ['Approved', 'Processing'].includes(r.status));
    const broken = refunds.filter((r) => ['Failed', 'Manual required'].includes(r.status));
    const done = refunds.filter((r) => r.status === 'Processed');
    return { pending, inFlight, broken, done, sum };
  }, [refunds]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return refunds.filter((r) => {
      if (status !== 'All' && r.status !== status) return false;
      if (!term) return true;
      return [r.request_ref, r.guest_name, r.booking_ref].join(' ').toLowerCase().includes(term);
    });
  }, [refunds, status, search]);

  const resolve = async (refund) => {
    await resolveManualRefund(refund, t('人工补救已完成', 'Manual fallback delivered'), 'Refund desk');
    toast({ title: t('退款已结案', 'Refund resolved'), description: `${refund.request_ref} · ${NZD(refund.amount)}` });
    reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客与销售', 'Guests & sales')}
        title={t('退款管理', 'Refund manager')}
        description={t('跟踪退款进度、记录渠道失败原因，并为失败的退款安排人工补救方案。', 'Track refunds, record provider failures and arrange a manual fallback when a refund cannot complete.')}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('待审批', 'Awaiting decision')}
          value={totals.pending.length}
          sub={NZD(totals.sum(totals.pending))}
          icon={RotateCcw}
          tone="amber"
        />
        <StatCard
          label={t('退款处理中', 'In progress')}
          value={totals.inFlight.length}
          sub={NZD(totals.sum(totals.inFlight))}
          icon={CircleDollarSign}
          tone="ice"
        />
        <StatCard
          label={t('失败待补救', 'Failed / manual')}
          value={totals.broken.length}
          sub={NZD(totals.sum(totals.broken))}
          icon={AlertTriangle}
          tone="rose"
        />
        <StatCard
          label={t('已退款', 'Refunded')}
          value={totals.done.length}
          sub={NZD(totals.sum(totals.done))}
          icon={ArrowRightLeft}
          tone="forest"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title={t('退款申请', 'Refund requests')}
          description={t(`${visible.length} 条记录`, `${visible.length} records`)}
          bodyClassName="p-0"
        >
          <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={setSearch} placeholder={t('搜索单号、宾客或预订…', 'Search reference, guest or booking…')} className="sm:w-64" />
            <SelectNative
              ariaLabel={t('状态', 'Status')}
              value={status}
              onChange={setStatus}
              includeAll
              allLabel={t('全部状态', 'All statuses')}
              options={STATUSES.map((s) => ({ value: s, label: tx(s, lang) }))}
              className="sm:ml-auto"
            />
          </div>
          <RefundManagerTable
            refunds={visible}
            loading={loading}
            canWrite={canWrite}
            onFail={setFailing}
            onFallback={setFallback}
            onResolve={resolve}
          />
        </Panel>

        <Panel title={t('退款规则与失败处理', 'Refund rules & fallbacks')}>
          <ul className="space-y-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
            {[
              t('退款只退回原支付方式，无法转到其他账户。', 'Refunds only return to the original payment method — never another account.'),
              t('渠道提交后无法取消；宾客通常 3–5 个工作日收到款项。', 'A submitted refund cannot be cancelled; guests usually see the money in 3–5 business days.'),
              t('失败后款项不会自动重试，需由员工选择补救方式并联系宾客。', 'A failed refund does not resend automatically — staff pick a fallback and contact the guest.'),
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forest-500" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-border/70 pt-3">
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('常见失败原因', 'Common failure reasons')}
            </p>
            <ul className="space-y-1 text-[11.5px] text-forest-900">
              {REFUND_FAILURE_REASONS.filter((r) => r !== 'Other').map((r) => (
                <li key={r}>{tx(r, lang)}</li>
              ))}
            </ul>
          </div>

          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            {t('演示环境：使用“记录失败”模拟渠道拒绝退款，不会产生真实资金变动。', 'Demo environment: “Record failure” simulates a provider decline — no real money moves.')}
          </p>
        </Panel>
      </div>

      <RefundFailureDialog
        refund={failing}
        open={!!failing}
        onOpenChange={(v) => !v && setFailing(null)}
        onSaved={reload}
      />
      <ManualFallbackDialog
        refund={fallback}
        open={!!fallback}
        onOpenChange={(v) => !v && setFallback(null)}
        onSaved={reload}
      />
    </div>
  );
}