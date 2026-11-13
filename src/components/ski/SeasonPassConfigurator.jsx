import { Checkbox } from '@/components/ui/checkbox';
import Panel from '@/components/common/Panel';
import SelectTile from '@/components/ski/SelectTile';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';
import { AGE_OPTIONS, PAYMENT_PLANS, SEASON_PASS_TYPES, priceFor } from '@/lib/seasonPasses';

export default function SeasonPassConfigurator({
  plan,
  onPlanChange,
  passType,
  onPassTypeChange,
  age,
  onAgeChange,
  rulesAccepted,
  onRulesChange,
}) {
  const { t } = useLang();
  const selectedType = SEASON_PASS_TYPES.find((p) => p.value === passType);
  const requiresRules = passType === 'Winter Saver Season Pass';

  return (
    <div className="space-y-4">
      <Panel title={t('支付方式', 'Payment plan')} description={t('选择您的支付方式', 'Choose your Payment Option')}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PAYMENT_PLANS.map((p) => (
            <SelectTile
              key={p.value}
              selected={plan === p.value}
              onClick={() => onPlanChange(p.value)}
              title={t(p.zh, p.en)}
              subtitle={p.note_en ? t(p.note_zh, p.note_en) : null}
            />
          ))}
        </div>
      </Panel>

      <Panel title={t('季票类型', 'Pass type')}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SEASON_PASS_TYPES.map((p) => (
            <SelectTile
              key={p.value}
              selected={passType === p.value}
              onClick={() => onPassTypeChange(p.value)}
              title={t(p.zh, p.en)}
            />
          ))}
        </div>

        {selectedType && (
          <div className="mt-3.5 rounded-lg border border-border/80 bg-muted/40 p-3.5">
            <p className="text-[13px] font-semibold text-forest-900">{t(selectedType.zh, selectedType.en)}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {t(selectedType.detail_zh, selectedType.detail_en)}
            </p>
            <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.08em] ${requiresRules ? 'text-destructive' : 'text-muted-foreground'}`}>
              {requiresRules ? t('选择一项（必填）', 'Select one (Required)') : t('选择一项（可选）', 'Select one (Optional)')}
            </p>
            {requiresRules && (
              <label className="mt-2 flex cursor-pointer items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2.5">
                <Checkbox
                  checked={rulesAccepted}
                  onCheckedChange={(v) => onRulesChange(v === true)}
                  className="mt-0.5"
                />
                <span className="text-[12px] leading-relaxed text-forest-900">
                  {t('我接受 Winter Saver 的使用规则', 'I accept the rules of the Winter Saver')}
                </span>
              </label>
            )}
          </div>
        )}
      </Panel>

      <Panel title={t('年龄段', 'Age')}>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {AGE_OPTIONS.map((option) => (
            <SelectTile
              key={option.value}
              selected={age === option.value}
              onClick={() => onAgeChange(option.value)}
              title={t(option.zh, option.en)}
              meta={NZD(priceFor(passType, option.value))}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}