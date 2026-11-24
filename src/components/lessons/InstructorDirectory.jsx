import { BadgeCheck, CalendarClock, Languages } from 'lucide-react';
import { Image } from '@/components/ui/image';
import StatusBadge from '@/components/common/StatusBadge';
import Stars from '@/components/common/Stars';
import { initials } from '@/lib/format';

export default function InstructorDirectory({ instructors, lessons }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {instructors.map((i) => {
        const assigned = lessons.filter((l) => l.instructor_id === i.id && l.status !== 'Cancelled').length;
        return (
          <article key={i.id} className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="flex gap-3 p-3.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-forest-100">
                {i.photo_url ? (
                  <Image src={i.photo_url} alt={i.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-heading text-[16px] font-semibold text-forest-700">
                    {initials(i.full_name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-forest-900">{i.full_name}</p>
                    <p className="num text-[10.5px] text-muted-foreground">{i.instructor_code || 'INS'} · {i.discipline}</p>
                  </div>
                  <StatusBadge status={i.availability} />
                </div>
                <Stars rating={i.rating} reviews={i.reviews_count} className="mt-1.5" />
              </div>
            </div>
            <div className="space-y-1.5 border-t border-border/60 px-3.5 py-3 text-[11.5px] text-muted-foreground">
              <p className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-ice-600" /> {i.certification} · {i.years_experience || 0} yrs</p>
              <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-ice-600" /> {assigned} lesson{assigned === 1 ? '' : 's'} assigned</p>
              <p className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5 text-ice-600" /> {i.languages || 'English'}</p>
              <p className="text-forest-800">Levels: <span className="text-muted-foreground">{i.levels || 'All levels'}</span></p>
              {i.specialties && <p className="line-clamp-2">{i.specialties}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}