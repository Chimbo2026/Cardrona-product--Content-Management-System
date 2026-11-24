import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  CalendarDays,
  Package,
  ShoppingBag,
  GraduationCap,
  Bus,
  Lock,
  Map as MapIcon,
  MoreHorizontal,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ICONS = {
  Ticket,
  CalendarDays,
  Package,
  ShoppingBag,
  GraduationCap,
  Bus,
  Lock,
  Map: MapIcon,
  MoreHorizontal,
};

const DEMO_LINKS = [
  { id: 'passes', link_name_zh: '雪票', link_name_en: 'Passes', icon_name: 'Ticket', target_url: '/tickets' },
  { id: 'season', link_name_zh: '季票', link_name_en: 'Season', icon_name: 'CalendarDays', target_url: '/booking?cat=%E5%A5%97%E9%A4%90' },
  { id: 'shop', link_name_zh: '商店', link_name_en: 'Shops', icon_name: 'ShoppingBag', target_url: '/shop' },
  { id: 'rentals', link_name_zh: '租赁', link_name_en: 'Rentals', icon_name: 'Package', target_url: '/rentals' },
  { id: 'lessons', link_name_zh: '课程', link_name_en: 'Lessons', icon_name: 'GraduationCap', target_url: '/lessons' },
  { id: 'transport', link_name_zh: '交通', link_name_en: 'Transport', icon_name: 'Bus', target_url: '/info' },
  { id: 'map', link_name_zh: '雪道图', link_name_en: 'Trail map', icon_name: 'Map', target_url: '/map' },
  { id: 'more', link_name_zh: '更多', link_name_en: 'More', icon_name: 'MoreHorizontal', target_url: '/features' },
];

export default function ServiceGrid() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.QuickLink.filter({}, { sort: 'sort_order', limit: 8 }),
      { items: [] },
    )
      .then((page) => {
        if (active) setLinks(page.items?.length ? page.items : DEMO_LINKS);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const open = (link) => {
    if (!link.target_url) {
      toast({ title: t('svc.soon') });
      return;
    }
    navigate(link.target_url);
  };

  return (
    <section className="mt-3 px-4">
      <div className="rounded-2xl border border-border bg-card p-2.5">
        <div className="grid grid-cols-4 gap-y-3">
          {loading
            ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-1">
                  <span className="h-11 w-11 animate-pulse rounded-2xl bg-muted" />
                  <span className="h-2.5 w-9 animate-pulse rounded-full bg-muted" />
                </div>
              ))
            : links.map((link) => {
                const Icon = ICONS[link.icon_name] || MoreHorizontal;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => open(link)}
                    className="flex flex-col items-center gap-1.5 rounded-xl py-1 transition active:bg-secondary"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10.5px] text-foreground/80">
                      {lang === 'en' ? link.link_name_en : link.link_name_zh}
                    </span>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}
