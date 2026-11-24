import { Link } from 'react-router-dom';
import { CheckCircle2, Ticket, QrCode, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import IntegrationNotice from '@/components/IntegrationNotice';
import MockQr from '@/components/MockQr';
import { formatCNY } from '@/lib/booking';
import { paymentLabel } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BookingDone({ booking }) {
  const { lang, bi } = useLanguage();
  if (!booking) return null;
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center pt-2 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </span>
        <h2 className="mt-3 font-heading text-[19px]">{bi('支付成功', 'Booking confirmed')}</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {bi(
            '电子票已生成，凭下方二维码在缆车入口检票',
            'Your e-ticket is ready, scan it at the lift gate',
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="snow-ridge px-4 py-3.5 text-white">
          <p className="text-[11px] text-white/70">{bi('订单号', 'Order no.')}</p>
          <p className="font-mono text-[15px] tracking-wider">{booking.order_no}</p>
        </div>
        <div className="space-y-2 p-4 text-[12px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('产品', 'Product')}</span>
            <span className="max-w-[60%] text-right">{booking.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('游玩日期', 'Visit date')}</span>
            <span>{booking.visit_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('人数', 'Guests')}</span>
            <span>{booking.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{bi('支付方式', 'Payment')}</span>
            <span>{paymentLabel(booking.payment_method, lang) || '—'}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-border pt-2">
            <span className="text-muted-foreground">{bi('实付金额', 'Total paid')}</span>
            <span className="font-heading text-[15px] text-primary">
              {formatCNY(booking.total_amount)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-dashed border-border px-4 py-3 text-[11px] text-muted-foreground">
          <QrCode className="h-4 w-4 text-primary" />
          {bi('凭此码到售票处核验订单与护照姓名', 'Show this code at the ticket desk with your passport')}
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4">
        <p className="text-[11px] text-muted-foreground">{bi('取票二维码（模拟）', 'Ticket QR code (simulated)')}</p>
        <div className="mt-2 rounded-xl border border-border p-3 text-foreground">
          <MockQr value={booking.order_no} className="h-40 w-40" />
        </div>
        <p className="mt-2 font-mono text-[11px] tracking-wider text-muted-foreground">
          {booking.order_no}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {bi('请勿将二维码分享给他人', 'Do not share this code with anyone')}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium text-foreground/80">
          <Ticket className="h-3.5 w-3.5" /> {bi('使用说明', 'How to use')}
        </p>
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
            '3. 需要改期或退款，请在「我的订单」中提交申请，由运营处理。',
            '3. To reschedule or request a refund, submit a request from My orders.',
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] leading-relaxed text-amber-900">
        <p className="flex items-center gap-1.5 font-medium">
          <AlertTriangle className="h-3.5 w-3.5" /> {bi('演示说明', 'Demo notice')}
        </p>
        <p className="mt-1.5">
          {bi(
            '本次支付为模拟流程，未发生真实扣款；订单也未同步至 Aspenware 系统。',
            'This payment is simulated and no money was charged; the order was not synced to Aspenware.',
          )}
        </p>
      </div>

      <IntegrationNotice type="aspenware" />

      <div className="flex gap-2 pb-2">
        <Button asChild variant="outline" className="h-11 flex-1 rounded-full">
          <Link to="/">{bi('返回首页', 'Back home')}</Link>
        </Button>
        <Button asChild className="h-11 flex-1 rounded-full">
          <Link to={`/order/${booking.id}`}>{bi('查看订单', 'View order')}</Link>
        </Button>
      </div>
    </div>
  );
}