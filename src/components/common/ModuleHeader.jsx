import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

export default function ModuleHeader({ image, eyebrow, title, description, actions, className }) {
  const { t } = useLang();
  return (
    <section
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-forest-900/10 bg-forest-950',
        className
      )}
    >
      {image && (
        <Image src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/80 to-forest-900/35" />
      <div className="relative flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            {eyebrow && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ice-200 ring-1 ring-inset ring-white/15">
                {eyebrow}
              </span>
            )}
            <span className="rounded-full bg-ice-400/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ice-200 ring-1 ring-inset ring-ice-300/30">
              {t('演示', 'Demo')}
            </span>
          </div>
          <h1 className="font-heading text-[24px] font-semibold leading-tight text-white sm:text-[28px]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-forest-100/80">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}