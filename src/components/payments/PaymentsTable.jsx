import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import MethodBadge from '@/components/payments/MethodBadge';
import { money } from '@/lib/currency';
import { useLang } from '@/lib/i18n';

export default function PaymentsTable({ rows, loading }) {
  const { t } = useLang();

  const columns = [
    {
      key: 'transaction_id',
      label: t('交易编号', 'Transaction ID'),
      render: (row) => <span className="font-mono text-[11.5px] text-forest-800">{row.transaction_id}</span>,
    },
    {
      key: 'guest_name',
      label: t('宾客姓名', 'Guest name'),
      render: (row) => <span className="font-medium text-forest-900">{row.guest_name}</span>,
    },
    {
      key: 'booking_ref',
      label: t('预订编号', 'Booking ref'),
      render: (row) => <span className="font-mono text-[11.5px] text-muted-foreground">{row.booking_ref}</span>,
    },
    {
      key: 'amount',
      label: t('金额', 'Amount'),
      align: 'right',
      render: (row) => (
        <span className="num font-semibold text-forest-950">{money(row.amount, row.currency)}</span>
      ),
    },
    {
      key: 'currency',
      label: t('币种', 'Currency'),
      render: (row) => (
        <span className="text-[11.5px] font-semibold tracking-[0.04em] text-muted-foreground">
          {row.currency}
        </span>
      ),
    },
    {
      key: 'method',
      label: t('支付方式', 'Payment method'),
      render: (row) => <MethodBadge kind={row.method} />,
    },
    {
      key: 'status',
      label: t('状态', 'Status'),
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      compact
      emptyTitle={t('暂无交易', 'No transactions yet')}
      emptyDescription={t(
        '完成一笔收款后，交易会显示在这里。',
        'Transactions appear here as soon as a payment is taken.'
      )}
    />
  );
}