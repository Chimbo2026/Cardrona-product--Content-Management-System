import { ShieldCheck, RefreshCcw, Ticket, CreditCard } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const POLICIES = [
  {
    icon: Ticket,
    key: 'ticket',
    title: { zh: '电子票与取票', en: 'E-tickets and collection' },
    body: [
      {
        zh: '支付成功后 5 分钟内出票，订单详情页展示含二维码的电子雪票。',
        en: 'Tickets are issued within five minutes of payment, with a QR code on the order page.',
      },
      {
        zh: '凭二维码在雪场售票窗口或自助机换取雪卡（MyPass 卡），首次使用需绑定姓名。',
        en: 'Swap the QR code for a MyPass card at the ticket window or kiosk; the first use binds your name to it.',
      },
      {
        zh: '电子票不可转让，入园时需出示与预订姓名一致的有效证件。',
        en: 'Tickets are non-transferable; show ID matching the booking name on entry.',
      },
    ],
  },
  {
    icon: RefreshCcw,
    key: 'change',
    title: { zh: '退改签政策', en: 'Changes and refunds' },
    body: [
      {
        zh: '使用日前 48 小时可免费改期一次，改期后不可再退。',
        en: 'One free date change up to 48 hours before use; a changed booking cannot then be refunded.',
      },
      {
        zh: '使用日前 7 天以上取消全额退款；7 天内取消收取 20% 手续费。',
        en: 'Cancel seven or more days ahead for a full refund; within seven days a 20% fee applies.',
      },
      {
        zh: '当日未使用、已过使用日的订单不予退款，可申请转赠一次。',
        en: 'Unused passes after the visit date are non-refundable, but may be transferred once.',
      },
    ],
  },
  {
    icon: ShieldCheck,
    key: 'waiver',
    title: { zh: '免责声明与安全', en: 'Waiver and safety' },
    body: [
      {
        zh: '预订时须在线签署免责声明与风险告知书，18 岁以下需监护人代为签署。',
        en: 'The waiver and risk disclosure must be signed online at booking; under-18s need a guardian signature.',
      },
      {
        zh: '滑雪属高风险运动，建议自行购买涵盖雪上运动的旅行保险。',
        en: 'Skiing is high risk, so we recommend travel insurance that covers snow sports.',
      },
      {
        zh: '因天气、索道检修导致雪场关闭时，可全额退款或免费改期。',
        en: 'If the mountain closes for weather or lift maintenance, you get a full refund or free date change.',
      },
    ],
  },
  {
    icon: CreditCard,
    key: 'payment',
    title: { zh: '支付与隐私', en: 'Payment and privacy' },
    body: [
      {
        zh: '支持微信支付与国际信用卡（Visa / Mastercard / Amex），均以新西兰元结算。',
        en: 'WeChat Pay and international cards (Visa / Mastercard / Amex) are accepted, all settled in NZD.',
      },
      {
        zh: '护照与生日信息仅用于雪场实名核验与保险，不作其他用途。',
        en: 'Passport and date-of-birth details are used only for identity checks and insurance.',
      },
      {
        zh: '演示环境不采集真实支付信息，所有交易均为模拟流程。',
        en: 'This demo collects no real payment details; every transaction is simulated.',
      },
    ],
  },
];

export default function PolicyContent() {
  const { lang, bi } = useLanguage();
  const tr = (value) => value[lang === 'en' ? 'en' : 'zh'];

  return (
    <div className="space-y-3 px-4 pt-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h1 className="font-heading text-[17px]">{bi('预订条款', 'Booking terms')}</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
          {bi(
            '下单即视为已阅读并同意以下条款。条款以简体中文版本为准。',
            'Placing an order means you accept the terms below.',
          )}
        </p>
      </div>

      {POLICIES.map(({ icon: Icon, key, title, body }) => (
        <div key={key} className="rounded-2xl border border-border bg-card p-4">
          <p className="flex items-center gap-2 font-heading text-[14px]">
            <Icon className="h-4 w-4 text-primary" /> {tr(title)}
          </p>
          <ul className="mt-2 space-y-1.5">
            {body.map((line) => (
              <li
                key={line.zh}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground"
              >
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                {tr(line)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}