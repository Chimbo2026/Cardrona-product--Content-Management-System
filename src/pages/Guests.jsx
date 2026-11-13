import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, ScanFace } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import DataTable from '@/components/common/DataTable';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { SearchInput, SelectNative } from '@/components/common/Controls';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { NZD, num, prettyDate } from '@/lib/format';
import GuestAvatar from '@/components/guests/GuestAvatar';
import FaceCheckInDialog from '@/components/guests/FaceCheckInDialog';

export default function Guests() {
  const { can } = useRole();
  const { t } = useLang();
  const canWrite = can('guests', 'write');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { items: guests, loading, reload } = useList('Guest', {}, { sort: '-created_date', limit: 300 });
  const { items: bookings } = useList('Booking', {}, { limit: 600 });
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [faceGuest, setFaceGuest] = useState(null);

  const countries = useMemo(() => [...new Set(guests.map((g) => g.country).filter(Boolean))].sort(), [guests]);

  const stats = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.guest_id) return;
      const entry = map[b.guest_id] || { count: 0, spend: 0, last: '' };
      entry.count += 1;
      entry.spend += (Number(b.amount) || 0) * (Number(b.guests_count) || 1);
      if (b.visit_date > entry.last) entry.last = b.visit_date;
      map[b.guest_id] = entry;
    });
    return map;
  }, [bookings]);

  const filtered = guests.filter((g) => {
    if (country !== 'All' && g.country !== country) return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [g.full_name, g.email, g.phone].join(' ').toLowerCase().includes(term);
  });

  const fields = [
    { name: 'full_name', label: t('姓名', 'Full name'), required: true, colSpan: 2 },
    { name: 'email', label: t('邮箱', 'Email'), type: 'text' },
    { name: 'phone', label: t('电话', 'Phone'), type: 'text' },
    { name: 'country', label: t('国家 / 地区', 'Country / region'), type: 'text' },
    { name: 'last_visit', label: t('上次到访', 'Last visit'), type: 'date' },
    { name: 'notes', label: t('宾客备注', 'Guest notes'), type: 'textarea', colSpan: 2, placeholder: t('偏好、无障碍需求、回头客备注…', 'Preferences, accessibility needs, repeat visitor notes…') },
  ];

  const submit = async (values) => {
    if (editing) {
      await base44.entities.Guest.update(editing.id, values);
      toast({ title: t('宾客已更新', 'Guest updated'), description: values.full_name });
    } else {
      await base44.entities.Guest.create({ ...values, visits: 0 });
      toast({ title: t('宾客已创建', 'Guest created'), description: values.full_name });
    }
    reload();
  };

  const columns = [
    {
      key: 'full_name',
      label: t('宾客', 'Guest'),
      render: (g) => (
        <div className="flex items-center gap-3">
          <GuestAvatar guest={g} />
          <div>
            <p className="font-medium text-forest-900">{g.full_name}</p>
            <p className="text-[11px] text-muted-foreground">{g.email || '—'}</p>
            {g.face_checkin_status === 'Checked in' && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                {t('已登记入住', 'Checked in')}
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: 'phone', label: t('电话', 'Phone'), render: (g) => <span className="text-muted-foreground">{g.phone || '—'}</span> },
    { key: 'country', label: t('地区', 'Region'), render: (g) => g.country || '—' },
    { key: 'bookings', label: t('预订数', 'Bookings'), align: 'right', render: (g) => num(stats[g.id]?.count || 0) },
    { key: 'spend', label: t('演示消费额', 'Demo spend'), align: 'right', render: (g) => <span className="num">{NZD(stats[g.id]?.spend || 0)}</span> },
    { key: 'last', label: t('上次到访', 'Last visit'), render: (g) => prettyDate(stats[g.id]?.last || g.last_visit) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (g) =>
        canWrite ? (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11.5px]"
              onClick={(e) => {
                e.stopPropagation();
                setFaceGuest(g);
              }}
            >
              <ScanFace className="h-3 w-3" /> {t('人脸登记', 'Face check-in')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11.5px]"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(g);
                setOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" /> {t('编辑', 'Edit')}
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客服务', 'Guest services')}
        title={t('宾客档案', 'Guest records')}
        description={t('演示宾客档案，含预订历史、联系方式与消费汇总。', 'Demonstration guest profiles with booking history, contact details and spend totals.')}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> {t('新建宾客', 'New guest')}
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('宾客档案', 'Guest profiles'), num(guests.length)],
          [t('覆盖地区', 'Regions represented'), num(countries.length)],
          [t('关联预订', 'Bookings linked'), num(bookings.length)],
          [t('平均演示消费', 'Average demo spend'), NZD(bookings.reduce((s, b) => s + (Number(b.amount) || 0), 0) / Math.max(1, guests.length))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <Panel title={t('宾客名录', 'Guest directory')} bodyClassName="p-0">
        <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder={t('搜索姓名、邮箱或电话…', 'Search name, email or phone…')} className="sm:w-80" />
          <div className="sm:ml-auto">
            <SelectNative ariaLabel={t('地区', 'Region')} value={country} onChange={setCountry} includeAll allLabel={t('全部地区', 'All regions')} options={countries} />
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          onRowClick={(g) => navigate(`/guests/${g.id}`)}
          emptyTitle={t('没有符合条件的宾客', 'No guests match your search')}
          emptyDescription={t('宾客记录仅为演示数据。', 'Guest records are demonstration data only.')}
        />
      </Panel>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t(`编辑 ${editing.full_name}`, `Edit ${editing.full_name}`) : t('新建宾客档案', 'New guest record')}
        description={t('演示宾客记录均为虚构，仅用于演示。', 'Demo guest records are fictional and used for demonstration only.')}
        fields={fields}
        initialValues={editing || {}}
        onSubmit={submit}
        submitLabel={editing ? t('保存宾客', 'Save guest') : t('创建宾客', 'Create guest')}
      />

      <FaceCheckInDialog
        guest={faceGuest}
        open={!!faceGuest}
        onOpenChange={(next) => !next && setFaceGuest(null)}
        onComplete={reload}
      />
    </div>
  );
}