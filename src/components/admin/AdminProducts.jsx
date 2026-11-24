import { useEffect, useState } from 'react';
import { Loader2, Plus, Pencil, Power } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { CATEGORY_OPTIONS, formatCNY } from '@/lib/booking';

const EMPTY = {
  name: '',
  category: '门票',
  summary: '',
  description: '',
  price: 0,
  price_unit: '每人 / 天',
  duration: '',
  audience: '',
  includes: '',
  name_en: '',
  summary_en: '',
  description_en: '',
  includes_en: '',
  duration_en: '',
  audience_en: '',
  price_unit_en: '',
  image_url: '',
  capacity_per_day: 100,
  peak_multiplier: 1.2,
  aspenware_product_id: '',
  status: 'active',
  sort_order: 10,
  pass_season: 'winter',
  pass_prices: { adult: 0, child: 0, senior: 0 },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const page = await base44.entities.Product.list({ sort: 'sort_order', limit: 100 });
    setProducts(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setDraft(EMPTY);
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (product) => {
    setDraft({
      ...EMPTY,
      ...product,
      includes: (product.includes || []).join('\n'),
      includes_en: (product.includes_en || []).join('\n'),
    });
    setEditingId(product.id);
    setOpen(true);
  };

  const updatePassPrice = (key, value) =>
    setDraft((prev) => ({
      ...prev,
      pass_prices: { ...(prev.pass_prices || {}), [key]: value },
    }));

  const save = async () => {
    setSaving(true);
    const payload = {
      ...draft,
      price: Number(draft.price || 0),
      capacity_per_day: Number(draft.capacity_per_day || 0),
      peak_multiplier: Number(draft.peak_multiplier || 1),
      sort_order: Number(draft.sort_order || 0),
      includes: String(draft.includes || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      includes_en: String(draft.includes_en || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      pass_prices: {
        ...(draft.pass_prices || {}),
        adult: Number(draft.pass_prices?.adult || 0),
        child: Number(draft.pass_prices?.child || 0),
        senior: Number(draft.pass_prices?.senior || 0),
      },
      name_zh: draft.name,
      summary_zh: draft.summary,
      description_zh: draft.description,
    };
    delete payload.id;
    delete payload.created_date;
    delete payload.updated_date;
    delete payload.created_by_id;
    try {
      if (editingId) {
        const updated = await base44.entities.Product.update(editingId, payload);
        setProducts((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await base44.entities.Product.create(payload);
        setProducts((prev) => [...prev, created]);
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (product) => {
    const next = product.status === 'active' ? 'inactive' : 'active';
    const updated = await base44.entities.Product.update(product.id, { status: next });
    setProducts((prev) => prev.map((item) => (item.id === product.id ? updated : item)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-[16px]">产品与套票</h2>
          <p className="text-[11px] text-muted-foreground">
            共 {products.length} 个产品 · 价格与库存将改为读取 Aspenware 定价接口
          </p>
        </div>
        <Button className="h-9 rounded-full text-[12px]" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> 新增产品
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 px-4 py-2.5 text-[11px] text-muted-foreground md:grid">
            <span className="col-span-4">产品</span>
            <span className="col-span-2">分类</span>
            <span className="col-span-2">价格</span>
            <span className="col-span-2">Aspenware 编号</span>
            <span className="col-span-2 text-right">操作</span>
          </div>
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 gap-2 border-b border-slate-100 px-4 py-3 text-[12px] last:border-0 md:grid-cols-12 md:items-center md:gap-3"
            >
              <div className="md:col-span-4">
                <p className="font-medium">{product.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{product.summary}</p>
              </div>
              <span className="text-muted-foreground md:col-span-2">{product.category}</span>
              <div className="md:col-span-2">
                <span className="font-heading">{formatCNY(product.price)}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">/ {product.price_unit}</span>
                {Number(product.peak_multiplier) > 1 && (
                  <p className="text-[10px] text-muted-foreground">旺季 ×{product.peak_multiplier}</p>
                )}
              </div>
              <span className="font-mono text-[11px] text-muted-foreground md:col-span-2">
                {product.aspenware_product_id || '未配置'}
              </span>
              <div className="flex gap-2 md:col-span-2 md:justify-end">
                <span
                  className={`self-center rounded-full px-2 py-0.5 text-[10px] ${
                    product.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {product.status === 'active' ? '在售' : '已下架'}
                </span>
                <Button variant="outline" size="sm" className="h-7 rounded-full text-[11px]" onClick={() => openEdit(product)}>
                  <Pencil className="h-3 w-3" /> 编辑
                </Button>
                <Button variant="outline" size="sm" className="h-7 rounded-full text-[11px]" onClick={() => toggleStatus(product)}>
                  <Power className="h-3 w-3" /> {product.status === 'active' ? '下架' : '上架'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑产品' : '新增产品'}</DialogTitle>
            <DialogDescription>
              价格与接待上限用于小程序展示；正式环境由 Aspenware 定价接口返回。
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-[12px]">产品名称</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-[12px]">分类</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">状态</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在售</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[12px]">价格（NZD）</Label>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">季票季节</Label>
              <Select
                value={draft.pass_season || 'winter'}
                onValueChange={(v) => setDraft({ ...draft, pass_season: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="winter">冬季季票</SelectItem>
                  <SelectItem value="summer">夏季季票</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {['adult', 'child', 'senior'].map((band) => (
              <div key={band}>
                <Label className="text-[12px]">
                  季票价 · ${{ adult: '成人', child: '儿童', senior: '长者' }[band]}（NZD）
                </Label>
                <Input
                  type="number"
                  value={draft.pass_prices?.[band] ?? 0}
                  onChange={(e) => updatePassPrice(band, e.target.value)}
                  className="mt-1.5"
                />
              </div>
            ))}
            <div>
              <Label className="text-[12px]">计价单位</Label>
              <Input
                value={draft.price_unit}
                onChange={(e) => setDraft({ ...draft, price_unit: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-muted/40 p-3">
              <p className="text-[11px] font-medium">详情页的两个标签</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                产品详情页图片下方的两个圆角标签。中英文分别填写，留空时显示默认文案。
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <div>
                  <Label className="text-[12px]">标签一 · 时长</Label>
                  <Input
                    value={draft.duration}
                    onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
                    placeholder="例如：4.5 小时 / 全天 / 2027 冬季全季"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-[12px]">Badge 1 · Duration (EN)</Label>
                  <Input
                    value={draft.duration_en}
                    onChange={(e) => setDraft({ ...draft, duration_en: e.target.value })}
                    placeholder="e.g. 4.5 hours / Full day / Winter 27 season"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-[12px]">标签二 · 适合人群</Label>
                  <Input
                    value={draft.audience}
                    onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
                    placeholder="例如：所有年龄 / 零基础成人 / 成人 / 儿童"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-[12px]">Badge 2 · Audience (EN)</Label>
                  <Input
                    value={draft.audience_en}
                    onChange={(e) => setDraft({ ...draft, audience_en: e.target.value })}
                    placeholder="e.g. All ages / Adult beginners / Adult / Child"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-[12px]">每日接待上限</Label>
              <Input
                type="number"
                value={draft.capacity_per_day}
                onChange={(e) => setDraft({ ...draft, capacity_per_day: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">周末 / 旺季系数</Label>
              <Input
                type="number"
                step="0.1"
                value={draft.peak_multiplier}
                onChange={(e) => setDraft({ ...draft, peak_multiplier: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">Aspenware 产品编号</Label>
              <Input
                value={draft.aspenware_product_id}
                onChange={(e) => setDraft({ ...draft, aspenware_product_id: e.target.value })}
                placeholder="留空表示尚未映射"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[12px]">排序</Label>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-[12px]">一句话简介</Label>
              <Input
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-[12px]">产品说明</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-[12px]">费用包含（每行一项）</Label>
              <Textarea
                value={draft.includes}
                onChange={(e) => setDraft({ ...draft, includes: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-muted/40 p-3">
              <p className="text-[11px] font-medium">英文版内容（_en 字段）</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                系统不做机器翻译：中文与英文需分别录入；英文留空时，英文界面回退显示中文内容。
              </p>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="text-[12px]">Product name (EN)</Label>
                  <Input
                    value={draft.name_en}
                    onChange={(e) => setDraft({ ...draft, name_en: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[12px]">Price unit (EN)</Label>
                  <Input
                    value={draft.price_unit_en}
                    onChange={(e) => setDraft({ ...draft, price_unit_en: e.target.value })}
                    placeholder="e.g. person / day"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[12px]">Summary (EN)</Label>
                  <Input
                    value={draft.summary_en}
                    onChange={(e) => setDraft({ ...draft, summary_en: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[12px]">Description (EN)</Label>
                  <Textarea
                    value={draft.description_en}
                    onChange={(e) => setDraft({ ...draft, description_en: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[12px]">What's included (EN, one per line)</Label>
                  <Textarea
                    value={draft.includes_en}
                    onChange={(e) => setDraft({ ...draft, includes_en: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-[12px]">产品图片链接</Label>
              <Input
                value={draft.image_url}
                onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button className="rounded-full" onClick={save} disabled={saving || !draft.name}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}