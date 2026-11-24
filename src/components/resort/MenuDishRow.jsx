import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatNZD } from '@/lib/foodMenu';

export default function MenuDishRow({ dish, qty, note, withNote, onQty, onNote }) {
  const { lang, bi } = useLanguage();
  const name = lang === 'en' ? dish.name_en || dish.name_zh : dish.name_zh;

  return (
    <div className="rounded-xl border border-border p-2.5">
      <div className="flex items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium">{name}</p>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">{formatNZD(dish.price)}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {qty > 0 && (
            <>
              <button
                type="button"
                onClick={() => onQty(qty - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-[13px] leading-none text-muted-foreground"
                aria-label={bi('减少数量', 'Decrease quantity')}
              >
                −
              </button>
              <span className="w-4 text-center text-[11.5px]">{qty}</span>
            </>
          )}
          <button
            type="button"
            onClick={() => onQty(qty + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[13px] leading-none text-primary-foreground"
            aria-label={bi('加入点单', 'Add to order')}
          >
            +
          </button>
        </div>
      </div>

      {withNote && qty > 0 && (
        <Input
          value={note}
          onChange={(event) => onNote(event.target.value)}
          placeholder={bi('口味备注，如少辣 / 不要香菜 / 过敏', 'Taste note, e.g. mild, no coriander, allergies')}
          className="mt-2 h-8 text-[11px]"
        />
      )}
    </div>
  );
}