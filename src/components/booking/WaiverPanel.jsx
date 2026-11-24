import { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import SignaturePad from '@/components/booking/SignaturePad';
import IntegrationNotice from '@/components/IntegrationNotice';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TERMS = [
  {
    title: { zh: '一、风险告知', en: '1. Risk disclosure' },
    body: {
      zh: '本人确认已了解高山滑雪属于高风险运动，存在摔倒、碰撞、天气突变与雪崩等固有风险，且雪道状况随天气变化。',
      en: 'I understand that alpine skiing is a high-risk activity with inherent risks of falls, collisions, sudden weather changes and avalanches, and that piste conditions change with the weather.',
    },
  },
  {
    title: { zh: '二、安全义务', en: '2. Safety obligations' },
    body: {
      zh: '本人承诺遵守雪场安全守则与缆车使用规定，佩戴合格头盔与护具，量力选择雪道，并如实申报健康状况。因本人未遵守安全规定或隐瞒健康信息造成的损害，由本人自行承担。',
      en: 'I will follow the mountain safety code and lift rules, wear a certified helmet and protective gear, choose runs within my ability and declare my health honestly. I accept responsibility for any harm caused by ignoring these rules or withholding health information.',
    },
  },
  {
    title: { zh: '三、未成年人', en: '3. Minors' },
    body: {
      zh: '未满 18 周岁游客须由监护人签署本声明，并由监护人全程陪同。',
      en: 'Guests under 18 must have this waiver signed by a parent or guardian, who must accompany them at all times.',
    },
  },
  {
    title: { zh: '四、信息使用', en: '4. Use of information' },
    body: {
      zh: '姓名、出生日期、国籍与护照号码仅用于雪场身份核验、保险备案与电子票出票，不作其他用途。',
      en: 'Name, date of birth, nationality and passport number are used only for identity checks, insurance records and issuing e-tickets, and for no other purpose.',
    },
  },
  {
    title: { zh: '五、授权代签', en: '5. Signing on behalf' },
    body: {
      zh: '为同行游客代为签署时，签署人确认已获得该游客的明确授权，并对所填信息的真实性负责。',
      en: 'When signing for another guest, the signatory confirms they have that guest’s explicit permission and is responsible for the accuracy of the details provided.',
    },
  },
  {
    title: { zh: '六、签署方式（演示说明）', en: '6. How signing works (demo)' },
    body: {
      zh: '本演示采用手写签名，仅用于展示签署流程，不具备法律效力。正式环境应通过第三方电子签名服务完成实名认证、人脸意愿核验与时间戳存档。',
      en: 'This demo uses a handwritten signature to show the flow only and has no legal effect. In production a third-party e-signature service would handle identity verification, biometric consent and timestamped archiving.',
    },
  },
];

export default function WaiverPanel({ waiverChecked, onWaiver, signature, onSignature }) {
  const { lang, bi } = useLanguage();
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium">
          {bi('风险告知与免责声明', 'Risk disclosure & liability waiver')}
        </p>
        <Button
          type="button"
          variant="ghost"
          className="h-7 shrink-0 rounded-full px-2 text-[11px] text-primary"
          onClick={() => setTermsOpen(true)}
        >
          <FileText className="h-3 w-3" /> {bi('查看完整条款', 'Read full terms')}
        </Button>
      </div>

      <p className="mt-2 max-h-28 overflow-y-auto rounded-lg bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {bi(
          '本人确认已了解高山滑雪属于高风险运动，存在摔倒、碰撞、天气与雪崩等固有风险。本人承诺遵守雪场安全守则与缆车使用规定，佩戴合格护具，并如实申报健康状况。未满 18 周岁游客须由监护人签署。本人同意上述信息用于雪场身份核验与保险备案。',
          'I understand that alpine skiing is a high-risk activity with inherent risks of falls, collisions, weather and avalanches. I will follow the mountain safety code and lift rules, wear certified protective gear and declare my health honestly. Guests under 18 must be signed for by a guardian. I agree that this information is used for identity checks and insurance records.',
        )}
      </p>

      <div className="mt-3">
        <Label className="text-[11px]">
          {bi('本人 / 监护人签名（手写）*', 'Signature (guest or guardian) *')}
        </Label>
        <div className="mt-1.5">
          <SignaturePad value={signature} onChange={onSignature} />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {bi(
            '请用手指或鼠标在上方空白处手写签名，签名将随订单一起存档。',
            'Sign in the box above with your finger or mouse. The signature is stored with your order.',
          )}
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <Checkbox
          id="waiver"
          checked={waiverChecked}
          onCheckedChange={onWaiver}
          className="mt-0.5"
        />
        <label htmlFor="waiver" className="text-[11px] leading-relaxed text-muted-foreground">
          {bi('我已阅读并同意', 'I have read and agree to the')}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="mx-0.5 font-medium text-primary underline underline-offset-2"
          >
            {bi('《滑雪活动免责声明》', 'Ski activity waiver')}
          </button>
          {bi(
            '，确认以上信息与护照一致，并已获得同行游客授权代为签署。',
            '. I confirm these details match my passport and that I am authorised to sign for my fellow guests.',
          )}
        </label>
      </div>
      <p className="mt-1.5 pl-6 text-[10.5px] text-amber-700">
        {bi('未成年人须由监护人签名', 'Guests under 18 need a guardian signature')}
      </p>

      <IntegrationNotice type="esign" className="mt-3" />

      <div className="mt-3 rounded-xl bg-muted/50 p-3 text-[10px] leading-relaxed text-muted-foreground">
        <p className="flex items-center gap-1 font-medium text-foreground/70">
          <ShieldCheck className="h-3 w-3" /> {bi('隐私保护说明', 'Privacy notice')}
        </p>
        <p className="mt-1">
          {bi(
            '依据微信《用户隐私保护指引》要求，本页收集的姓名、出生日期、国籍与护照号码仅用于雪场身份核验、保险备案与电子票出票，不作其他用途，也不会提供给无关第三方。正式上线前须在小程序后台完成隐私接口声明。',
            'The name, date of birth, nationality and passport number collected here are used only for identity checks, insurance records and issuing e-tickets. They are never used for other purposes or shared with unrelated third parties.',
          )}
        </p>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{bi('条款与免责声明', 'Terms & liability waiver')}</DialogTitle>
            <DialogDescription>
              {bi(
                '签署前请完整阅读以下条款（演示版为节选内容）。',
                'Please read the terms in full before signing (excerpts in this demo).',
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-[11px] leading-relaxed">
            {TERMS.map((item) => (
              <div key={item.title.zh}>
                <p className="font-medium text-foreground/85">
                  {item.title[lang === 'en' ? 'en' : 'zh']}
                </p>
                <p className="mt-1 text-muted-foreground">{item.body[lang === 'en' ? 'en' : 'zh']}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}