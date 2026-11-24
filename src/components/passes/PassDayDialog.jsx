import { useState } from 'react';
import { Bike, CalendarClock, Plus, Ticket, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { bookingsOnDay, productOf } from '@/lib/passCalendar';
import { NZD, prettyDate } from '@/lib/format';
import { useLang } from '@/lib/i18n';
import { tx } from '@/lib/i18nMaps';

export default function PassDayDialog({ open, onOpenChange, day, passes, canWrite, onEdit, onRelease, onAddDays }) {
  const { t, lang } = useLang();
  const [confirming, setConfirming] = useState(null);

  const bookings = day ? bookingsOnDay(passes, day) : [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              {day ? prettyDate(day, 'EEE d MMM yyyy') : ''}
            </DialogTitle>
            <DialogDescription>
              {bookings.length > 0
                ? t(`${bookings.length} 个预订包含这一天。`, `${bookings.length} booking${bookings.length === 1 ? '' : 's'} include this day.`)
                : t('这一天还没有预订。', 'Nothing is booked on this day yet.')}
            </DialogDescription>
          </DialogHeader>

          {bookings.length > 0 && (
            <ul className="space-y-2">
              {bookings.map((pass) => (
                <li key={pass.id} className="rounded-lg border border-border/80 bg-card px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <span
                      className={
                        productOf(pass) === 'Bike Rental'
                          ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ice-100 text-ice-900'
                          : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-forest-100 text-forest-800'
                      }
                    >
                      {productOf(pass) === 'Bike Rental' ? <Bike className="h-3.5 w-3.5" /> : <Ticket className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-forest-900">{pass.guest_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-mono">{pass.pass_number}</span> · {tx(productOf(pass), lang)} · {tx(pass.pass_type, lang)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {prettyDate(pass.valid_from, 'd MMM')} → {prettyDate(pass.valid_to, 'd MMM')} · {NZD(pass.price)}
                      </p>
                      {productOf(pass) === 'Bike Rental' && (pass.bike_type || pass.bike_size || pass.bike_insurance === 'Yes') && (
                        <p className="mt-0.5 text-[11px] text-ice-900">
                          {[
                            pass.bike_type && t(`车型 ${pass.bike_type}`, `${pass.bike_type} bike`),
                            pass.bike_size && t(`尺寸 ${pass.bike_size}`, `Size ${pass.bike_size}`),
                            pass.bike_insurance === 'Yes' && t('已加保险', 'Insurance added'),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={pass.issue_status} dot={false} />
                  </div>

                  {canWrite && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11.5px]"
                        onClick={() => {
                          onOpenChange(false);
                          onEdit(pass);
                        }}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {t('更改日期', 'Change dates')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11.5px] text-rose-600 hover:text-rose-700"
                        onClick={() => setConfirming(pass)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('删除这一天', 'Delete this day')}
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
            <p className="text-[11px] text-muted-foreground">
              {t('删除只会移除这一天，其余日期保留。', 'Deleting removes only this day; the rest of the booking stays.')}
            </p>
            {canWrite && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  onOpenChange(false);
                  onAddDays(day);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('在此日期添加', 'Add days here')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirming)}
        onOpenChange={(value) => !value && setConfirming(null)}
        title={t('删除已预订的日期？', 'Delete this booked day?')}
        description={
          confirming
            ? t(
                `${confirming.guest_name} 的 ${tx(productOf(confirming), lang)} 在 ${prettyDate(day, 'd MMM')} 的预订将被移除。`,
                `${confirming.guest_name}'s ${productOf(confirming) === 'Bike Rental' ? 'bike rental' : 'lift pass'} on ${prettyDate(day, 'd MMM')} will be removed.`
              )
            : ''
        }
        confirmLabel={t('删除这一天', 'Delete day')}
        onConfirm={async () => {
          const target = confirming;
          setConfirming(null);
          await onRelease(target, day);
        }}
      />
    </>
  );
}