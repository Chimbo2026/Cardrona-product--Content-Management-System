import { Trash2 } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

export default function PassCart({ items, onRemove }) {
  const { t } = useLang();
  const total = items.reduce((s, i) => s + (Number(i.price) || 0), 0);

  return (
    <Panel
      title={t('购物车', 'Cart')}
      action={<span className="num text-[12px] font-semibold text-forest-950">{NZD(total)}</span>}
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-border/70">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-forest-900">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.planLabel}</p>
            </div>
            <span className="num text-[12.5px] font-semibold text-forest-950">{NZD(item.price)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.id)}
              aria-label={t('移除', 'Remove')}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
        <span className="text-[12.5px] font-semibold text-forest-900">{t('合计', 'Total')}</span>
        <span className="num text-[15px] font-semibold text-forest-950">{NZD(total)}</span>
      </div>
    </Panel>
  );
}