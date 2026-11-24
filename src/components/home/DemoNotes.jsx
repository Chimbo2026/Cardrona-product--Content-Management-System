import { Link } from 'react-router-dom';
import { ArrowRight, Info, Megaphone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DemoNotes() {
  const { t, bi } = useLanguage();

  return (
    <section className="mt-4 px-4">
      <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-[11px] leading-relaxed text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium text-foreground/80">
          <Info className="h-3.5 w-3.5" /> {t('home.notes.title')}
        </p>
        <p className="mt-1">{t('home.notes.wechat')}</p>
        <p className="mt-1">{t('home.notes.aspenware')}</p>
        <p className="mt-1">{t('home.notes.i18n')}</p>
      </div>

      <Link
        to="/ad"
        className="mt-2.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-[11.5px] transition hover:border-primary/40"
      >
        <Megaphone className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">
          {bi('预览微信朋友圈广告入口', 'Preview a WeChat Moments ad entry')}
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {bi(
              '广告 → 小程序，雪票与商店两条落地路径',
              'Ad → mini app, with separate ski pass and store landing paths',
            )}
          </span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </Link>
    </section>
  );
}