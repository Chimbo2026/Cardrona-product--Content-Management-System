import { useState } from 'react';
import { CheckCircle2, Ticket, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { SearchInput, SelectNative, DemoChip } from '@/components/common/Controls';
import SportTabs from '@/components/common/SportTabs';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, dayMonth, num, prettyDate, todayISO } from '@/lib/format';
import { BIKE_INSURANCE_OPTIONS, BIKE_PRICES, BIKE_SIZES, BIKE_TYPES, PASS_PRICES, PASS_PRODUCTS, PASS_TYPES, SEASON_PASS_PRODUCTS, SEASONS } from '@/lib/constants';
import { planDayRelease, productOf } from '@/lib/passCalendar';
import PassCalendar from '@/components/passes/PassCalendar';
import PassDayDialog from '@/components/passes/PassDayDialog';
import AddPassDaysDialog from '@/components/passes/AddPassDaysDialog';
import SeasonPassProducts from '@/components/passes/SeasonPassProducts';

export default function Passes() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('passes', 'write');
  const { toast } = useToast();
  const { items: passes, loading, reload } = useList('LiftPass', {}, { sort: '-created_date', limit: 400 });
  const { items: guests } = useList('Guest', {}, { limit: 200 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [usage, setUsage] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [product, setProduct] = useState('All');
  const [day, setDay] = useState(null);
  const [dayOpen, setDayOpen] = useState(false);
  const [addDate, setAddDate] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const today = todayISO();

  const counts = {
    active: passes.filter((p) => p.usage_status === 'Active').length,
    unused: passes.filter((p) => p.usage_status === 'Unused').length,
    expired: passes.filter((p) => p.usage_status === 'Expired').length,
    cancelled: passes.filter((p) => p.issue_status === 'Cancelled').length,
  };

  const filtered = passes.filter((p) => {
    if (product !== 'All' && productOf(p) !== product) return false;
    if (type !== 'All' && p.pass_type !== type) return false;
    if (usage !== 'All' && p.usage_status !== usage) return false;
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [p.pass_number, p.guest_name].join(' ').toLowerCase().includes(term);
  });

  const fields = [
    {
      name: 'guest_id',
      label: t('宾客', 'Guest'),
      type: 'select',
      required: true,
      colSpan: 2,
      options: guests.map((g) => ({ value: g.id, label: `${g.full_name} · ${g.country || '—'}` })),
    },
    { name: 'product', label: t('产品', 'Product'), type: 'select', options: PASS_PRODUCTS.map((v) => ({ value: v, label: tx(v, lang) })), hint: t(`单车租赁单日 $${BIKE_PRICES['Single Day']} 起。`, `Bike rental from $${BIKE_PRICES['Single Day']} per day.`) },
    {
      name: 'bike_type',
      label: t('选择单车类型', 'Choose type of bike'),
      type: 'select',
      options: BIKE_TYPES,
      showWhen: (v) => v.product === 'Bike Rental',
      hint: t('租赁时选择的山地车类型。', 'Mountain bike type chosen for this rental.'),
    },
    { name: 'bike_size', label: t('选择尺寸', 'Choose your size'), type: 'select', options: BIKE_SIZES, showWhen: (v) => v.product === 'Bike Rental' },
    {
      name: 'bike_insurance',
      label: t('单车保险', 'Bike insurance'),
      type: 'select',
      options: BIKE_INSURANCE_OPTIONS,
      showWhen: (v) => v.product === 'Bike Rental',
      hint: t('为租赁单车添加损坏与责任保险。', 'Adds damage and liability cover to the rental.'),
    },
    { name: 'pass_type', label: t('票种', 'Pass type'), type: 'select', required: true, options: PASS_TYPES.map((v) => ({ value: v, label: tx(v, lang) })), hint: t(`示例价格 ${NZD(PASS_PRICES['Single Day'])} 起——可配置的演示价格。`, `Sample price from $${PASS_PRICES['Single Day']} — configurable demo pricing.`) },
    {
      name: 'pass_product',
      label: t('季票产品', 'Season pass product'),
      type: 'select',
      options: SEASON_PASS_PRODUCTS.map((p) => ({ value: p.value, label: `${p.value} · ${NZD(p.prices[0].price)}` })),
      showWhen: (v) => v.pass_type === 'Season Pass',
      hint: t('Winter 27 Drop 1 价格：畅滑 成人 $1,429 / 儿童 $399 / 长者 $850，优惠 成人 $1,029 / 儿童 $319 / 长者 $689。', 'Winter 27 Drop 1: Unlimited Adult $1,429 / Child $399 / Senior $850, Saver Adult $1,029 / Child $319 / Senior $689.'),
    },
    { name: 'season', label: t('季节', 'Season'), type: 'select', options: SEASONS.map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'price', label: t('价格 (NZD)', 'Price (NZD)'), type: 'number', required: true, hint: t('示例价格，非 Cardrona 官方定价。', 'Sample price, not official Cardrona pricing.') },
    { name: 'days_valid', label: t('有效天数', 'Days valid'), type: 'number', defaultValue: 1 },
    { name: 'valid_from', label: t('生效日期', 'Valid from'), type: 'date', required: true },
    { name: 'valid_to', label: t('失效日期', 'Valid to'), type: 'date', required: true },
    { name: 'issue_status', label: t('发放状态', 'Issue status'), type: 'select', required: true, options: ['Issued', 'Pending', 'Cancelled'].map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'usage_status', label: t('使用状态', 'Usage status'), type: 'select', required: true, options: ['Active', 'Unused', 'Expired'].map((v) => ({ value: v, label: tx(v, lang) })) },
    { name: 'notes', label: t('备注', 'Notes'), type: 'textarea', colSpan: 2 },
  ];

  const submit = async (values) => {
    const guest = guests.find((g) => g.id === values.guest_id);
    if (!guest) throw new Error(t('请先选择宾客再保存票券。', 'Choose a guest before saving the pass.'));
    const payload = { ...values, product: values.product || 'Lift Pass', guest_name: guest.full_name };
    if (editing) {
      await base44.entities.LiftPass.update(editing.id, payload);
      toast({ title: t('票券已更新', 'Pass updated'), description: editing.pass_number });
    } else {
      const n = 48400 + Math.floor(Math.random() * 500);
      await base44.entities.LiftPass.create({ ...payload, pass_number: `LP-${n}` });
      toast({ title: t('票券已发放', 'Pass issued'), description: `LP-${n} · ${guest.full_name}` });
    }
    reload();
  };

  const setStatus = async (pass, patch, message) => {
    await base44.entities.LiftPass.update(pass.id, patch);
    toast({ title: message, description: pass.pass_number });
    reload();
  };

  // Removes a single booked day from a booking without touching the other days.
  const releaseDay = async (pass, date) => {
    const plan = planDayRelease(pass, date);
    if (plan.action === 'delete') {
      await base44.entities.LiftPass.delete(pass.id);
    } else if (plan.action === 'update') {
      await base44.entities.LiftPass.update(pass.id, plan.patch);
    } else {
      await base44.entities.LiftPass.update(pass.id, plan.patch);
      await base44.entities.LiftPass.create({
        pass_number: `${pass.pass_number}-B`,
        product: productOf(pass),
        guest_id: pass.guest_id,
        guest_name: pass.guest_name,
        pass_type: pass.pass_type,
        season: pass.season,
        price: pass.price,
        bike_type: pass.bike_type,
        bike_size: pass.bike_size,
        bike_insurance: pass.bike_insurance,
        issue_status: pass.issue_status,
        usage_status: pass.usage_status,
        notes: pass.notes,
        ...plan.later,
      });
    }
    toast({ title: t('已删除该日期', 'Day deleted'), description: `${pass.pass_number} · ${dayMonth(date)}` });
    reload();
  };

  const columns = [
    { key: 'pass_number', label: t('票号', 'Pass'), render: (p) => <span className="font-mono text-[11.5px] font-medium text-forest-800">{p.pass_number}</span> },
    {
      key: 'guest_name',
      label: t('宾客', 'Guest'),
      render: (p) => (
        <div>
          <p className="font-medium text-forest-900">{p.guest_name}</p>
          <p className="text-[11px] text-muted-foreground">{tx(p.season, lang) || tx('Winter', lang)}</p>
        </div>
      ),
    },
    { key: 'product', label: t('产品', 'Product'), render: (p) => tx(productOf(p), lang) },
    {
      key: 'pass_type',
      label: t('票种', 'Pass type'),
      render: (p) => (
        <div>
          <p>{tx(p.pass_type, lang)}</p>
          {p.pass_product && <p className="text-[11px] text-muted-foreground">{p.pass_product}</p>}
        </div>
      ),
    },
    {
      key: 'validity',
      label: t('有效期', 'Validity'),
      render: (p) => (
        <span className="text-muted-foreground">
          {prettyDate(p.valid_from, 'd MMM')} → {prettyDate(p.valid_to, 'd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'price',
      label: t('价格', 'Price'),
      align: 'right',
      render: (p) => <span className="num font-medium">{NZD(p.price)}</span>,
    },
    { key: 'issue_status', label: t('发放', 'Issue'), render: (p) => <StatusBadge status={p.issue_status} dot={false} /> },
    { key: 'usage_status', label: t('使用', 'Usage'), render: (p) => <StatusBadge status={p.usage_status} /> },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) =>
        canWrite ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[11.5px]">{t('管理', 'Manage')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => {
                  setEditing(p);
                  setOpen(true);
                }}
              >
                {t('编辑票券', 'Edit pass')}
              </DropdownMenuItem>
              {p.issue_status === 'Pending' && (
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setStatus(p, { issue_status: 'Issued', usage_status: p.valid_from <= today ? 'Active' : 'Unused' }, t('票券已发放', 'Pass issued'))}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('标记为已发放', 'Mark issued')}
                </DropdownMenuItem>
              )}
              {p.issue_status !== 'Cancelled' && (
                <DropdownMenuItem
                  className="gap-2 text-rose-600"
                  onSelect={() => setStatus(p, { issue_status: 'Cancelled' }, t('票券已取消', 'Pass cancelled'))}
                >
                  <XCircle className="h-3.5 w-3.5" /> {t('取消票券', 'Cancel pass')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    },
  ];

  const revenue = passes.filter((p) => p.issue_status === 'Issued').reduce((s, p) => s + (Number(p.price) || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客服务', 'Guest services')}
        title={t('缆车票与单车租赁', 'Lift passes & bike rental')}
        description={t('缆车票与夏季单车租赁共用预订日历，可添加、改期或删除已预订日期。价格为可配置的示例数值。', 'Lift passes and summer bike rental share one booking calendar — add, reschedule or delete booked days. Prices are configurable sample values.')}
        actions={
          canWrite ? (
            <Button size="sm" className="gap-1.5" onClick={() => { setEditing(null); setPrefill(null); setOpen(true); }}>
              <Ticket className="h-3.5 w-3.5" /> {t('发放票券', 'Issue pass')}
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          [t('使用中', 'Active'), num(counts.active)],
          [t('未使用', 'Unused'), num(counts.unused)],
          [t('已过期', 'Expired'), num(counts.expired)],
          [t('已取消', 'Cancelled'), num(counts.cancelled)],
          [t('演示票务营收', 'Demo pass revenue'), NZD(revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-ice-200 bg-ice-50/70 px-3.5 py-2.5">
        <DemoChip>{t('示例价格', 'Sample pricing')}</DemoChip>
        <p className="text-[11.5px] text-ice-900">
          {t(
            `单日票 $${PASS_PRICES['Single Day']} · 多日票 $${PASS_PRICES['Multi-Day']}/天 · 季票 $${PASS_PRICES['Season Pass']} · 初学者票 $${PASS_PRICES['Learner Pass']} · 观光票 $${PASS_PRICES['Sightseeing Pass']}。以上为可配置的演示数值，非 Cardrona 官方价格。`,
            `Single day $${PASS_PRICES['Single Day']} · Multi-day $${PASS_PRICES['Multi-Day']}/day · Season $${PASS_PRICES['Season Pass']} · Learner $${PASS_PRICES['Learner Pass']} · Sightseeing $${PASS_PRICES['Sightseeing Pass']}. Configurable demo figures — not official Cardrona prices.`
          )}
        </p>
        <p className="w-full text-[11.5px] text-ice-900">
          {t(
            `单车租赁：单日 $${BIKE_PRICES['Single Day']} · 多日 $${BIKE_PRICES['Multi-Day']}/天 · 季卡 $${BIKE_PRICES['Season Pass']}。同样为可配置的演示数值。`,
            `Bike rental: single day $${BIKE_PRICES['Single Day']} · multi-day $${BIKE_PRICES['Multi-Day']}/day · season $${BIKE_PRICES['Season Pass']}. Also configurable demo figures.`
          )}
        </p>
      </div>

      <div className="mb-4">
        <SeasonPassProducts
          canWrite={canWrite}
          onIssue={(p, row) => {
            setEditing(null);
            setPrefill({
              product: 'Lift Pass',
              pass_type: 'Season Pass',
              pass_product: `${p.value} · ${row.age}`,
              price: row.price,
              season: 'Winter',
              valid_from: today,
              valid_to: today,
              days_valid: 1,
              issue_status: 'Issued',
              usage_status: 'Active',
            });
            setOpen(true);
          }}
        />
      </div>

      <div className="mb-4">
        <PassCalendar
          passes={passes}
          canWrite={canWrite}
          onSelectDay={(key) => {
            setDay(key);
            setDayOpen(true);
          }}
          onAddDays={(date) => {
            setAddDate(date || today);
            setAddOpen(true);
          }}
        />
      </div>

      <Panel title={t('已发放票券', 'Issued passes')} bodyClassName="p-0" action={<span className="text-[11px] text-muted-foreground">{t(`${filtered.length} 张`, `${filtered.length} passes`)}</span>}>
        <div className="flex flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder={t('搜索票号或宾客…', 'Search pass number or guest…')} className="sm:w-80" />
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <SportTabs
              value={product === 'Lift Pass' ? 'Ski' : product === 'Bike Rental' ? 'Bike' : 'All'}
              onChange={(v) => setProduct(v === 'Ski' ? 'Lift Pass' : v === 'Bike' ? 'Bike Rental' : 'All')}
            />
            <SelectNative ariaLabel={t('票种', 'Pass type')} value={type} onChange={setType} includeAll allLabel={t('全部票种', 'All pass types')} options={PASS_TYPES.map((v) => ({ value: v, label: tx(v, lang) }))} />
            <SelectNative ariaLabel={t('使用状态', 'Usage')} value={usage} onChange={setUsage} includeAll allLabel={t('全部使用状态', 'All usage')} options={['Active', 'Unused', 'Expired'].map((v) => ({ value: v, label: tx(v, lang) }))} />
          </div>
        </div>
        <DataTable columns={columns} rows={filtered} loading={loading} emptyTitle={t('没有符合条件的票券', 'No passes match these filters')} emptyDescription={t('发放一张演示票券即可在此查看。', 'Issue a demo pass to see it here.')} />
      </Panel>

      <RecordFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? t(`编辑票券 ${editing.pass_number}`, `Edit pass ${editing.pass_number}`) : t('发放演示缆车票', 'Issue a demo lift pass')}
        description={t('票券记录为演示数据，未连接任何票务系统。', 'Pass records are demonstration data and are not connected to any ticketing system.')}
        fields={fields}
        initialValues={editing || prefill || { product: 'Lift Pass', valid_from: today, valid_to: today, days_valid: 1, issue_status: 'Issued', usage_status: 'Active', season: 'Winter', price: PASS_PRICES['Single Day'] }}
        onSubmit={submit}
        submitLabel={editing ? t('保存票券', 'Save pass') : t('发放票券', 'Issue pass')}
      />

      <PassDayDialog
        open={dayOpen}
        onOpenChange={setDayOpen}
        day={day}
        passes={passes}
        canWrite={canWrite}
        onEdit={(pass) => {
          setEditing(pass);
          setOpen(true);
        }}
        onRelease={releaseDay}
        onAddDays={(date) => {
          setAddDate(date || today);
          setAddOpen(true);
        }}
      />

      <AddPassDaysDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultDate={addDate}
        guests={guests}
        onCreated={reload}
      />
    </div>
  );
}