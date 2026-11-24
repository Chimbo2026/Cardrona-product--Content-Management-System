import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const LABELS = {
  wechat: ['微信支付', 'WeChat Pay'],
  card: ['信用卡', 'Credit card'],
  alipay: ['支付宝', 'Alipay'],
  cash: ['现金', 'Cash'],
  account: ['挂账', 'Account'],
  unknown: ['未记录', 'Not recorded'],
};

const TONES = {
  wechat: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  card: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  alipay: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  cash: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  account: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  unknown: 'bg-slate-100 text-slate-500 ring-slate-500/15',
};

export default function MethodBadge({ kind = 'unknown' }) {
  const { t } = useLang();
  const [zh, en] = LABELS[kind] || LABELS.unknown;

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset',
        TONES[kind] || TONES.unknown
      )}
    >
      {t(zh, en)}
    </span>
  );
}