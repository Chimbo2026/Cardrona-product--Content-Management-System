import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Snowflake } from 'lucide-react';
import { fetchEntity } from '@/hooks/useList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function NotificationsMenu() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [incidents] = await Promise.all([fetchEntity('Incident', { status: 'Open' }, { limit: 6 })]);
        const list = [
          ...incidents.map((i) => ({
            id: i.id,
            icon: AlertTriangle,
            tone: 'text-rose-600 bg-rose-50',
            title: i.title,
            meta: `${i.location} · ${i.severity} severity`,
            to: '/operations',
          })),
        ].slice(0, 6);
        setItems(list);
      } catch (e) {
        setItems([]);
      }
    };
    load();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-lg p-2 text-forest-800 transition-colors hover:bg-forest-50"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.9} />
          {items.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
              {items.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-[13px] font-semibold text-forest-900">Notification centre</p>
          <span className="rounded-full bg-forest-50 px-2 py-0.5 text-[10px] font-medium text-forest-700">
            {items.length} open
          </span>
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">
              Nothing needs attention right now.
            </p>
          )}
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.id}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-forest-50/60"
              >
                <span className={`mt-0.5 h-7 w-7 shrink-0 rounded-lg p-1.5 ${n.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] font-medium text-forest-900">
                    {n.title}
                  </span>
                  <span className="block truncate text-[11.5px] text-muted-foreground">{n.meta}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <Snowflake className="h-3.5 w-3.5" /> Simulated alerts from demo operational records
        </div>
      </PopoverContent>
    </Popover>
  );
}