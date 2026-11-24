import { useLang } from '@/lib/i18n';
import { STOCK_TONES, stockLabel, stockState } from '@/lib/retail';

export default function StockBadge({ product }) {
  const { lang } = useLang();
  const state = stockState(product);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${STOCK_TONES[state]}`}
    >
      {stockLabel(state, lang)}
    </span>
  );
}