import { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { DemoChip, SelectNative } from '@/components/common/Controls';
import VenueCard from '@/components/dining/VenueCard';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';

const TYPES = ['Restaurant', 'Cafe', 'Bar'];
const MOUNTAINS = ['Cardrona', 'Treble Cone'];

export default function Dining() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('dining', 'write');
  const { toast } = useToast();
  const { items: venues, loading, reload } = useList('DiningVenue', {}, { sort: 'sort_order', limit: 100 });
  const [type, setType] = useState('Restaurant');
  const [mountain, setMountain] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [addType, setAddType] = useState('Restaurant');

  const typeLabel = { Restaurant: t('餐厅', 'Restaurant'), Cafe: t('咖啡厅', 'Café'), Bar: t('酒吧', 'Bar') };
  const addLabel = {
    Restaurant: t('添加餐厅', 'Add restaurant'),
    Cafe: t('添加咖啡厅', 'Add cafe'),
    Bar: t('添加酒吧', 'Add bar'),
  };
  const photoLabel = {
    Restaurant: t('餐厅照片', 'Restaurant photo'),
    Cafe: t('咖啡厅照片', 'Cafe photo'),
    Bar: t('酒吧照片', 'Bar photo'),
  };

  const filtered = venues.filter(
    (v) => v.venue_type === type && (mountain === 'All' || v.mountain === mountain)
  );

  const openForm = (venue) => {
    setEditing(venue || null);
    setAddType(venue?.venue_type || type);
    setOpen(true);
  };

  const photoKind = editing?.venue_type || addType;

  const fields = [
    { name: 'name', label: t('名称', 'Name'), required: true },
    { name: 'venue_type', label: t('类型', 'Type'), type: 'select', required: true, options: TYPES.map((v) => ({ value: v, label: typeLabel[v] })) },
    { name: 'mountain', label: t('雪场', 'Mountain'), type: 'select', required: true, options: MOUNTAINS.map((v) => ({ value: v, label: v })) },
    { name: 'status', label: t('营业状态', 'Status'), type: 'select', required: true, options: ['Open', 'Seasonal', 'Closed'].map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'location', label: t('位置', 'Location') },
    { name: 'opening_hours', label: t('营业时间', 'Opening hours') },
    { name: 'offering', label: t('供应内容', 'Offering'), colSpan: 2 },
    { name: 'image_url', label: photoLabel[photoKind], type: 'image', colSpan: 2, caption: t('未上传照片时使用示例图片。', 'A sample photo is shown until you upload one.') },
    { name: 'description', label: t('简介', 'Description'), type: 'textarea', colSpan: 2 },
    { name: 'menu_url', label: t('菜单链接', 'Menu link'), placeholder: 'https://' },
    { name: 'booking_url', label: t('订位链接', 'Booking link'), placeholder: 'https://' },
  ];

  const submit = async (values) => {
    if (editing) {
      await base44.entities.DiningVenue.update(editing.id, values);
      toast({ title: t('餐饮点已更新', 'Venue updated'), description: values.name });
    } else {
      await base44.entities.DiningVenue.create(values);
      toast({ title: t('餐饮点已添加', 'Venue added'), description: values.name });
    }
    reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('山上餐饮', 'On-mountain dining')}
        title={t('餐厅与咖啡厅', 'Restaurants & Cafés')}
        description={t('Cardrona 与 Treble Cone 山上餐厅、咖啡厅与酒吧的图片与营业信息。', 'Photos and service details for the restaurants, cafés and bars across Cardrona and Treble Cone.')}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => openForm(null)}>
              <Plus className="h-3.5 w-3.5" /> {addLabel[type]}
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-ice-200 bg-ice-50/70 px-3.5 py-2.5">
        <DemoChip>{t('演示菜单', 'Demonstration menu')}</DemoChip>
        <p className="text-[11.5px] text-ice-900">{t('图片与营业时间仅供演示参考。', 'Photos and service hours are for demonstration only.')}</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((v) => (
            <Button
              key={v}
              size="sm"
              variant={type === v ? 'default' : 'outline'}
              className="h-8 gap-1.5 px-2.5 text-[12px]"
              onClick={() => setType(v)}
            >
              <UtensilsCrossed className="h-3.5 w-3.5" />
              {typeLabel[v]}
              <span className={type === v ? 'opacity-70' : 'text-muted-foreground'}>
                {venues.filter((x) => x.venue_type === v).length}
              </span>
            </Button>
          ))}
        </div>
        <SelectNative
          ariaLabel={t('雪场', 'Mountain')}
          value={mountain}
          onChange={setMountain}
          includeAll
          allLabel={t('全部雪场', 'All mountains')}
          options={MOUNTAINS.map((v) => ({ value: v, label: v }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-forest-50" />)}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-[12.5px] text-muted-foreground">
            {t('暂时没有餐饮点记录。', 'No venues recorded yet.')}
          </p>
        )}
        {filtered.map((v) => (
          <VenueCard key={v.id} venue={v} canWrite={canWrite} onEdit={openForm} />
        ))}
      </div>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t(`编辑 ${editing.name}`, `Edit ${editing.name}`) : addLabel[photoKind]}
        description={t('演示餐饮记录。', 'Demonstration dining record.')}
        fields={fields}
        initialValues={editing || { venue_type: addType, mountain: 'Cardrona', status: 'Open' }}
        onSubmit={submit}
        submitLabel={editing ? t('保存餐饮点', 'Save venue') : addLabel[photoKind]}
      />
    </div>
  );
}