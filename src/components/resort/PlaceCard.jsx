import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function PlaceCard({ item, lang, linkLabel, onOrder, orderLabel }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[16/10] w-full bg-secondary">
        <Image src={item.image} alt={item.name[lang] || item.name.zh} className="h-full w-full" />
      </div>
      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[13px] font-semibold leading-snug">{item.name[lang] || item.name.zh}</h3>
          {item.sleeps && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {item.sleeps[lang] || item.sleeps.zh}
            </span>
          )}
        </div>

        {item.tagline && (
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            {item.tagline[lang] || item.tagline.zh}
          </p>
        )}

        {item.location && (
          <p className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {item.location[lang] || item.location.zh}
          </p>
        )}

        {item.hours && (
          <p className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" /> {item.hours}
          </p>
        )}

        {item.meta && (
          <p className="text-[10.5px] font-medium text-primary">{item.meta[lang] || item.meta.zh}</p>
        )}

        {item.features && (
          <ul className="space-y-1 pt-0.5">
            {item.features.map((feature) => (
              <li key={feature.zh} className="flex gap-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
                <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                {feature[lang] || feature.zh}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary"
          >
            {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          {onOrder && (
            <button
              type="button"
              onClick={onOrder}
              className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {orderLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}