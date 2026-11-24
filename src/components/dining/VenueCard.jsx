import { Clock, ExternalLink, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import StatusBadge from '@/components/common/StatusBadge';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { venuePhoto } from '@/lib/dining';

export default function VenueCard({ venue, canWrite, onEdit }) {
  const { lang, t } = useLang();

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="relative aspect-[16/10] w-full bg-muted">
        <Image src={venuePhoto(venue)} alt={venue.name} fittingType="fill" className="h-full w-full" />
        <div className="absolute right-2 top-2 flex gap-1.5">
          <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-forest-900">
            {tx(venue.venue_type, lang)}
          </span>
          <StatusBadge status={venue.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[13.5px] font-semibold text-forest-900">{venue.name}</p>
        <div className="mt-1.5 space-y-1 text-[11.5px] text-forest-900">
          {venue.location && (
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
              <span>{venue.location}</span>
            </p>
          )}
          {venue.opening_hours && (
            <p className="flex items-start gap-1.5 text-muted-foreground">
              <Clock className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{venue.opening_hours}</span>
            </p>
          )}
        </div>

        <div className="mt-2 flex-1 space-y-1.5">
          {venue.offering && <p className="text-[11.5px] font-medium text-forest-800">{venue.offering}</p>}
          {venue.description && (
            <p className="line-clamp-3 text-[11.5px] leading-relaxed text-muted-foreground">{venue.description}</p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
          <span className="mr-auto text-[10.5px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
            {venue.mountain}
          </span>
          {venue.menu_url && (
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" asChild>
              <a href={venue.menu_url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3" /> {t('菜单', 'Menu')}
              </a>
            </Button>
          )}
          {venue.booking_url && (
            <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" asChild>
              <a href={venue.booking_url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3 w-3" /> {t('订位', 'Book')}
              </a>
            </Button>
          )}
          {canWrite && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => onEdit(venue)}>
              {t('编辑', 'Edit')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}