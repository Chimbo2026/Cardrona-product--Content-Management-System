import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import GuestPageView from '@/components/site/GuestPageView';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';

function PageCard({ item, cta }) {
  return (
    <Link
      to={`/site/${item.slug}`}
      className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="h-40 overflow-hidden bg-muted">
        {item.hero_image_url ? (
          <Image
            src={item.hero_image_url}
            alt={item.title}
            fittingType="fill"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="px-4 py-3.5">
        <h3 className="font-heading text-[15px] font-semibold text-forest-950">{item.title}</h3>
        {item.hero_subtitle && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {item.hero_subtitle}
          </p>
        )}
        <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-forest-700">
          {cta}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default function SiteHome() {
  const { t } = useLang();
  const { items, loading } = useList('SitePage', { status: 'Published' }, { sort: 'sort_order', limit: 200 });

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const home = items.find((item) => item.page_type === 'Home') || null;
  const products = items.filter((item) => item.page_type === 'Product');
  const campaigns = items.filter((item) => item.page_type === 'Campaign');

  if (!home) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-forest-950">
          {t('网站尚未发布', 'The website is not live yet')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t(
            '请在后台的 Website Builder 中创建并发布首页内容。',
            'Create and publish the home page content in the Website Builder.'
          )}
        </p>
        <Link
          to="/website-builder"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-forest-800"
        >
          {t('前往 Website Builder', 'Open Website Builder')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <GuestPageView page={home}>
      {products.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-forest-950">
            {t('产品与体验', 'Products & experiences')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => (
              <PageCard key={item.id} item={item} cta={t('了解更多', 'Explore')} />
            ))}
          </div>
        </section>
      )}

      {campaigns.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold text-forest-950">
            {t('当前活动', 'On now')}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((item) => (
              <PageCard key={item.id} item={item} cta={t('查看活动', 'View offer')} />
            ))}
          </div>
        </section>
      )}
    </GuestPageView>
  );
}