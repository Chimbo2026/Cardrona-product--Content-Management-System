import { Tag } from 'lucide-react';
import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PortalCodeList({ codes }) {
  const { t } = useLanguage();

  return (
    <section>
      <h2 className="font-heading text-[15px]">{t('portal.codes')}</h2>
      {codes.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
          {t('portal.codesEmpty')}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {codes.map((code) => (
            <div key={code.id} className="rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[15px] tracking-wider text-primary">
                  {code.code}
                </span>
                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px]">
                  {code.type === 'percent' ? `-${code.value}%` : `-${formatNZD(code.value)}`}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {code.label} · {code.scope || '—'}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {t('portal.used')} {code.used_count || 0}
                {code.usage_limit ? ` / ${code.usage_limit}` : ''}
                {code.valid_to ? ` · ${code.valid_to}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}