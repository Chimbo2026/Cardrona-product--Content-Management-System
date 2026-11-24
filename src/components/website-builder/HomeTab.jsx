import Panel from '@/components/common/Panel';
import PageForm from './PageForm';
import useList from '@/hooks/useList';
import { useLang } from '@/lib/i18n';

export default function HomeTab() {
  const { t } = useLang();
  const { items, loading, reload } = useList('SitePage', { page_type: 'Home' }, { limit: 5 });
  const home = items[0] || null;

  return (
    <Panel
      title={t('首页内容', 'Home page content')}
      description={t(
        '这些字段是网站首页的可复用组件，保存后会显示在公开首页上。',
        'These fields are the reusable home-page components shown on the public home page.'
      )}
      bodyClassName="p-4 sm:p-5"
    >
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <PageForm key={home?.id || 'new-home'} page={home} pageType="Home" onSaved={reload} />
      )}
    </Panel>
  );
}