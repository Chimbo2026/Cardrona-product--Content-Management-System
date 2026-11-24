import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, QrCode, AlertCircle, RotateCcw, Undo2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import StatusBadge from '@/components/StatusBadge';
import IntegrationNotice from '@/components/IntegrationNotice';
import MockQr from '@/components/MockQr';
import { Button } from '@/components/ui/button';
import {
  PAYMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  SYNC_META,
  formatCNY,
  maskDocument,
} from '@/lib/booking';
import { paymentLabel, paymentStatusLabel, syncLabel } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getDemoBooking } from '@/lib/demoBookings';

export default function OrderDetail() {
  const { lang, bi } = useLanguage();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [openingSignature, setOpeningSignature] = useState(false);

  useEffect(() => {
    let active = true;
    loadWithRetry(() => base44.entities.Booking.get(id))
      .then((record) => {
        if (active) setBooking(record || getDemoBooking(id));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const openSignature = async () => {
    setOpeningSignature(true);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: booking.waiver_signature_file,
        expires_in: 300,
      });
      window.open(signed_url, '_blank', 'noopener');
    } finally {
      setOpeningSignature(false);
    }
  };

  const requestChange = async (type) => {
    setActing(true);
    const patch =
      type === 'refund'
        ? { status: 'refund_requested', payment_status: 'refund_pending' }
        : { status: 'reschedule_requested' };
    const updated = await base44.entities.Booking.update(booking.id, patch);
    setBooking(updated);
    setActing(false);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-[13px] text-muted-foreground">
        {bi('未找到该订单', 'Order not found')}
      </div>
    );
  }

  const sync = SYNC_META[booking.aspenware_sync_status] || SYNC_META.not_connected;
  const guests = [booking, ...(booking.extra_guests || [])];

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="snow-ridge flex items-start justify-between px-4 py-4 text-white">
          <div>
            <p className="text-[11px] text-white/70">
              {bi('电子票 · 订单号', 'E-ticket · Order no.')}
            </p>
            <p className="font-mono text-[15px] tracking-wider">{booking.order_no}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <QrCode className="h-4 w-4" />
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <StatusBadge status={booking.status} />
          <span className="text-[11px] text-muted-foreground">
            {paymentStatusLabel(booking.payment_status, lang)}
          </span>
        </div>
        <div className="space-y-2 border-t border-dashed border-border px-4 py-4 text-[12px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('产品', 'Product')}</span>
            <span className="max-w-[60%] text-right">{booking.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('游玩日期', 'Visit dates')}</span>
            <span>
              {booking.visit_end_date && booking.visit_end_date !== booking.visit_date
                ? `${booking.visit_date} – ${booking.visit_end_date}`
                : booking.visit_date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('人数', 'Guests')}</span>
            <span>
              {bi(`${booking.quantity} 人`, `${booking.quantity}`)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('单价', 'Unit price')}</span>
            <span>{formatCNY(booking.unit_price)}</span>
          </div>
          {booking.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>
                {bi('折扣', 'Discount')} {booking.discount_code}
                {booking.agent_name ? ` (${booking.agent_name})` : ''}
              </span>
              <span>-{formatCNY(booking.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-dashed border-border pt-2">
            <span className="text-muted-foreground">{bi('实付金额', 'Total paid')}</span>
            <span className="font-heading text-[16px] text-primary">
              {formatCNY(booking.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {['confirmed', 'used'].includes(booking.status) && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="font-heading text-[14px]">{bi('电子票二维码', 'E-ticket QR code')}</p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            {bi('缆车闸机出示 · 建议调高屏幕亮度', 'Show at the lift gate · turn your brightness up')}
          </p>
          <MockQr value={booking.order_no} className="mx-auto mt-3 h-40 w-40 text-foreground" />
          <p className="mt-2 font-mono text-[11px] tracking-wider text-muted-foreground">
            {booking.order_no}
          </p>
          <p className="mt-1 text-[10.5px] text-muted-foreground">
            {booking.visit_end_date && booking.visit_end_date !== booking.visit_date
              ? `${booking.visit_date} – ${booking.visit_end_date}`
              : booking.visit_date}{' '}
            · {bi(`${booking.quantity} 人`, `${booking.quantity} guest${booking.quantity === 1 ? '' : 's'}`)}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="font-heading text-[14px]">
          {bi('游客信息与免责声明', 'Guests & liability waiver')}
        </p>
        <div className="mt-3 space-y-3">
          {guests.map((guest, index) => (
            <div key={index} className="rounded-xl bg-muted/50 p-3 text-[11px]">
              <p className="font-medium">
                {index === 0
                  ? bi('主要游客', 'Lead guest')
                  : bi(`同行游客 ${index + 1}`, `Guest ${index + 1}`)}{' '}
                · {guest.guest_name_pinyin || guest.name_pinyin || '—'}
              </p>
              <div className="mt-1.5 space-y-0.5 text-muted-foreground">
                <p>
                  {bi('法定姓名', 'Legal name')}：{guest.guest_legal_name || guest.legal_name || '—'}
                </p>
                <p>
                  {bi('出生日期', 'Date of birth')}：{guest.guest_dob || guest.dob || '—'}
                </p>
                <p>
                  {bi('国籍 / 地区', 'Nationality / region')}：{guest.guest_nationality || guest.nationality || '—'}
                </p>
                {index === 0 && (
                  <p>{bi('护照号码', 'Passport no.')}：{maskDocument(guest.guest_document_no)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            {booking.waiver_signed
              ? bi(
                  `免责声明已签署${booking.waiver_signature ? ` · 签署人 ${booking.waiver_signature}` : ''}`,
                  `Waiver signed${booking.waiver_signature ? ` · ${booking.waiver_signature}` : ''}`,
                )
              : bi('免责声明未签署', 'Waiver not signed')}
          </span>
          {booking.waiver_signature_file && (
            <button
              type="button"
              onClick={openSignature}
              disabled={openingSignature}
              className="shrink-0 rounded-full border border-emerald-300 px-2 py-0.5 text-[10px] font-medium disabled:opacity-60"
            >
              {openingSignature ? bi('打开中…', 'Opening…') : bi('查看签名图', 'View signature')}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 text-[12px]">
        <p className="font-heading text-[14px]">{bi('支付信息', 'Payment')}</p>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('支付方式', 'Method')}</span>
            <span>{paymentLabel(booking.payment_method, lang) || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('支付状态', 'Status')}</span>
            <span>{paymentStatusLabel(booking.payment_status, lang)}</span>
          </div>
          {booking.payment_ref && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{bi('支付流水号', 'Reference')}</span>
              <span className="font-mono text-[11px]">{booking.payment_ref}</span>
            </div>
          )}
        </div>
        {booking.payment_ref?.startsWith('SIM-') && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            {bi(
              '演示数据：该笔支付为模拟流程，未发生真实扣款。',
              'Demo data: this payment is simulated and no money was charged.',
            )}
          </p>
        )}
      </div>

      <div className={`rounded-2xl border p-4 text-[11px] ${sync.tone}`}>
        <p className="font-medium">{syncLabel(booking.aspenware_sync_status, lang) || sync.label}</p>
        <p className="mt-1 opacity-80">
          {booking.aspenware_order_ref
            ? bi(`Aspenware 订单号：${booking.aspenware_order_ref}`, `Aspenware order: ${booking.aspenware_order_ref}`)
            : bi(
                '订单尚未写入 Aspenware 系统，核销需在雪场本地系统手工登记。',
                'Not yet written to Aspenware, so redemption is logged manually in the resort system.',
              )}
        </p>
      </div>

      <IntegrationNotice type="aspenware" />

      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground/80">{bi('使用说明', 'How to use')}</p>
        <p className="mt-2">
          {bi(
            '1. 提前 30 分钟到达缆车大厅，凭订单号与护照核验身份。',
            '1. Arrive at the lift base 30 minutes early with this order number and your passport.',
          )}
        </p>
        <p className="mt-1">
          {bi(
            '2. 雪具与护具可在雪具租赁处凭同一订单号领取。',
            '2. Collect gear and protective equipment at the rental desk with the same order number.',
          )}
        </p>
        <p className="mt-1">
          {bi(
            '3. 改期与退款申请提交后，由运营在后台处理并通知结果。',
            '3. Reschedule and refund requests are reviewed by our team, who will notify you.',
          )}
        </p>
      </div>

      {booking.status === 'confirmed' && (
        <div className="flex gap-2 pb-2">
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-full"
            onClick={() => requestChange('reschedule')}
            disabled={acting}
          >
            <RotateCcw className="h-4 w-4" /> {bi('申请改期', 'Request reschedule')}
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-full text-destructive"
            onClick={() => requestChange('refund')}
            disabled={acting}
          >
            <Undo2 className="h-4 w-4" /> {bi('申请退款', 'Request refund')}
          </Button>
        </div>
      )}

      {['refund_requested', 'reschedule_requested'].includes(booking.status) && (
        <p className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
          <AlertCircle className="h-3.5 w-3.5" />{' '}
          {bi('申请已提交，运营将在 1 个工作日内处理', 'Request submitted, we reply within one business day')}
        </p>
      )}
    </div>
  );
}
