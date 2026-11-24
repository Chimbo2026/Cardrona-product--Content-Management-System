import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Users, Ticket, ShoppingBag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RetailOrderCard from '@/components/orders/RetailOrderCard';
import AgentAccessCard from '@/components/agent/AgentAccessCard';
import useCurrentUser from '@/hooks/useCurrentUser';
import { AGENT_STATUS_META, REGION_OPTIONS, codeLabel, formatCNY } from '@/lib/booking';
import { formatNZD } from '@/lib/shop';

export default function AgentCenter() {
  const { user } = useCurrentUser();
  const [agent, setAgent] = useState(null);
  const [codes, setCodes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [retailOrders, setRetailOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [form, setForm] = useState({ name: '', company: '', phone: '', region: '新西兰', notes: '' });

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const records = await base44.entities.Agent.filter({ email: user.email });
      const record = records[0] || null;
      if (!active) return;
      setAgent(record);
      if (record) {
        const codeList = await base44.entities.DiscountCode.filter({ agent_email: user.email });
        const page = await base44.entities.Booking.filter(
          { agent_email: user.email },
          { sort: '-created_date', limit: 50 },
        );
        const codeValues = codeList.map((code) => code.code);
        const retailPage = codeValues.length
          ? await base44.entities.RetailOrder.filter(
              { agent_code: { $in: codeValues } },
              { sort: '-created_date', limit: 50 },
            )
          : { items: [] };
        if (active) {
          setCodes(codeList);
          setOrders(page.items || []);
          setRetailOrders(retailPage.items || []);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const submitApplication = async () => {
    setApplyError('');
    if (!form.name.trim() || !form.company.trim()) {
      setApplyError('请填写联系人姓名与公司名称');
      return;
    }
    setApplying(true);
    try {
      const created = await base44.entities.Agent.create({
        name: form.name,
        company: form.company,
        email: user.email,
        phone: form.phone,
        region: form.region,
        notes: form.notes,
        status: 'pending',
        commission_rate: 8,
        joined_date: new Date().toISOString().slice(0, 10),
      });
      setAgent(created);
    } finally {
      setApplying(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied(code);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-4 px-4 pb-8 pt-4">
        <AgentAccessCard />
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <Users className="h-5 w-5" />
          </span>
          <h1 className="mt-3 font-heading text-[17px]">申请成为合作代理</h1>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            提交资料后由运营审核，通过后可获得专属折扣码与佣金结算。
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-[11px]">联系人姓名*</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label className="text-[11px]">公司 / 旅行社名称*</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="mt-1.5 h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">联系电话</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5 h-10"
                />
              </div>
              <div>
                <Label className="text-[11px]">主要客源地区</Label>
                <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                  <SelectTrigger className="mt-1.5 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[11px]">合作说明</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="例如：主营南岛家庭滑雪团"
                className="mt-1.5 h-10"
              />
            </div>
          </div>
          {applyError && <p className="mt-3 text-[11px] text-destructive">{applyError}</p>}
          <Button
            className="mt-4 h-11 w-full rounded-full"
            onClick={submitApplication}
            disabled={applying}
          >
            {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : '提交申请'}
          </Button>
        </div>
      </div>
    );
  }

  const statusMeta = AGENT_STATUS_META[agent.status] || AGENT_STATUS_META.pending;
  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const commission = Math.round((revenue * Number(agent.commission_rate || 0)) / 100);
  const paidRetail = retailOrders.filter((order) => order.payment_status === 'paid');
  const retailRevenue = paidRetail.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const retailCommission = Math.round((retailRevenue * Number(agent.commission_rate || 0)) / 100);

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <AgentAccessCard />
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-[17px]">{agent.company || agent.name}</h1>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {agent.name} · {agent.region} · {agent.email}
            </p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusMeta.tone}`}>
            {statusMeta.label}
          </span>
        </div>

        {agent.status === 'pending' && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            资料已提交，运营审核通过后即可查看专属折扣码与佣金数据。
          </p>
        )}
        {agent.status === 'suspended' && (
          <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-[11px] text-slate-600">
            合作已暂停，请联系运营了解详情。
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Ticket className="h-3 w-3 text-primary" /> 雪票订单
          </p>
          <p className="mt-2 font-heading text-[16px]">{orders.length} 笔</p>
          <p className="text-[10px] text-muted-foreground">成交 {formatCNY(revenue)}</p>
          <p className="mt-1 text-[10px] text-accent-foreground">
            佣金 {formatCNY(commission)} · {agent.commission_rate || 8}%
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShoppingBag className="h-3 w-3 text-primary" /> 商店订单
          </p>
          <p className="mt-2 font-heading text-[16px]">{retailOrders.length} 笔</p>
          <p className="text-[10px] text-muted-foreground">成交 {formatNZD(retailRevenue)}</p>
          <p className="mt-1 text-[10px] text-accent-foreground">
            佣金 {formatNZD(retailCommission)} · {agent.commission_rate || 8}%
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-[15px]">我的专属折扣码</h2>
        {codes.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
            暂未分配折扣码，请联系运营
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {codes.map((code) => (
              <div key={code.id} className="rounded-2xl border border-border bg-card p-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[15px] tracking-wider text-primary">{code.code}</span>
                  <button
                    type="button"
                    onClick={() => copyCode(code.code)}
                    className="ml-auto flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground transition hover:text-foreground"
                  >
                    {copied === code.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied === code.code ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {code.label || '代理专属价'} · {codeLabel(code)} · 适用范围 {code.scope || '全部'}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  已使用 {code.used_count || 0}
                  {code.usage_limit ? ` / ${code.usage_limit}` : ' 次（不限）'}
                  {code.valid_to ? ` · 有效期至 ${code.valid_to}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-[15px]">代理订单</h2>
        {orders.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
            暂无通过你的折扣码成交的订单
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-border bg-card p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px]">{order.product_name}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{order.order_no}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {order.visit_date} · {order.quantity} 人 · {order.guest_name_pinyin || '—'}
                  </span>
                  <span className="font-heading text-[14px] text-primary">
                    {formatCNY(order.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-[15px]">商店订单</h2>
        {retailOrders.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
            暂无通过代理链接成交的商店订单
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {retailOrders.map((order) => (
              <RetailOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
