import { Package, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';

export default function BulkActionBar({ count, onStock, onPrice, onClear }) {
  const { t } = useLang();
  if (!count) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-forest-200/70 bg-forest-50/70 px-3 py-2">
      <span className="text-[12px] font-semibold text-forest-900">{t(`已选 ${count} 件商品`, `${count} products selected`)}</span>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11.5px]" onClick={onStock}>
          <Package className="h-3.5 w-3.5" /> {t('批量调整库存', 'Bulk stock')}
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11.5px]" onClick={onPrice}>
          <Tag className="h-3.5 w-3.5" /> {t('批量调整价格', 'Bulk pricing')}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-[11.5px] text-muted-foreground" onClick={onClear}>
          <X className="h-3.5 w-3.5" /> {t('清除选择', 'Clear')}
        </Button>
      </div>
    </div>
  );
}