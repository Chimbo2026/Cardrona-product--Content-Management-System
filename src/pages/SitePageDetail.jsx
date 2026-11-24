import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GuestPageView from '@/components/site/GuestPageView';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';

export default function SitePageDetail() {
  const { t } = useLang();
  const { slug } = useParams();
  const { items, loading } = useList('SitePage', { status: 'Published' }, { sort: 'sort_order', limit: 200 });

  const page = items.find((item) => item.slug === slug) || null;
  const notFound = !loading && !page;

  useEffect(() => {
    if (!notFound) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-xl px-6 py-24 text-center">
        <h1 className="font-heading text-2xl font-semibold text-forest-950">
          {t('页面不存在', 'Page not found')}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t('该页面可能尚未发布，或链接已失效。', 'This page may not be published yet, or the link is out of date.')}
        </p>
        <Link
          to="/site"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-forest-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('返回首页', 'Back to home')}
        </Link>
      </div>
    );
  }

  return (
    <GuestPageView page={page}>
      <Link
        to="/site"
        className="mt-8 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-forest-700 hover:text-forest-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('返回首页', 'Back to home')}
      </Link>
    </GuestPageView>
  );
}