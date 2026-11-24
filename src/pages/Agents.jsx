import { useMemo, useState } from 'react';
import { Handshake, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import EmptyState from '@/components/common/EmptyState';
import StatusBadge from '@/components/common/StatusBadge';
import { SearchInput, SelectNative, DemoChip } from '@/components/common/Controls';
import AgentCard from '@/components/agents/AgentCard';
import AgentDialog from '@/components/agents/AgentDialog';
import useList from '@/hooks/useList';
import { useRole } from '@/lib/RoleContext';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { NZD, num, prettyDate } from '@/lib/format';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/7Hu2v7zuUle1o9fQEaIq43/5d434b9b7fe77db068e60d8d9c7738e7/W24-Mountains_TC_Hero_Desktop.webp?w=1600&fm=webp&q=75';

const bookingTotal = (b) => (Number(b.amount) || 0) * (Number(b.guests_count) || 1);

export default function Agents() {
  const { can } = useRole();
  const { lang, t } = useLang();
  const canWrite = can('agents', 'write');

  const { items: agents, loading, reload } = useList('Agent', {}, { sort: '-created_date', limit: 100 });
  const { items: bookings } = useList('Booking', {}, { sort: '-visit_date', limit: 400 });

  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('All');
  const [agentFilter, setAgentFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const agentBookings = useMemo(
    () => bookings.filter((b) => b.agent_id || b.channel === 'Agent'),
    [bookings]
  );

  const statsFor = (agent) => {
    const rows = agentBookings.filter((b) => b.agent_id === agent.id || b.agent_name === agent.company_name);
    const gross = rows.reduce((s, b) => s + bookingTotal(b), 0);
    const net = gross * (1 - (Number(agent.discount_rate) || 0) / 100);
    return { orders: rows.length, gross, net };
  };

  const cards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents.filter((a) => {
      if (q && !`${a.company_name} ${a.agent_code} ${a.market} ${a.contact_name}`.toLowerCase().includes(q)) return false;
      if (tier !== 'All' && String(a.discount_rate) !== tier) return false;
      return true;
    });
  }, [agents, search, tier]);

  const totals = useMemo(() => {
    const gross = agentBookings.reduce((s, b) => s + bookingTotal(b), 0);
    const net = agents.reduce((sum, a) => sum + statsFor(a).net, 0);
    return {
      active: agents.filter((a) => a.status === 'Active').length,
      agents: agents.length,
      orders: agentBookings.length,
      gross,
      net,
    };
  }, [agents, agentBookings]);

  const trackedOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agentBookings
      .filter((b) => {
        if (q && !`${b.booking_ref} ${b.guest_name} ${b.agent_name || ''}`.toLowerCase().includes(q)) return false;
        if (agentFilter !== 'All' && b.agent_id !== agentFilter) return false;
        return true;
      })
      .slice(0, 80);
  }, [agentBookings, search, agentFilter]);

  const discountFor = (b) => {
    if (b.agent_discount) return Number(b.agent_discount);
    const agent = agents.find((a) => a.id === b.agent_id || a.company_name === b.agent_name);
    return Number(agent?.discount_rate) || 0;
  };

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('渠道分销', 'Trade distribution')}
        title={t('渠道代理', 'Agents')}
        description={t('5% / 10% / 15% 净价折扣的旅业伙伴，含订单追踪与净额结算口径。', 'Trade partners on 5% / 10% / 15% net-rate discounts, with order tracking and net settlement.')}
        actions={canWrite ? (
          <Button size="sm" className="gap-1.5 bg-white text-forest-900 hover:bg-white/90" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> {t('新增代理', 'Add agent')}
          </Button>
        ) : null}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [t('合作代理', 'Agents'), `${num(totals.active)} / ${num(totals.agents)}`],
          [t('渠道订单', 'Agent orders'), num(totals.orders)],
          [t('渠道交易额', 'Agent gross'), NZD(totals.gross)],
          [t('代理净额', 'Agent net'), NZD(totals.net)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/80 bg-card px-4 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
            <p className="num mt-1 text-[19px] font-semibold text-forest-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t('搜索代理或市场…', 'Search agent or market…')} className="w-full sm:w-64" />
        <SelectNative
          ariaLabel={t('折扣层级', 'Discount tier')}
          value={tier}
          onChange={setTier}
          includeAll
          allLabel={t('全部折扣', 'All discounts')}
          options={[
            { value: '5', label: '5%' },
            { value: '10', label: '10%' },
            { value: '15', label: '15%' },
          ]}
        />
        <DemoChip className="ml-auto">{t('演示代理', 'Demo agents')}</DemoChip>
      </div>

      {loading && <p className="py-8 text-center text-[12.5px] text-muted-foreground">{t('正在加载代理…', 'Loading agents…')}</p>}

      {!loading && cards.length === 0 && (
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <EmptyState icon={Handshake} title={t('暂无代理', 'No agents yet')} description={t('新增代理后可追踪净价订单与结算。', 'Add an agent to track net-rate orders and settlement.')} />
        </div>
      )}

      {!loading && cards.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              stats={statsFor(a)}
              canWrite={canWrite}
              onEdit={() => { setEditing(a); setFormOpen(true); }}
            />
          ))}
        </div>
      )}

      <Panel
        title={t(`渠道订单追踪（${trackedOrders.length}）`, `Agent order tracking (${trackedOrders.length})`)}
        description={t('按代理筛选，净额已扣除净价折扣', 'Filter by agent — net already reflects the discount')}
        bodyClassName="p-0"
        action={
          <SelectNative
            ariaLabel={t('代理', 'Agent')}
            value={agentFilter}
            onChange={setAgentFilter}
            includeAll
            allLabel={t('全部代理', 'All agents')}
            options={agents.map((a) => ({ value: a.id, label: a.company_name }))}
          />
        }
      >
        {trackedOrders.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Handshake} title={t('暂无渠道订单', 'No agent orders')} description={t('在预订中选择「渠道代理」并指定代理后，订单会显示在这里。', 'Orders appear here once a booking is placed through an agent.')} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-border/80 text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-2.5 font-semibold">{t('到访日期', 'Visit date')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('预订编号', 'Reference')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('宾客', 'Guest')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('代理', 'Agent')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('折扣', 'Discount')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('金额', 'Amount')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('净额', 'Net')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('状态', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {trackedOrders.map((b) => {
                  const gross = bookingTotal(b);
                  const rate = discountFor(b);
                  return (
                    <tr key={b.id} className="border-b border-border/60">
                      <td className="num px-4 py-2.5 text-[11.5px] text-forest-900">{prettyDate(b.visit_date)}</td>
                      <td className="num px-3 py-2.5 text-[11.5px] font-semibold text-forest-900">{b.booking_ref}</td>
                      <td className="px-3 py-2.5 text-[11.5px] text-forest-900">
                        {b.guest_name}
                        <p className="text-[10px] text-muted-foreground">{tx(b.activity, lang)}</p>
                      </td>
                      <td className="px-3 py-2.5 text-[11.5px] text-forest-900">{b.agent_name || agents.find((a) => a.id === b.agent_id)?.company_name || '—'}</td>
                      <td className="num px-3 py-2.5 text-[11.5px] text-muted-foreground">-{rate}%</td>
                      <td className="num px-3 py-2.5 text-[11.5px] text-forest-900">{NZD(gross)}</td>
                      <td className="num px-3 py-2.5 text-[12px] font-medium text-forest-950">{NZD(gross * (1 - rate / 100))}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={b.booking_status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AgentDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        agent={editing}
        existingCodes={agents.map((a) => a.agent_code)}
        onSaved={reload}
      />
    </div>
  );
}