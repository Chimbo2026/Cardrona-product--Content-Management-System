import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

export default function GuestPageView({ page, children, compact = false }) {
  const paragraphs = String(page?.body_text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-forest-950 text-white">
        {page?.hero_image_url ? (
          <Image
            src={page.hero_image_url}
            alt=""
            fittingType="fill"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/20" />
        <div className={cn('relative mx-auto w-full max-w-5xl px-6', compact ? 'py-12' : 'py-20 sm:py-24')}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/70">
            Cardrona Alpine Resort
          </p>
          <h1
            className={cn(
              'mt-3 max-w-3xl font-heading font-semibold leading-[1.08]',
              compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl'
            )}
          >
            {page?.hero_title || page?.title || ''}
          </h1>
          {page?.hero_subtitle && (
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/80 sm:text-[15px]">
              {page.hero_subtitle}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-8 sm:py-10">
        {paragraphs.length > 0 && (
          <div className="max-w-3xl space-y-3.5">
            {paragraphs.map((line, index) => (
              <p key={index} className="text-[13.5px] leading-relaxed text-forest-900/85">
                {line}
              </p>
            ))}
          </div>
        )}

        {page?.promo_text && (
          <div className="mt-6 max-w-3xl rounded-xl border border-ice-200 bg-ice-50 px-4 py-3.5">
            <p className="text-[13px] font-medium leading-relaxed text-ice-900">{page.promo_text}</p>
          </div>
        )}

        {children}
      </div>
    </article>
  );
}