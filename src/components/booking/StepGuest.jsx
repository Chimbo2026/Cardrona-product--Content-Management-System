import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WaiverPanel from '@/components/booking/WaiverPanel';
import { NATIONALITY_OPTIONS, SOURCE_OPTIONS } from '@/lib/booking';
import { nationalityLabel, sourceLabel } from '@/lib/i18n/localize';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function StepGuest({
  form,
  onField,
  quantity,
  extraGuests,
  onExtraGuest,
  waiverChecked,
  onWaiver,
  signature,
  onSignature,
}) {
  const { lang, bi } = useLanguage();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="text-[12px] font-medium">{bi('主要游客信息', 'Lead guest details')}</p>
        <div className="mt-3 space-y-3">
          <div>
            <Label className="text-[11px]">{bi('护照姓名（拼音）*', 'Passport name (pinyin) *')}</Label>
            <Input
              value={form.name_pinyin}
              onChange={(e) => onField('name_pinyin', e.target.value)}
              placeholder={bi('例如：CHEN WEI', 'e.g. CHEN WEI')}
              className="mt-1.5 h-10 bg-secondary/65"
            />
          </div>
          <div>
            <Label className="text-[11px]">
              {bi('法定姓名（护照英文名）*', 'Legal name (as on passport) *')}
            </Label>
            <Input
              value={form.legal_name}
              onChange={(e) => onField('legal_name', e.target.value)}
              placeholder={bi('例如：Wei Chen', 'e.g. Wei Chen')}
              className="mt-1.5 h-10 bg-secondary/65"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">{bi('出生日期*', 'Date of birth *')}</Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => onField('dob', e.target.value)}
                className="mt-1.5 h-10 bg-secondary/65"
              />
            </div>
            <div>
              <Label className="text-[11px]">{bi('国籍 / 地区*', 'Nationality / region *')}</Label>
              <Select value={form.nationality} onValueChange={(v) => onField('nationality', v)}>
                <SelectTrigger className="mt-1.5 h-10 bg-secondary/65">
                  <SelectValue placeholder={bi('请选择', 'Select')} />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {nationalityLabel(item, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-[11px]">{bi('护照号码*', 'Passport number *')}</Label>
            <Input
              value={form.document_no}
              onChange={(e) => onField('document_no', e.target.value)}
              placeholder={bi('用于雪场身份核验', 'Used to verify your identity on the mountain')}
              className="mt-1.5 h-10 bg-secondary/65"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">{bi('手机号码*', 'Phone *')}</Label>
              <Input
                value={form.phone}
                onChange={(e) => onField('phone', e.target.value)}
                placeholder="+64 …"
                className="mt-1.5 h-10 bg-secondary/65"
              />
            </div>
            <div>
              <Label className="text-[11px]">{bi('邮箱*', 'Email *')}</Label>
              <Input
                value={form.email}
                onChange={(e) => onField('email', e.target.value)}
                placeholder={bi('用于接收电子票', 'For your e-ticket')}
                className="mt-1.5 h-10 bg-secondary/65"
              />
            </div>
          </div>
          <div>
            <Label className="text-[11px]">{bi('了解渠道', 'How did you hear about us?')}</Label>
            <Select value={form.source} onValueChange={(v) => onField('source', v)}>
              <SelectTrigger className="mt-1.5 h-10 bg-secondary/65">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {sourceLabel(item, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {quantity > 1 && (
        <div className="rounded-xl border border-border bg-card p-3.5">
          <p className="text-[12px] font-medium">
            {bi(
              `同行游客（${quantity - 1} 人）`,
              `Extra guests (${quantity - 1})`,
            )}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {bi('免责声明需覆盖全部出行游客', 'The waiver must cover every travelling guest')}
          </p>
          <div className="mt-3 space-y-3">
            {extraGuests.map((guest, index) => (
              <div key={index} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground">
                  {bi(`游客 ${index + 2}`, `Guest ${index + 2}`)}
                </p>
                <div className="mt-2 space-y-2">
                  <Input
                    value={guest.name_pinyin}
                    onChange={(e) => onExtraGuest(index, 'name_pinyin', e.target.value)}
                    placeholder={bi('护照姓名（拼音）', 'Passport name (pinyin)')}
                    className="h-10 bg-secondary/65"
                  />
                  <Input
                    value={guest.legal_name}
                    onChange={(e) => onExtraGuest(index, 'legal_name', e.target.value)}
                    placeholder={bi('法定姓名', 'Legal name')}
                    className="h-10 bg-secondary/65"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={guest.dob}
                      onChange={(e) => onExtraGuest(index, 'dob', e.target.value)}
                      className="h-10 bg-secondary/65"
                    />
                    <Select
                      value={guest.nationality}
                      onValueChange={(v) => onExtraGuest(index, 'nationality', v)}
                    >
                      <SelectTrigger className="h-10 bg-secondary/65">
                        <SelectValue placeholder={bi('国籍', 'Nationality')} />
                      </SelectTrigger>
                      <SelectContent>
                        {NATIONALITY_OPTIONS.map((item) => (
                          <SelectItem key={item} value={item}>
                            {nationalityLabel(item, lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <WaiverPanel
        waiverChecked={waiverChecked}
        onWaiver={onWaiver}
        signature={signature}
        onSignature={onSignature}
      />
    </div>
  );
}
