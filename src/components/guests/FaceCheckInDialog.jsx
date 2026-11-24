import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import { guestAvatarUrl, guestInitials } from '@/lib/guestAvatar';
import { Image } from '@/components/ui/image';
import { entityCache } from '@/hooks/useList';

const STEPS = { READY: 'ready', SCANNING: 'scanning', MATCH: 'match', FAIL: 'fail' };

function Frames({ children, active, tone = 'default' }) {
  const ring = tone === 'fail' ? 'border-rose-400/70' : tone === 'match' ? 'border-emerald-400/80' : 'border-white/40';
  return (
    <div className="relative overflow-hidden rounded-lg bg-forest-950">
      {children}
      <div className={`pointer-events-none absolute inset-0 rounded-lg border ${ring}`} />
      {['left-2 top-2 border-l-2 border-t-2', 'right-2 top-2 border-r-2 border-t-2', 'left-2 bottom-2 border-l-2 border-b-2', 'right-2 bottom-2 border-r-2 border-b-2'].map((pos) => (
        <span key={pos} className={`pointer-events-none absolute h-4 w-4 border-white/80 ${pos}`} />
      ))}
      {active && (
        <div className="animate-scanline pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
      )}
    </div>
  );
}

export default function FaceCheckInDialog({ guest, open, onOpenChange, onComplete }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [step, setStep] = useState(STEPS.READY);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const simulateFail = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    if (open) {
      setStep(STEPS.READY);
      setProgress(0);
      setSaving(false);
      simulateFail.current = false;
    }
    return () => clearInterval(timer.current);
  }, [open, guest?.id]);

  const runScan = (forceFail = false) => {
    simulateFail.current = forceFail;
    setProgress(0);
    setStep(STEPS.SCANNING);
    clearInterval(timer.current);
    let value = 0;
    timer.current = setInterval(() => {
      value = Math.min(100, value + 5);
      setProgress(value);
      if (value >= 100) {
        clearInterval(timer.current);
        setStep(simulateFail.current ? STEPS.FAIL : STEPS.MATCH);
      }
    }, 70);
  };

  const confirmMatch = async () => {
    setSaving(true);
    try {
      await base44.entities.Guest.update(guest.id, {
        face_checkin_status: 'Checked in',
        face_checkin_at: new Date().toISOString(),
      });

      const linked = await base44.entities.AccommodationUnit.filter({ guest_name: guest.full_name });
      const units = Array.isArray(linked) ? linked : linked?.items || [];
      await Promise.all(
        units
          .filter((u) => u.status !== 'Occupied')
          .map((u) => base44.entities.AccommodationUnit.update(u.id, { status: 'Occupied' }))
      );

      // let the guest list and dashboard pick up the new status immediately
      [...entityCache.keys()].forEach((key) => {
        if (key.startsWith('Guest::') || key.startsWith('AccommodationUnit::')) entityCache.delete(key);
      });

      toast({
        title: t('人脸登记完成', 'Face check-in complete'),
        description: units.length
          ? t(`${guest.full_name} 已登记，住宿单元标记为已入住。`, `${guest.full_name} checked in, accommodation marked occupied.`)
          : t(`${guest.full_name} 已登记入住。`, `${guest.full_name} is checked in.`),
      });
      onComplete?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const scanning = step === STEPS.SCANNING;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-forest-700" /> {t('人脸登记', 'Face check-in')}
          </DialogTitle>
          <DialogDescription>
            {t('前台风控演示：将摄像头画面与登记的宾客照片比对。', 'Front desk demo: compare the live camera frame against the registered guest photo.')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
              {t('登记照片', 'Registered photo')}
            </p>
            <div className="overflow-hidden rounded-lg bg-forest-950">
              <Image src={guestAvatarUrl(guest)} alt={guest?.full_name} className="aspect-[4/5] w-full object-cover" />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-forest-950">{guest?.full_name}</p>
            <p className="text-[11.5px] text-muted-foreground">{guest?.email || '—'}</p>
            <p className="num mt-1 text-[11px] text-muted-foreground">ID · {guest?.id?.slice(-8)?.toUpperCase()}</p>
          </div>

          <div>
            <Frames
              active={scanning}
              tone={step === STEPS.FAIL ? 'fail' : step === STEPS.MATCH ? 'match' : 'default'}
            >
              <div className="relative aspect-[16/10] w-full">
                <Image src={guestAvatarUrl(guest)} alt="" className="h-full w-full object-cover opacity-40" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/85">
                  <span className={`h-1.5 w-1.5 rounded-full ${scanning ? 'animate-pulse bg-rose-400' : 'bg-emerald-400'}`} />
                  CAM-01 · {t('前台', 'Front desk')}
                </div>

                {step === STEPS.READY && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-white/70">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold text-white ring-1 ring-inset ring-white/30">
                        {guestInitials(guest?.full_name)}
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.14em]">{t('等待扫描', 'Awaiting scan')}</span>
                    </div>
                  </div>
                )}

                {scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-[11px] uppercase tracking-[0.14em]">{t('比对中…', 'Matching…')}</span>
                  </div>
                )}

                {step === STEPS.MATCH && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-emerald-950/45 text-white">
                    <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                    <span className="text-[13px] font-semibold">{t('已找到匹配', 'Match found')}</span>
                    <span className="num text-[11px] text-emerald-200">{t('相似度 98.4%', 'Confidence 98.4%')}</span>
                  </div>
                )}

                {step === STEPS.FAIL && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-rose-950/50 text-white">
                    <AlertTriangle className="h-8 w-8 text-rose-300" />
                    <span className="text-[13px] font-semibold">{t('未找到匹配', 'No match found')}</span>
                    <span className="num text-[11px] text-rose-200">{t('相似度 41.2% · 请重试', 'Confidence 41.2% · retry')}</span>
                  </div>
                )}
              </div>
            </Frames>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-100 ${step === STEPS.FAIL ? 'bg-rose-500' : step === STEPS.MATCH ? 'bg-emerald-500' : 'bg-forest-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-forest-900">
                <ShieldCheck className="h-3.5 w-3.5" /> {t('仅用于身份核验', 'Identification only')}
              </span>
              <br />
              {t(
                '照片仅存储于宾客档案，供前台核对身份；演示环境不进行真实人脸识别。',
                'The photo is stored on the guest profile for front desk identification only. This demo does not run real facial recognition.'
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {step === STEPS.READY && (
                <Button className="gap-1.5" onClick={() => runScan(false)}>
                  <Camera className="h-3.5 w-3.5" /> {t('开始人脸扫描', 'Start face scan')}
                </Button>
              )}

              {scanning && (
                <Button variant="secondary" disabled className="gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('扫描中…', 'Scanning…')}
                </Button>
              )}

              {step === STEPS.MATCH && (
                <Button className="gap-1.5" onClick={confirmMatch} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {t('确认登记', 'Confirm check-in')}
                </Button>
              )}

              {step === STEPS.FAIL && (
                <>
                  <Button className="gap-1.5" onClick={() => runScan(false)}>
                    <RefreshCw className="h-3.5 w-3.5" /> {t('重试扫描', 'Retry scan')}
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {t('手动核验', 'Verify manually')}
                  </Button>
                </>
              )}

              {step === STEPS.READY && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11.5px] text-muted-foreground"
                  onClick={() => runScan(true)}
                >
                  {t('演示：模拟未匹配', 'Demo: simulate no match')}
                </Button>
              )}

              <Button variant="ghost" className="ml-auto" onClick={() => onOpenChange(false)}>
                {t('取消', 'Cancel')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}