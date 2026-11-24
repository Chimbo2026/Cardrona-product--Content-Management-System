import { useEffect, useRef, useState } from 'react';
import { Sparkles, Tag, Snowflake } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const SLIDES = [
  {
    key: 'new',
    zh: ['新品上架', '服装与配件'],
    en: ['New Arrivals', 'Apparel & accessories'],
    Icon: Sparkles,
  },
  {
    key: 'promo',
    zh: ['最新促销', '早鸟季票优惠'],
    en: ['Latest Offer', 'Early Bird Season Pass'],
    Icon: Tag,
  },
  {
    key: 'news',
    zh: ['雪场新闻', '新雪已降 12 厘米'],
    en: ['Resort News', '12cm New Snow'],
    Icon: Snowflake,
  },
];

export default function PromoCarousel() {
  const { bi } = useLanguage();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);

  useEffect(() => {
    if (paused || dragging) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4200);
    return () => clearInterval(id);
  }, [paused, dragging]);

  const go = (step) =>
    setIndex((i) => (i + step + SLIDES.length) % SLIDES.length);

  const onPointerDown = (event) => {
    startX.current = event.clientX;
    setPaused(true);
    setDragging(true);
  };

  const onPointerMove = (event) => {
    if (startX.current == null) return;
    setDrag(event.clientX - startX.current);
  };

  const endDrag = () => {
    if (startX.current == null) return;
    startX.current = null;
    if (Math.abs(drag) > 40) go(drag < 0 ? 1 : -1);
    setDrag(0);
    setDragging(false);
    setPaused(false);
  };

  return (
    <section className="mt-3 px-4">
      <div
        className="relative touch-pan-y select-none overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${drag}px))`,
            transition: dragging ? 'none' : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {SLIDES.map(({ key, zh, en, Icon }) => (
            <div key={key} className="w-full shrink-0 bg-gradient-to-br from-card to-secondary/70">
              <div className="flex items-center gap-3 px-4 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-[21px] w-[21px]" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-[17px] leading-tight">{bi(zh[0], en[0])}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{bi(zh[1], en[1])}</p>
                </div>
              </div>
              <div className="mx-4 h-px bg-primary/25" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={bi(slide.zh[0], slide.en[0])}
              className={`h-1 rounded-full transition-all ${
                i === index ? 'w-3.5 bg-primary' : 'w-1 bg-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}