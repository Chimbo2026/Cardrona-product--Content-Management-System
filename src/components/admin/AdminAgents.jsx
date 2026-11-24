import { useEffect, useState } from 'react';
import { Loader2, Plus, Check, Ban } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AGENT_STATUS_META, CATEGORY_OPTIONS, REGION_OPTIONS, codeLabel } from '@/lib/booking';

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    code: '',
    label: '',
    agent_email: '',
    type: 'percent',
    value: 10,
    scope: '全部',
    valid_from: '',
    valid_to: '',
    usage_limit: 0,
  });

  const load = async () => {
    const [agentPage, codeList] = await Promise.all([
      base44.entities.Agent.list({ sort: '-created_date', limit: 100 }),
      base44.entities.DiscountCode.list({ sort: '-created_date', limit: 100 }),
    ]);
    setAgents(agentPage.items || []);
    setCodes(codeList.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (agent, status) => {
    const updated = await base44.entities.Agent.update(agent.id, { status });
    setAgents((prev) => prev.map((item) => (item.id === agent.id ? updated : item)));
  };

  const setRate = async (agent, value) => {
    const updated = await base44.entities.Agent.update(agent.id, { commission_rate: Number(value) });
    setAgents((prev) => prev.map((item) => (item.id === agent.id ? updated : item)));
  };

  const createCode = async () => {
    setSaving(true);
    try {
      const agent = agents.find((item) => item.email === draft.agent_email);
      const created = await base44.entities.DiscountCode.create({
        ...draft,
        code: draft.code.trim().toUpperCase(),
        value: Number(draft.value || 0),
        usage_limit: Number(draft.usage_limit || 0),
        used_count: 0,
        status: 'active',
        agent_name: agent?.company || agent?.name || '',
      });
      setCodes((prev) => [created, ...prev]);
      setOpen(false);
      setDraft({ ...draft, code: '', label: '' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-heading text-[16px]">合作代理</h2>
        <p className="text-[11px] text-muted-foreground">共 {agents.length} 家 · 审核通过与佣金比例在此维护</p>
        <div className="mt-3 space-y-2">
          {agents.map((agent) => {
            const meta = AGENT_STATUS_META[agent.status] || AGENT_STATUS_META.pending;
            return (
              <div
                key={agent.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="min-w-[220px] flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading text-[14px]">{agent.company || agent.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.tone}`}>{meta.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {agent.name} · {agent.region} · {agent.email}
                    {agent.phone ? ` · ${agent.phone}` : ''}
                  </p>
                  {agent.notes && <p className="mt-0.5 text-[11px] text-muted-foreground">备注：{agent.notes}</p>}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">佣金比例</span>
                  <Input
                    type="number"
                    defaultValue={agent.commission_rate}
                    onBlur={(e) => setRate(agent, e.target.value)}
                    className="h-8 w-20 text-[12px]"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <div className="flex gap-2">
                  {agent.status !== 'active' && (
                    <Button size="sm" className="h-8 rounded-full text-[11px]" onClick={() => setStatus(agent, 'active')}>
                      <Check className="h-3.5 w-3.5" /> 审核通过
                    </Button>
                  )}
                  {agent.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full text-[11px]"
                      onClick={() => setStatus(agent, 'suspended')}
                    >
                      <Ban className="h-3.5 w-3.5" /> 暂停合作
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {agents.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-[12px] text-muted-foreground">
              暂无代理申请
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-[16px]">专属折扣码</h2>
            <p className="text-[11px] text-muted-foreground">共 {codes.length} 个 · 小程序下单时输入生效</p>
          </div>
          <Button className="h-9 rounded-full text-[12px]" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> 新建折扣码
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {codes.map((code) => (
            <div
              key={code.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-[12px]"
            >
              <span className="font-mono text-[14px] tracking-wider">{code.code}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {codeLabel(code)}
              </span>
              <span className="text-muted-foreground">{code.label || '代理专属价'}</span>
              <span className="text-muted-foreground">
                {code.agent_name || code.agent_email || '未绑定代理'}
              </span>
              <span className="text-muted-foreground">适用范围 {code.scope || '全部'}</span>
              <span className="ml-auto text-muted-foreground">
                已用 {code.used_count || 0}
                {code.usage_limit ? ` / ${code.usage_limit}` : ' 次（不限）'}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  code.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {code.status === 'active' ? '生效中' : '已停用'}
              </span>
            </div>
          ))}
          {codes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-[12px] text-muted-foreground">
              暂无折扣码
            </p>
          )}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建代理折扣码</DialogTitle>
            <DialogDescription>绑定代理后，使用该折扣码成交的订单将计入代理佣金。</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[12px]">折扣码</Label>
              <Input
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="例如 KIWI10"
                className="mt-1.5 font-mono uppercase"
              />
            </div>
            <div>
              <Label className="text-[12px]">说明</Label>
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="例如 新西兰代理协议价"
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[12px]">绑定代理</Label>
              <Select value={draft.agent_email} onValueChange={(v) => setDraft({ ...draft, agent_email: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="选择代理" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.email}>
                      {agent.company || agent.name}（{agent.email}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">折扣类型</Label>
              <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">按比例折扣</SelectItem>
                  <SelectItem value="fixed">固定立减</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">{draft.type === 'percent' ? '折扣比例（%）' : '立减金额（NZD）'}</Label>
              <Input
                type="number"
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">适用范围</Label>
              <Select value={draft.scope} onValueChange={(v) => setDraft({ ...draft, scope: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部产品</SelectItem>
                  {CATEGORY_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      仅 {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">使用次数上限（0 为不限）</Label>
              <Input
                type="number"
                value={draft.usage_limit}
                onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">生效日期</Label>
              <Input
                type="date"
                value={draft.valid_from}
                onChange={(e) => setDraft({ ...draft, valid_from: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">失效日期</Label>
              <Input
                type="date"
                value={draft.valid_to}
                onChange={(e) => setDraft({ ...draft, valid_to: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="col-span-2 text-[11px] text-muted-foreground">
              客源地区选项：{REGION_OPTIONS.join(' / ')}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button className="rounded-full" onClick={createCode} disabled={saving || !draft.code}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}