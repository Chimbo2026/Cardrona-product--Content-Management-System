import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import PageForm from './PageForm';
import NewPageDialog from './NewPageDialog';
import useList from '@/hooks/useList';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

export default function PagesTab({ pageType }) {
  const { t } = useLang();
  const { items, loading, reload } = useList('SitePage', { page_type: pageType }, { sort: 'sort_order', limit: 200 });
  const [selectedId, setSelectedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isCampaign = pageType === 'Campaign';
  const selected = items.find((item) => item.id === selectedId) || items[0] || null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <Panel
        title={isCampaign ? t('活动落地页', 'Campaign landing pages') : t('产品页面', 'Product pages')}
        description={t('选择一个页面进行编辑', 'Select a page to edit')}
        bodyClassName="p-0"
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            {isCampaign ? t('新建活动', 'Add new campaign') : t('新建页面', 'Add page')}
          </Button>
        }
      >
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-[12.5px] text-muted-foreground">
              {isCampaign
                ? t('还没有活动落地页，先新建一个。', 'No campaign pages yet — create your first one.')
                : t('还没有产品页面。', 'No product pages yet.')}
            </p>
          </div>
        ) : (
          <ul>
            {items.map((item) => {
              const active = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5 text-left transition-colors last:border-0',
                      active ? 'bg-forest-50/80' : 'hover:bg-muted/50'
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium text-forest-900">{item.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">/site/{item.slug}</span>
                    </span>
                    <StatusBadge status={item.status} dot={false} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel
        title={selected ? selected.title : isCampaign ? t('新建活动', 'New campaign') : t('新建页面', 'New page')}
        description={t('修改后点击保存，前端页面立即更新。', 'Save your changes and the front-end page updates immediately.')}
        bodyClassName="p-4 sm:p-5"
      >
        {selected ? (
          <PageForm key={selected.id} page={selected} pageType={pageType} onSaved={reload} />
        ) : (
          <p className="py-8 text-center text-[12.5px] text-muted-foreground">
            {t('在上方新建一个页面后即可编辑内容。', 'Create a page above to start editing.')}
          </p>
        )}
      </Panel>

      <NewPageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        pageType={pageType}
        existingSlugs={items.map((item) => item.slug)}
        onCreated={(record) => {
          reload();
          setSelectedId(record.id);
        }}
      />
    </div>
  );
}