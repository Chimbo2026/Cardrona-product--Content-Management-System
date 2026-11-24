import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ALL_NAV_ITEMS, navLabel } from './nav';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { prettyDate, NZD } from '@/lib/format';

export default function GlobalSearch({ open, onOpenChange }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState({ bookings: [], guests: [], passes: [] });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { lang, t } = useLang();

  useEffect(() => {
    if (!open) {
      setTerm('');
      setResults({ bookings: [], guests: [], passes: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!term || term.trim().length < 2) {
      setResults({ bookings: [], guests: [], passes: [] });
      return;
    }
    let active = true;
    const run = async () => {
      setBusy(true);
      const q = term.trim();
      try {
        const [bookings, guests, passes] = await Promise.all([
          base44.entities.Booking.filter(
            { $or: [{ booking_ref: { $regex: q, $options: 'i' } }, { guest_name: { $regex: q, $options: 'i' } }] },
            { limit: 4 }
          ),
          base44.entities.Guest.filter({ full_name: { $regex: q, $options: 'i' } }, { limit: 4 }),
          base44.entities.LiftPass.filter({ $or: [{ pass_number: { $regex: q, $options: 'i' } }, { guest_name: { $regex: q, $options: 'i' } }] }, { limit: 4 }),
        ]);
        if (!active) return;
        setResults({
          bookings: bookings?.items || [],
          guests: guests?.items || [],
          passes: passes?.items || [],
        });
      } catch (e) {
        if (active) setResults({ bookings: [], guests: [], passes: [] });
      } finally {
        if (active) setBusy(false);
      }
    };
    const timer = setTimeout(run, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term]);

  const navMatches = ALL_NAV_ITEMS.filter((i) =>
    navLabel(i.label, lang).toLowerCase().includes(term.toLowerCase())
  ).slice(0, 3);

  const go = (path) => {
    onOpenChange(false);
    navigate(path);
  };

  const hasResults =
    results.bookings.length || results.guests.length || results.passes.length || navMatches.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">{t('搜索度假村', 'Search the resort')}</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('搜索预订、宾客、缆车票或页面…', 'Search bookings, guests, passes or pages…')}
            className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div className="thin-scroll max-h-[60vh] overflow-y-auto p-2">
          {!term && (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              {t('输入宾客姓名、预订编号或票号进行搜索。', 'Type a guest name, booking reference or pass number.')}
            </p>
          )}
          {term && !hasResults && !busy && (
            <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
              {t(`没有匹配“${term}”的演示记录。`, `No demo records match “${term}”.`)}
            </p>
          )}
          {results.guests.length > 0 && (
            <Group label={t('宾客', 'Guests')}>
              {results.guests.map((g) => (
                <Row key={g.id} onClick={() => go(`/guests/${g.id}`)} title={g.full_name} meta={g.email} />
              ))}
            </Group>
          )}
          {results.bookings.length > 0 && (
            <Group label={t('预订', 'Bookings')}>
              {results.bookings.map((b) => (
                <Row
                  key={b.id}
                  onClick={() => go(`/bookings/${b.id}`)}
                  title={`${b.booking_ref} · ${b.guest_name}`}
                  meta={`${tx(b.activity, lang)} · ${prettyDate(b.visit_date)} · ${NZD(b.amount)}`}
                />
              ))}
            </Group>
          )}
          {results.passes.length > 0 && (
            <Group label={t('缆车票', 'Lift passes')}>
              {results.passes.map((p) => (
                <Row
                  key={p.id}
                  onClick={() => go('/management/passes')}
                  title={`${p.pass_number} · ${p.guest_name}`}
                  meta={`${tx(p.pass_type, lang)} · ${tx(p.usage_status, lang)}`}
                />
              ))}
            </Group>
          )}
          {navMatches.length > 0 && (
            <Group label={t('页面', 'Pages')}>
              {navMatches.map((n) => (
                <Row key={n.key} onClick={() => go(n.path)} title={navLabel(n.label, lang)} meta={t('打开模块', 'Open module')} />
              ))}
            </Group>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Group({ label, children }) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Row({ title, meta, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-forest-50"
    >
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-forest-900">{title}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{meta}</span>
      </span>
    </button>
  );
}
