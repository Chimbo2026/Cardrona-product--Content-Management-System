import { formatNZD } from '@/lib/shop';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const STATUS_KEY = {
  requested: 'portal.inReview',
  approved: 'portal.approved',
  paid: 'portal.paid',
};

export default function PortalClaimHistory({ claims }) {
  const { t } = useLanguage();

  return (
    <section>
      <h2 className="font-heading text-[15px]">{t('portal.claims')}</h2>
      {claims.length === 0 ? (
        <p className="mt-2 rounded-2xl border border-dashed border-border p-6 text-center text-[12px] text-muted-foreground">
          {t('portal.claimsEmpty')}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card px-3.5 py-3"
            >
              <div>
                <p className="font-heading text-[14px]">{formatNZD(claim.amount)}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {String(claim.requested_at || claim.created_date || '').slice(0, 10)} ·{' '}
                  {claim.booking_count || 0} {t('portal.orders')}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-foreground/75">
                {t(STATUS_KEY[claim.status] || 'portal.inReview')}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}