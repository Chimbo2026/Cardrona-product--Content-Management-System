import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Maximize2, Minus, Mountain, Plus } from 'lucide-react';
import { FEATURE_MAP } from '@/lib/featureMap';
import MapFlow from '@/components/map/MapFlow';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STROKES = {
  browse: '#c61025',
  tickets: '#e11d48',
  booking: '#059669',
  lessons: '#0284c7',
  rentals: '#0d9488',
  resort: '#d97706',
  shop: '#7c3aed',
  orders: '#4f46e5',
  account: '#475569',
};

const LEFT_KEYS = ['resort', 'shop', 'orders', 'account'];
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.6;

export default function FeatureMap() {
  const { bi } = useLanguage();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const nodeRefs = useRef({});
  const [scale, setScale] = useState(1);
  const [curves, setCurves] = useState([]);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [collapsed, setCollapsed] = useState({});

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const s = scale || 1;
    const cb = canvas.getBoundingClientRect();
    const rb = root.getBoundingClientRect();
    const rootLeft = (rb.left - cb.left) / s;
    const rootRight = (rb.right - cb.left) / s;
    const rootMidY = (rb.top - cb.top + rb.height / 2) / s;

    const next = FEATURE_MAP.reduce((acc, branch) => {
      const el = nodeRefs.current[branch.key];
      if (!el) return acc;
      const nb = el.getBoundingClientRect();
      const left = (nb.left - cb.left) / s;
      const right = (nb.right - cb.left) / s;
      const midY = (nb.top - cb.top + nb.height / 2) / s;
      const isLeft = LEFT_KEYS.includes(branch.key);
      const startX = isLeft ? rootLeft : rootRight;
      const endX = isLeft ? right : left;
      const dir = isLeft ? -1 : 1;
      acc.push({
        key: branch.key,
        d: `M ${startX} ${rootMidY} C ${startX + dir * 46} ${rootMidY}, ${endX - dir * 46} ${midY}, ${endX} ${midY}`,
      });
      return acc;
    }, []);

    setCurves(next);
    setNatural({ w: canvas.offsetWidth, h: canvas.offsetHeight });
  }, [scale]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (canvasRef.current) observer.observe(canvasRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure, collapsed]);

  const zoomBy = (delta) =>
    setScale((prev) => Number(Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)).toFixed(2)));

  const fitToWidth = () => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const naturalWidth = canvas.offsetWidth / scale;
    const next = (wrap.clientWidth - 24) / naturalWidth;
    setScale(Number(Math.min(1, Math.max(MIN_SCALE, next)).toFixed(2)));
  };

  const toggle = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderLeaves = (branch, stroke, isLeft) =>
    branch.items.map((item, index) => (
      <div key={`${item.en}-${index}`} className="relative">
        <span
          className={`absolute top-1/2 h-px w-2.5 ${isLeft ? '-right-2.5' : '-left-2.5'}`}
          style={{ background: `${stroke}55` }}
        />
        {item.path ? (
          <Link
            to={item.path}
            className="block w-[122px] rounded-lg bg-secondary/70 px-2 py-[5px] text-[10px] leading-snug text-foreground/80 transition hover:bg-secondary hover:text-primary"
          >
            {bi(item.zh, item.en)}
          </Link>
        ) : (
          <span className="block w-[122px] rounded-lg bg-secondary/70 px-2 py-[5px] text-[10px] leading-snug text-foreground/80">
            {bi(item.zh, item.en)}
          </span>
        )}
      </div>
    ));

  const renderBranch = (branch) => {
    const stroke = STROKES[branch.key] || '#64748b';
    const isLeft = LEFT_KEYS.includes(branch.key);
    const open = !collapsed[branch.key];

    return (
      <div key={branch.key} className="flex items-center">
        {isLeft && open && (
          <div className="relative mr-2.5 flex flex-col items-end gap-1 py-1">
            <span
              className="absolute right-0 top-4 bottom-4 w-px"
              style={{ background: `${stroke}55` }}
            />
            {renderLeaves(branch, stroke, true)}
          </div>
        )}

        <button
          type="button"
          ref={(el) => {
            nodeRefs.current[branch.key] = el;
          }}
          onClick={() => toggle(branch.key)}
          className="flex w-[96px] shrink-0 items-start gap-1 rounded-xl border border-l-[3px] border-border bg-card px-2 py-2 text-left shadow-sm transition hover:shadow-md"
          style={{ borderLeftColor: stroke }}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold leading-tight">
              {bi(branch.title.zh, branch.title.en)}
            </span>
            <span className="mt-0.5 block text-[9px] text-muted-foreground">
              {branch.items.length} {bi('项功能', 'items')}
            </span>
          </span>
          {open ? (
            <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          )}
        </button>

        {!isLeft && open && (
          <div className="relative ml-2.5 flex flex-col gap-1 py-1">
            <span
              className="absolute left-0 top-4 bottom-4 w-px"
              style={{ background: `${stroke}55` }}
            />
            {renderLeaves(branch, stroke, false)}
          </div>
        )}
      </div>
    );
  };

  const leftBranches = FEATURE_MAP.filter((branch) => LEFT_KEYS.includes(branch.key));
  const rightBranches = FEATURE_MAP.filter((branch) => !LEFT_KEYS.includes(branch.key));
  const totalItems = FEATURE_MAP.reduce((sum, branch) => sum + branch.items.length, 0);

  return (
    <div className="pb-20 pt-4">
      <div className="px-4">
        <h1 className="font-heading text-[17px] font-semibold">{bi('功能地图', 'Function map')}</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {bi(
            `${FEATURE_MAP.length} 大分支 · ${totalItems} 个功能触点，可缩放、拖动，点分支可折叠。`,
            `${FEATURE_MAP.length} branches · ${totalItems} touchpoints. Zoom, drag, and tap a branch to fold it.`,
          )}
        </p>
        <Link to="/features" className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
          {bi('查看完整功能列表', 'Open the full feature list')} <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 px-4">
        <span className="text-[10px] text-muted-foreground">
          {bi('脑图画布', 'Mind map canvas')}
        </span>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-0.5">
          <button
            type="button"
            onClick={() => zoomBy(-0.1)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
            aria-label={bi('缩小', 'Zoom out')}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-9 text-center text-[10px] tabular-nums text-foreground/70">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => zoomBy(0.1)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
            aria-label={bi('放大', 'Zoom in')}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={fitToWidth}
            className="flex h-6 w-6 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary"
            aria-label={bi('适应宽度', 'Fit to width')}
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="mt-2 overflow-auto scrollbar-none"
        style={{ maxHeight: 'calc(100dvh - 210px)' }}
      >
        <div
          className="relative"
          style={{ width: natural.w * scale || undefined, height: natural.h * scale || undefined }}
        >
          <div
            ref={canvasRef}
            className="inline-flex items-center"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <svg
              className="pointer-events-none absolute left-0 top-0 z-0"
              width={natural.w}
              height={natural.h}
              aria-hidden="true"
            >
              {curves.map((curve) => (
                <path
                  key={curve.key}
                  d={curve.d}
                  fill="none"
                  stroke={STROKES[curve.key] || '#94a3b8'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.65"
                />
              ))}
            </svg>

            <div className="relative z-10 flex shrink-0 flex-col items-end gap-3 pr-5">
              {leftBranches.map(renderBranch)}
            </div>

            <div
              ref={rootRef}
              className="relative z-10 w-[104px] shrink-0 rounded-2xl bg-primary p-3 text-primary-foreground shadow-sm"
            >
              <span className="flex items-center gap-1 text-[8.5px] uppercase tracking-[0.14em] opacity-80">
                <Mountain className="h-2.5 w-2.5" /> {bi('中心主题', 'Central topic')}
              </span>
              <p className="mt-1 font-heading text-[12.5px] font-semibold leading-tight">
                {bi('雪峰预订中心', 'Peak Snow Booking')}
              </p>
              <p className="mt-1 text-[9px] leading-snug opacity-80">
                {FEATURE_MAP.length} {bi(`大分支 · ${totalItems} 个触点`, `branches · ${totalItems} touchpoints`)}
              </p>
            </div>

            <div className="relative z-10 flex shrink-0 flex-col items-start gap-3 pl-5">
              {rightBranches.map(renderBranch)}
            </div>
          </div>
        </div>
      </div>

      <p className="px-4 pt-2 text-center text-[10px] text-muted-foreground">
        {bi('拖动画布查看 · 点击分支节点折叠', 'Drag the canvas to explore · tap a branch to fold it')}
      </p>

      <MapFlow />
    </div>
  );
}