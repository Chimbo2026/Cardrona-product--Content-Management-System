import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white/60 px-6 py-14 text-center',
        className
      )}
    >
      <span className="mb-3 rounded-full bg-forest-50 p-3 text-forest-600">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-forest-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}