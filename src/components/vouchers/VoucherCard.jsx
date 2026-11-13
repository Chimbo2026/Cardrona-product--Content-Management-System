import { Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';
import { NZD, prettyDate } from '@/lib/format';
import { voucherStatusLabel } from '@/lib/giftVouchers';

// Premium digital voucher card — the visual the guest receives.
export default function VoucherCard({ voucher, className }) {
  const { lang, t } = useLang();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-forest-900/40 bg-gradient-to-br from-forest-950 via-forest-800 to-forest-600 p-5 text-white shadow-[0_18px_40px_-24px_rgba(77,22,19,0.9)]',
        className
      )}
    >
      <Snowflake className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/10" strokeWidth={1} />
      <Snowflake className="pointer-events-none absolute -bottom-10 right-10 h-28 w-28 text-white/[0.06]" strokeWidth={1} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ice-200/80">
            {t('卡德罗纳滑雪场', 'Cardrona Alpine Resort')}
          </p>
          <p className="mt-1 font-heading text-[15px] font-semibold">{t('礼品卡', 'Gift Voucher')}</p>
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ring-1 ring-inset ring-white/20">
          {voucherStatusLabel(voucher.status, lang)}
        </span>
      </div>

      <p className="num relative mt-5 font-heading text-[34px] font-semibold leading-none">
        {NZD(Number(voucher.amount) || 0)}
      </p>
      {Number(voucher.balance) !== Number(voucher.amount) && (
        <p className="relative mt-1 text-[11.5px] text-ice-100/80">
          {t(`剩余 ${NZD(Number(voucher.balance) || 0)}`, `${NZD(Number(voucher.balance) || 0)} remaining`)}
        </p>
      )}

      <div className="relative mt-4 grid gap-2 text-[11.5px] sm:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-ice-200/70">{t('接收人', 'To')}</p>
          <p className="font-medium text-white">{voucher.recipient_name || voucher.guest_name || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-ice-200/70">{t('有效期至', 'Valid until')}</p>
          <p className="font-medium text-white">{voucher.expires_at ? prettyDate(voucher.expires_at) : '—'}</p>
        </div>
      </div>

      {voucher.message && (
        <p className="relative mt-3 rounded-lg bg-white/10 px-3 py-2 text-[11.5px] italic leading-relaxed text-ice-50">
          “{voucher.message}”
        </p>
      )}

      <div className="relative mt-4 flex items-end justify-between gap-3 border-t border-white/15 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-ice-200/70">{t('兑换码', 'Voucher code')}</p>
          <p className="num font-mono text-[15px] font-semibold tracking-[0.12em]">{voucher.code}</p>
        </div>
        <p className="text-right text-[10px] leading-tight text-ice-200/70">
          {voucher.purchaser_name || voucher.guest_name
            ? t(`赠送自 ${voucher.purchaser_name || voucher.guest_name}`, `A gift from ${voucher.purchaser_name || voucher.guest_name}`)
            : t('可转让 · 不可退款', 'Transferable · non-refundable')}
        </p>
      </div>
    </div>
  );
}