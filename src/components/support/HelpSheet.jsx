import { useEffect, useState } from 'react';
import { ChevronDown, Copy, Check, MessageCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import { localizedField } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

// 演示用企业微信客服号，正式上线时替换为真实账号
const SERVICE_WECHAT = 'SnowPeak-CS';

export default function HelpSheet() {
  const { lang, bi } = useLanguage();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    loadWithRetry(
      () => base44.entities.FAQ.filter({ status: 'active' }, { sort: 'sort_order', limit: 20 }),
      { items: [] },
    )
      .then((page) => {
        if (active) setFaqs(page.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(SERVICE_WECHAT);
      setCopied(true);
      toast({ title: bi('客服号已复制', 'WeChat ID copied') });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: bi('复制失败，请手动输入', 'Copy failed, please type it manually') });
    }
  };

  return (
    <div className="px-4 pt-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
          <MessageCircle className="h-4 w-4 text-primary" /> {bi('企业微信客服', 'WeCom support')}
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {bi(
            '添加企业微信客服，中文顾问在线解答雪票、订单与退款问题。',
            'Add our WeCom support for help with passes, orders and refunds.',
          )}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2">
          <span className="font-mono text-[12px]">{SERVICE_WECHAT}</span>
          <button
            type="button"
            onClick={copyId}
            className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-medium text-primary-foreground"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? bi('已复制', 'Copied') : bi('复制', 'Copy')}
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <Clock className="h-3 w-3" /> {bi('每日 09:00 – 21:00（新西兰时间）', 'Daily 09:00 – 21:00 (NZT)')}
        </p>
      </div>

      <h3 className="mt-4 text-[12.5px] font-semibold">{bi('常见问题', 'Frequently asked')}</h3>
      {loading ? (
        <p className="mt-3 py-6 text-center text-[11.5px] text-muted-foreground">
          {bi('加载中…', 'Loading…')}
        </p>
      ) : faqs.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-[11.5px] text-muted-foreground">
          {bi('暂无常见问题，请联系客服', 'No questions yet, please contact support')}
        </p>
      ) : (
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {faqs.map((faq) => {
            const open = openId === faq.id;
            return (
              <div key={faq.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                >
                  <span className="flex-1 text-[12px] font-medium leading-snug">
                    {localizedField(faq, 'question', lang)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {open && (
                  <p className="px-3.5 pb-3.5 text-[11px] leading-relaxed text-muted-foreground">
                    {localizedField(faq, 'answer', lang)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}