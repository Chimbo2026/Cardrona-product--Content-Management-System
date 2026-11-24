import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Stars({ rating = 0, reviews, className }) {
  const value = Number(rating) || 0;
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              'h-3 w-3',
              value >= i - 0.25 ? 'fill-amber-400 text-amber-400' : 'text-forest-200'
            )}
          />
        ))}
      </span>
      <span className="num text-[11.5px] font-semibold text-forest-900">{value.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className="text-[10.5px] text-muted-foreground">({reviews} sample reviews)</span>
      )}
    </div>
  );
}