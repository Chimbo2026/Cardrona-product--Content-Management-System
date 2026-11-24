import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import { DemoChip, SearchInput, SelectNative } from '@/components/common/Controls';
import ContentTable from '@/components/content/ContentTable';
import ContentDialog from '@/components/content/ContentDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/4sRoYUu5li9l11BZFsIKAu/52d8b3d29f3361046c7191b40c841b20/W24-about-us_Imagery-Home_Page_Hero_Image_-_Desktop.webp?w=1600&fm=webp&q=75';

const SECTIONS = [
  { value: 'Products', label: ['产品', 'Products'] },
  { value: 'Translations', label: ['翻译', 'Translations'] },
  { value: 'FAQs', label: ['常见问题', 'FAQs'] },
  { value: 'Mountain Information', label: ['山地信息', 'Mountain Information'] },
];

const STATUSES = [
  { value: 'Published', label: ['已发布', 'Published'] },
  { value: 'Draft', label: ['草稿', 'Draft'] },
  { value: 'Archived', label: ['已归档', 'Archived'] },
];

export default function ContentManagement() {
  const { can } = useRole();
  const { t } = useLang();
  const canWrite = can('content', 'write');

  const { items, loading, reload } = useList('ContentItem', {}, { sort: 'sort_order', limit: 500 });

  const [tab, setTab] = useState('Products');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rowsFor = (section) => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (item.section !== section) return false;
      if (status !== 'All' && item.status !== status) return false;
      if (q && !`${item.key || ''} ${item.title || ''} ${item.title_zh || ''} ${item.category || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  };

  const counts = useMemo(
    () => SECTIONS.reduce((acc, s) => ({ ...acc, [s.value]: items.filter((i) => i.section === s.value).length }), {}),
    [items]
  );

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (row) => { setEditing(row); setDialogOpen(true); };

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('网站内容', 'Website content')}
        title={t('内容管理', 'Content Management')}
        description={t('集中维护官网的产品、翻译词条、常见问题与山地信息，保存后官网即时采用。', 'Maintain website products, translation entries, FAQs and mountain information in one place.')}
        actions={canWrite ? (
          <Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> {t('新增内容', 'Add content')}
          </Button>
        ) : null}
      />

      <Panel bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('搜索标题、key 或分类…', 'Search title, key or category…')}
            className="w-full sm:w-72"
          />
          <SelectNative
            ariaLabel={t('发布状态', 'Publish state')}
            value={status}
            onChange={setStatus}
            includeAll
            allLabel={t('全部状态', 'All states')}
            options={STATUSES.map((s) => ({ value: s.value, label: t(s.label[0], s.label[1]) }))}
          />
          <DemoChip className="ml-auto">{t('官网内容草稿', 'Website content draft')}</DemoChip>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="border-b border-border/70 px-3 py-2">
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.value} value={s.value} className="gap-1.5 px-3 py-1.5 text-[12px]">
                  {t(s.label[0], s.label[1])}
                  <span className="num rounded bg-white px-1 text-[10px] text-muted-foreground shadow-sm">
                    {counts[s.value] || 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {SECTIONS.map((s) => (
            <TabsContent key={s.value} value={s.value} className="mt-0">
              <ContentTable
                section={s.value}
                rows={rowsFor(s.value)}
                loading={loading}
                canWrite={canWrite}
                onEdit={openEdit}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Panel>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        section={editing?.section || tab}
        entry={editing}
        onSaved={reload}
      />
    </div>
  );
}