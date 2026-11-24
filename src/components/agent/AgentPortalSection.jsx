import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AgentLoginCard from '@/components/home/AgentLoginCard';
import PortalCommissionCard from '@/components/agent/PortalCommissionCard';
import PortalCodeList from '@/components/agent/PortalCodeList';
import PortalClaimHistory from '@/components/agent/PortalClaimHistory';
import { useAgent } from '@/lib/AgentContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AgentPortalSection() {
  const { agent } = useAgent();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [codes, setCodes] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!agent?.email) {
      setLoading(false);
      return;
    }
    const [bookingPage, codePage, claimPage] = await Promise.all([
      base44.entities.Booking.filter(
        { agent_email: agent.email, payment_status: 'paid' },
        { limit: 200 },
      ),
      base44.entities.DiscountCode.filter({ agent_email: agent.email }, { limit: 20 }),
      base44.entities.AgentClaim.filter(
        { agent_email: agent.email },
        { sort: '-created_date', limit: 20 },
      ),
    ]);
    setBookings(bookingPage.items || []);
    setCodes(codePage.items || []);
    setClaims(claimPage.items || []);
    setLoading(false);
  }, [agent?.email]);

  useEffect(() => {
    load();
  }, [load]);

  if (!agent) {
    return (
      <div className="pb-4 pt-3">
        <p className="mb-3 px-4 text-[11.5px] leading-relaxed text-muted-foreground">
          {t('portal.intro')}
        </p>
        <AgentLoginCard className="px-4" />
      </div>
    );
  }

  const revenue = bookings.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  const commission = Math.round(revenue * Number(agent.commissionRate || 0)) / 100;
  const claimed = claims.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const claimable = Math.max(0, Math.round((commission - claimed) * 100) / 100);

  return (
    <div className="space-y-3 px-4 pb-4 pt-3">
      <AgentLoginCard className="" />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <PortalCommissionCard
            commission={commission}
            claimable={claimable}
            revenue={revenue}
            orderCount={bookings.length}
            rate={agent.commissionRate || 0}
            onClaim={async () => {
              await base44.entities.AgentClaim.create({
                agent_email: agent.email,
                agent_name: agent.label,
                agent_code: agent.code,
                amount: claimable,
                currency: 'NZD',
                booking_count: bookings.length,
                status: 'requested',
                requested_at: new Date().toISOString(),
              });
              await load();
            }}
          />
          <PortalCodeList codes={codes} />
          <PortalClaimHistory claims={claims} />
        </>
      )}
    </div>
  );
}