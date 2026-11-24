import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FEATURE_MAP } from '@/lib/featureMap';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AllFeatures() {
  const { bi } = useLanguage();
  const total = FEATURE_MAP.reduce((sum, branch) => sum + branch.items.length, 0);

  return (
    <div className="pb-20 pt-4">
      <div className="px-4">
        <h1 className="font-heading text-[17px] font-semibold">{bi('全部功能', 'All features')}</h1>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {bi(
            `共 ${FEATURE_MAP.length} 个板块 · ${total} 项功能，点任意一项即可进入对应页面。`,
            `${FEATURE_MAP.length} sections · ${total} features. Tap any item to open it.`,
          )}
        </p>
        <Link
          to="/map"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary"
        >
          {bi('以脑图查看结构', 'See it as a mind map')} <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 space-y-2.5 px-4">
        {FEATURE_MAP.map((branch, index) => (
          <section key={branch.key} className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${branch.dot}`} />
              <h2 className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                {index + 1}. {bi(branch.title.zh, branch.title.en)}
              </h2>
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[9.5px] text-muted-foreground">
                {branch.items.length}
              </span>
            </div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
              {bi(branch.desc.zh, branch.desc.en)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {branch.items.map((item, itemIndex) => (
                <Link
                  key={`${item.en}-${itemIndex}`}
                  to={item.path || '/'}
                  className="rounded-full bg-secondary/70 px-2.5 py-1 text-[10.5px] text-foreground/80 transition hover:bg-secondary hover:text-primary"
                >
                  {bi(item.zh, item.en)}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}