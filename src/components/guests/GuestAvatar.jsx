import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { guestAvatarUrl, guestInitials } from '@/lib/guestAvatar';
import { cn } from '@/lib/utils';

export default function GuestAvatar({ guest, size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  const dims =
    size === 'lg'
      ? 'h-16 w-16 text-[16px]'
      : size === 'sm'
        ? 'h-7 w-7 text-[10px]'
        : 'h-10 w-10 text-[12.5px]';

  if (failed) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-forest-100 font-semibold text-forest-700 ring-1 ring-border/80',
          dims,
          className
        )}
      >
        {guestInitials(guest?.full_name) || '?'}
      </div>
    );
  }

  return (
    <Image
      src={guestAvatarUrl(guest)}
      alt={guest?.full_name || 'Guest'}
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full object-cover ring-1 ring-border/80', dims, className)}
    />
  );
}