import Panel from '@/components/common/Panel';
import { useLang } from '@/lib/i18n';
import { PAYMENT_PLAN_DETAILS, SEASON_PASS_TYPES, shortPassName } from '@/lib/seasonPasses';

export default function SeasonPassInfo() {
  const { t } = useLang();

  return (
    <Panel
      title={t('Winter Season Pass', 'Winter Season Pass')}
      description={t(
        '整个雪季畅滑 Cardrona 与 Treble Cone 季票。选择 Unlimited 享受最大通行权限，或选择 Saver 享受最低价格*。',
        'Ski and ride all season long with a Cardrona and Treble Cone season pass. Choose an Unlimited Pass for maximum access or a Saver Pass for the lowest price*.'
      )}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {t('*季票选项', '*Season pass options')}
        </p>
        <div className="mt-2 space-y-2">
          {SEASON_PASS_TYPES.map((p) => (
            <div key={p.value} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p className="text-[12.5px] leading-relaxed text-forest-900">
                <span className="font-semibold">{t(p.zh, p.en)}:</span>{' '}
                <span className="text-muted-foreground">{t(p.detail_zh, p.detail_en)}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-border/80 bg-muted/40 p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {t('分期付款详情', 'Payment plan details')}
          </p>
          <ul className="mt-2 space-y-1.5">
            {PAYMENT_PLAN_DETAILS.map((row) => (
              <li key={row.en} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                <p className="text-[12px] leading-relaxed text-muted-foreground">{t(row.zh, row.en)}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-2.5 text-[11px] text-muted-foreground">
          {t(
            '价格为演示数值，非 Cardrona 官方定价；6 岁以下及 75 岁以上免费，但仍需选择季票以生成票券。',
            'Prices are demonstration figures, not official Cardrona pricing. Under 6 and over 75 are free of charge but still need a pass selection.'
          )}
        </p>
      </div>
    </Panel>
  );
}