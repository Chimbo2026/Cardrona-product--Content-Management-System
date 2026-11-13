import { Snowflake } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';
import { SEASON_PASS_PRODUCTS } from '@/lib/constants';

export default function SeasonPassProducts({ canWrite, onIssue }) {
  const { t } = useLang();

  return (
    <Panel>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {SEASON_PASS_PRODUCTS.map((p) => (
          <div key={p.value} className="rounded-lg border border-border/80 p-3">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-forest-900">
              <Snowflake className="h-3.5 w-3.5 text-ice-600" /> {p.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t(p.mountain_zh, p.mountain)} · {t(p.blackout_zh, p.blackout)}
            </p>
            <div className="mt-1.5 divide-y divide-border/70 border-t border-border/70">
              {p.prices.map((row) => (
                <div key={row.age} className="flex items-center justify-between gap-2 py-1">
                  <span className="text-[11.5px] text-muted-foreground">{t(row.age_zh, row.age)}</span>
                  <span className="flex items-center gap-2">
                    <span className="num text-[13px] font-semibold text-forest-950">{NZD(row.price)}</span>
                    {canWrite && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-1.5 text-[10.5px]"
                        onClick={() => onIssue(p, row)}
                      >
                        {t('发放', 'Issue')}
                      </Button>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted-foreground">
              {t('6 岁以下及 75 岁以上免费', 'Under 6 and over 75 free of charge')}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}