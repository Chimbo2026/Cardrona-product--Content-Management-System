import { AlertTriangle, Check, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, prettyDate } from '@/lib/format';

export default function RefundManagerTable({ refunds, loading, canWrite, onFail, onFallback, onResolve }) {
  const { t, lang } = useLang();

  const columns = [
    {
      key: 'request_ref',
      label: t('退款单号 / 宾客', 'Request / guest'),
      render: (r) => (
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-forest-900">{r.request_ref}</p>
          <p className="text-[11px] text-muted-foreground">
            {r.guest_name}
            {r.booking_ref ? ` · ${r.booking_ref}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: t('金额', 'Amount'),
      align: 'right',
      render: (r) => (
        <div>
          <p className="num text-[12.5px] font-medium">{NZD(r.amount)}</p>
          <p className="text-[10.5px] text-muted-foreground">{tx(r.method, lang)}</p>
        </div>
      ),
    },
    { key: 'status', label: t('状态', 'Status'), render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'failure',
      label: t('失败原因 / 补救', 'Failure / fallback'),
      render: (r) =>
        r.failure_reason ? (
          <div className="min-w-0">
            <p className="text-[11.5px] font-medium text-rose-700">{tx(r.failure_reason, lang)}</p>
            <p className="text-[10.5px] text-muted-foreground">
              {r.resolution ? `${t('补救：', 'Fallback: ')}${tx(r.resolution, lang)}` : t('等待选择补救方式', 'Awaiting fallback')}
            </p>
          </div>
        ) : (
          <span className="text-[11.5px] text-muted-foreground">—</span>
        ),
    },
    {
      key: 'requested_at',
      label: t('申请时间', 'Requested'),
      render: (r) => <span className="text-[11.5px] text-muted-foreground">{prettyDate(r.requested_at || r.created_date)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => {
        if (!canWrite) return null;
        if (r.status === 'Failed') {
          return (
            <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => onFallback(r)}>
              <HandCoins className="h-3 w-3" /> {t('人工补救', 'Manual fallback')}
            </Button>
          );
        }
        if (r.status === 'Manual required') {
          return (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => onResolve(r)}>
              <Check className="h-3 w-3" /> {t('标记已解决', 'Mark resolved')}
            </Button>
          );
        }
        if (r.status === 'Approved' || r.status === 'Processing') {
          return (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => onFail(r)}>
              <AlertTriangle className="h-3 w-3" /> {t('记录失败', 'Record failure')}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={refunds}
      loading={loading}
      compact
      emptyTitle={t('没有符合条件的退款申请', 'No refund requests match')}
      emptyDescription={t('调整筛选条件，或从预订管理中提交新的退款申请。', 'Adjust the filters, or raise a new request from booking management.')}
    />
  );
}