import { cn } from '@/lib/utils';

export default function Panel({ title, description, action, children, className, bodyClassName }) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(15,42,34,0.04)]',
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5">
          <div>
            <h2 className="text-[14px] font-semibold text-forest-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}