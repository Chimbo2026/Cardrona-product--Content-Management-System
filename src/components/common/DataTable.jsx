import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';
import { useLang } from '@/lib/i18n';

export default function DataTable({
  columns,
  rows,
  onRowClick,
  loading,
  emptyTitle,
  emptyDescription,
  emptyAction,
  rowClassName,
  compact = false,
}) {
  const { t } = useLang();
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-forest-50/80" />
        ))}
      </div>
    );
  }

  if (!rows?.length) {
    return (
      <div className="p-4">
        <EmptyState title={emptyTitle || t('暂无记录', 'No records yet')} description={emptyDescription} action={emptyAction} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground',
                  c.align === 'right' && 'text-right',
                  c.className
                )}
              >
                {c.headerRender ? c.headerRender() : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border/50 transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-forest-50/60',
                rowClassName?.(row)
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    compact ? 'px-4 py-2 text-[12.5px]' : 'px-4 py-3 text-[12.5px]',
                    'align-middle text-forest-900',
                    c.align === 'right' && 'text-right',
                    c.cellClassName
                  )}
                >
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}