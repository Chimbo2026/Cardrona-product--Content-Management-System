import { useEffect, useState } from 'react';
import { ImageOff, ShieldCheck, ShieldAlert, UserCheck, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Panel from '@/components/common/Panel';
import StatusBadge from '@/components/common/StatusBadge';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';
import { prettyDate } from '@/lib/format';

export default function GuestCheckInPanel({ guest, onStart }) {
  const { lang, t } = useLang();
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    let active = true;
    setPhotoUrl(null);
    if (!guest?.checkin_photo_uri) return undefined;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: guest.checkin_photo_uri, expires_in: 3600 })
      .then((res) => {
        if (active) setPhotoUrl(res?.signed_url || null);
      })
      .catch(() => {
        if (active) setPhotoUrl(null);
      });
    return () => {
      active = false;
    };
  }, [guest?.checkin_photo_uri]);

  const ready = guest.checkin_status === 'Ready for arrival';

  return (
    <Panel
      title={t('抵达前登记', 'Pre-arrival check-in')}
      action={<StatusBadge status={guest.checkin_status || 'Not started'} />}
    >
      <div className="flex items-start gap-3">
        <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {photoUrl ? (
            <Image src={photoUrl} alt="" fittingType="fill" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-4 w-4" />
            </div>
          )}
        </div>
        <ul className="flex-1 space-y-1.5 text-[12px]">
          <li className="flex items-center gap-1.5 text-forest-900">
            {guest.waiver_signed ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {guest.waiver_signed
              ? t(`免责声明已签署 · ${prettyDate(guest.waiver_signed_at, 'd MMM')}`, `Waiver signed · ${prettyDate(guest.waiver_signed_at, 'd MMM')}`)
              : t('免责声明未签署', 'Waiver not signed')}
          </li>
          <li className="flex items-center gap-1.5 text-forest-900">
            <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
            {guest.rental_profile_complete
              ? `${tx(guest.rental_discipline, lang) || '—'} · ${guest.shoe_size || '—'} · ${guest.height_cm || '—'}cm · ${tx(guest.ability_level, lang)}`
              : t('租赁资料未补全', 'Rental profile incomplete')}
          </li>
        </ul>
      </div>
      <Button size="sm" variant={ready ? 'outline' : 'default'} className="mt-3 w-full gap-1.5" onClick={onStart}>
        <UserCheck className="h-3.5 w-3.5" />
        {ready ? t('更新登记资料', 'Update check-in details') : t('预抵达登记', 'Pre-Arrival Check-In')}
      </Button>
    </Panel>
  );
}