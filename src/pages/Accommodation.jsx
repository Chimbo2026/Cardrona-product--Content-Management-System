import { useState } from 'react';
import { LogIn, LogOut, Plus, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { Image } from '@/components/ui/image';
import { roomPhoto } from '@/lib/roomPhotos';
import { DemoChip, SelectNative } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, num, prettyDate, todayISO } from '@/lib/format';

export default function Accommodation() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('accommodation', 'write');
  const { toast } = useToast();
  const { items: units, loading, reload } = useList('AccommodationUnit', {}, { sort: 'unit_name', limit: 100 });
  const [status, setStatus] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const today = todayISO();
  const occupied = units.filter((u) => u.status === 'Occupied');
  const occupancy = units.length ? Math.round((occupied.length / units.length) * 100) : 0;
  const arrivals = units.filter((u) => u.check_in === today && u.guest_name);
  const departures = units.filter((u) => u.check_out === today && u.guest_name);

  const filtered = units.filter((u) => status === 'All' || u.status === status);

  const fields = [
    { name: 'unit_name', label: t('房间号', 'Room number'), required: true },
    { name: 'unit_type', label: t('房型', 'Unit type'), type: 'select', required: true, options: ['Studio Apartment', 'Two Bedroom Apartment', 'Three Bedroom Apartment', 'Four Bedroom Apartment', 'Three Bedroom Loft'].map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'rate_per_night', label: t('每晚价格 (NZD)', 'Nightly rate (NZD)'), type: 'number', required: true },
    { name: 'image_url', label: t('房间照片', 'Room photo'), type: 'image', colSpan: 2, caption: t('未上传照片时使用房型示例图片。', 'A sample photo of the unit type is shown until you upload one.') },
    { name: 'guest_name', label: t('宾客姓名', 'Guest name') },
    { name: 'guest_count', label: t('入住人数', 'Number of guests'), type: 'number', required: true },
    { name: 'booking_ref', label: t('预订编号', 'Booking reference') },
    { name: 'status', label: t('状态', 'Status'), type: 'select', required: true, options: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'].map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'check_in', label: t('入住日期', 'Check-in'), type: 'date' },
    { name: 'check_out', label: t('退房日期', 'Check-out'), type: 'date' },
    { name: 'notes', label: t('备注', 'Notes'), type: 'textarea', colSpan: 2 },
  ];

  const submit = async (values) => {
    if (values.check_in && values.check_out && values.check_out <= values.check_in) {
      throw new Error(t('退房日期必须晚于入住日期。', 'Check-out must be after check-in.'));
    }
    const payload = { ...values, capacity: values.guest_count || values.capacity || 1 };
    if (editing) {
      await base44.entities.AccommodationUnit.update(editing.id, payload);
      toast({ title: t('房间已更新', 'Unit updated'), description: values.unit_name });
    } else {
      await base44.entities.AccommodationUnit.create(payload);
      toast({ title: t('房间已添加', 'Unit added'), description: values.unit_name });
    }
    reload();
  };

  const setUnitStatus = async (unit, patch, message) => {
    await base44.entities.AccommodationUnit.update(unit.id, patch);
    toast({ title: message, description: unit.unit_name });
    reload();
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客服务', 'Guest services')}
        title={t('住宿管理', 'Accommodation')}
        description={t('演示客房与公寓库存，含入住率、今日到店与离店管理。', 'Demonstration room and apartment inventory with occupancy, arrivals and departures.')}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> {t('添加房间', 'Add unit')}
            </Button>
          ) : null
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-ice-200 bg-ice-50/70 px-3.5 py-2.5">
        <DemoChip>{t('演示库存', 'Demonstration inventory')}</DemoChip>
        <p className="text-[11.5px] text-ice-900">{t('客房记录、宾客姓名与价格均为虚构演示数据。', 'Room records, guest names and rates are fictional demonstration data.')}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('入住率', 'Occupancy'), `${occupancy}%`],
          [t('已入住房间', 'Units occupied'), `${occupied.length} / ${units.length}`],
          [t('今日到店', 'Arrivals today'), num(arrivals.length)],
          [t('今日离店', 'Departures today'), num(departures.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-forest-900">{t('房间', 'Units')}</h2>
        <SelectNative ariaLabel={t('状态', 'Status')} value={status} onChange={setStatus} includeAll allLabel={t('全部状态', 'All statuses')} options={['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'].map((v) => ({ value: v, label: tx(v, lang) }))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && [0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-forest-50" />)}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-[12.5px] text-muted-foreground">
            {t('没有符合条件的房间。', 'No units match this filter.')}
          </p>
        )}
        {filtered.map((u) => (
          <div key={u.id} className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card">
            <div className="relative aspect-[16/10] w-full bg-muted">
              <Image src={roomPhoto(u)} alt={u.unit_name} fittingType="fill" className="h-full w-full" />
              <div className="absolute right-2 top-2"><StatusBadge status={u.status} /></div>
            </div>
            <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13.5px] font-semibold text-forest-900">{u.unit_name}</p>
                <p className="text-[11px] text-muted-foreground">{tx(u.unit_type, lang)}</p>
              </div>
            </div>
            <div className="mt-3 flex-1 space-y-1 text-[11.5px]">
              {u.guest_name ? (
                <>
                  <p className="flex items-center gap-1.5 text-forest-900"><Users className="h-3 w-3 text-muted-foreground" /> {u.guest_name}</p>
                  <p className="text-muted-foreground">{t('入住人数：', 'Number of guests: ')}{u.guest_count || '—'}</p>
                  <p className="text-muted-foreground">{prettyDate(u.check_in, 'd MMM')} → {prettyDate(u.check_out, 'd MMM yyyy')}</p>
                  {u.booking_ref && <p className="font-mono text-[10.5px] text-muted-foreground">{u.booking_ref}</p>}
                </>
              ) : (
                <p className="text-muted-foreground">{t('暂未关联预订。', 'No reservation attached.')}</p>
              )}
              <p className="num pt-1 text-[11.5px] font-medium text-forest-800">{NZD(u.rate_per_night)}{t(' / 晚', ' / night')}</p>
            </div>
            {canWrite && (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
                {u.status !== 'Occupied' && (
                  <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => setUnitStatus(u, { status: 'Occupied' }, t('宾客已入住', 'Guest checked in'))}>
                    <LogIn className="h-3 w-3" /> {t('办理入住', 'Check in')}
                  </Button>
                )}
                {u.status === 'Occupied' && (
                  <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => setUnitStatus(u, { status: 'Cleaning', check_out: today }, t('宾客已退房', 'Guest checked out'))}>
                    <LogOut className="h-3 w-3" /> {t('办理退房', 'Check out')}
                  </Button>
                )}
                {u.status === 'Cleaning' && (
                  <Button variant="outline" size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={() => setUnitStatus(u, { status: 'Available', guest_name: '', guest_count: 0, check_in: '', check_out: '', booking_ref: '' }, t('房间已清洁完毕', 'Unit ready'))}>
                    {t('清洁完成，可入住', 'Ready for guests')}
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => { setEditing(u); setOpen(true); }}>
                  {t('编辑', 'Edit')}
                </Button>
              </div>
            )}
            </div>
          </div>
        ))}
      </div>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t(`编辑 ${editing.unit_name}`, `Edit ${editing.unit_name}`) : t('添加住宿单元', 'Add accommodation unit')}
        description={t('演示住宿记录。', 'Demonstration accommodation record.')}
        fields={fields}
        initialValues={editing || { status: 'Available', guest_count: 2, unit_type: 'Two Bedroom Apartment', rate_per_night: 340 }}
        onSubmit={submit}
        submitLabel={editing ? t('保存房间', 'Save unit') : t('添加房间', 'Add unit')}
      />
    </div>
  );
}