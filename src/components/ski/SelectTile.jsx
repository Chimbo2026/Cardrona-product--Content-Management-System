import { cn } from '@/lib/utils';

export default function SelectTile({ selected, onClick, title, subtitle, meta, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-lg border px-3.5 py-3 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40',
        className
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-forest-900">{title}</span>
        {meta && <span className="num text-[12px] font-semibold text-forest-950">{meta}</span>}
      </span>
      {subtitle && <span className="mt-1 block text-[11.5px] leading-relaxed text-muted-foreground">{subtitle}</span>}
    </button>
  );
}