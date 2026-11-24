import { useEffect, useState } from 'react';
import { ImageOff, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Field from '@/components/common/Field';
import { useToast } from '@/components/ui/use-toast';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const EMPTY_RENTAL = { discipline: '', shoe_size: '', height_cm: '', weight_kg: '', ability_level: '' };
const RENTAL_KEYS = Object.keys(EMPTY_RENTAL);

export default function PreArrivalCheckInDialog({ guest, open, onOpenChange, onComplete }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [waiver, setWaiver] = useState(false);
  const [rental, setRental] = useState(EMPTY_RENTAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview('');
    setWaiver(Boolean(guest?.waiver_signed));
    setRental({
      discipline: guest?.rental_discipline || '',
      shoe_size: guest?.shoe_size || '',
      height_cm: guest?.height_cm ? String(guest.height_cm) : '',
      weight_kg: guest?.weight_kg ? String(guest.weight_kg) : '',
      ability_level: guest?.ability_level || '',
    });
    setErrors({});
    setFormError('');
    setSaving(false);
  }, [open, guest?.id]);

  const pickFile = (picked) => {
    if (!picked) return;
    setFile(picked);
    setErrors((prev) => ({ ...prev, photo: undefined }));
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ''));
    reader.readAsDataURL(picked);
  };

  const setRentalField = (key, value) => {
    setRental((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!file && !guest?.checkin_photo_uri) next.photo = t('请上传宾客照片', 'Upload a photo of the guest');
    if (!waiver) next.waiver = t('请确认免责声明已签署', 'Confirm the waiver has been signed');
    RENTAL_KEYS.forEach((key) => {
      if (!String(rental[key]).trim()) next[key] = t('必填', 'Required');
    });
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setFormError('');
    try {
      let photoUri = guest.checkin_photo_uri || '';
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        photoUri = file_uri;
      }
      const now = new Date().toISOString();
      await base44.entities.Guest.update(guest.id, {
        checkin_photo_uri: photoUri,
        checkin_status: 'Ready for arrival',
        checkin_completed_at: now,
        waiver_signed: true,
        waiver_signed_at: now,
        rental_profile_complete: true,
        rental_discipline: rental.discipline,
        shoe_size: rental.shoe_size,
        height_cm: Number(rental.height_cm),
        weight_kg: Number(rental.weight_kg),
        ability_level: rental.ability_level,
      });
      toast({
        title: t('预抵达手续已完成', 'Pre-arrival check-in complete'),
        description: t(`${guest.full_name} 状态已更新为“待抵达”。`, `${guest.full_name} is now ready for arrival.`),
      });
      onOpenChange(false);
      onComplete?.();
    } catch (err) {
      setFormError(err?.message || t('保存失败，请重试。', 'Could not save the check-in. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('预抵达登记', 'Pre-Arrival Check-In')}</DialogTitle>
          <DialogDescription>
            {t(
              `为 ${guest?.full_name || ''} 采集照片、确认免责声明并补全租赁资料。照片仅用于员工核对身份，系统不进行任何人脸识别。`,
              `Collect a photo, confirm the waiver and complete the rental profile for ${guest?.full_name || 'this guest'}. Photos are used by staff for identification only — no facial recognition is performed.`
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('1. 宾客照片', '1. Guest photo')}
            </p>
            <div className="flex items-start gap-3">
              <div className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {preview ? (
                  <Image src={preview} alt="" fittingType="fill" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="inline-flex h-8 w-fit cursor-pointer items-center gap-1.5 rounded-md border border-input bg-white px-2.5 text-[12px] font-medium text-forest-900 hover:bg-secondary">
                  <Upload className="h-3.5 w-3.5" />
                  {preview ? t('更换照片', 'Replace photo') : t('上传照片', 'Upload photo')}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      pickFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  {guest?.checkin_photo_uri && !preview
                    ? t('已有照片存档，可选择保留。', 'A photo is already on file — you can keep it.')
                    : t('照片将私密存储，仅员工可见。', 'The photo is stored privately and visible to staff only.')}
                </p>
                {errors.photo && <p className="text-[11.5px] font-medium text-rose-700">{errors.photo}</p>}
              </div>
            </div>
          </section>

          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('2. 免责声明确认', '2. Waiver confirmation')}
            </p>
            <label
              className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-[12.5px]',
                waiver ? 'border-emerald-600/30 bg-emerald-50 text-emerald-900' : 'border-border bg-white text-forest-900'
              )}
            >
              <input
                type="checkbox"
                checked={waiver}
                onChange={(e) => {
                  setWaiver(e.target.checked);
                  setErrors((prev) => ({ ...prev, waiver: undefined }));
                }}
                className="mt-0.5 h-3.5 w-3.5 accent-emerald-600"
              />
              <span className="flex-1">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('宾客已签署高山活动风险免责声明', 'The guest has signed the alpine risk waiver')}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                  {t('勾选后将记录签署时间。', 'The signing time is recorded when you confirm.')}
                </span>
              </span>
            </label>
            {errors.waiver && <p className="mt-1 text-[11.5px] font-medium text-rose-700">{errors.waiver}</p>}
          </section>

          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t('3. 租赁资料', '3. Rental profile')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t('项目', 'Discipline')} required error={errors.discipline}>
                <select
                  value={rental.discipline}
                  onChange={(e) => setRentalField('discipline', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-[13px] text-forest-900 outline-none focus:border-ice-400 focus:ring-2 focus:ring-ice-200"
                >
                  <option value="">{t('请选择…', 'Select…')}</option>
                  <option value="Ski">{t('双板滑雪', 'Ski')}</option>
                  <option value="Snowboard">{t('单板滑雪', 'Snowboard')}</option>
                </select>
              </Field>
              <Field label={t('能力等级', 'Ability level')} required error={errors.ability_level}>
                <select
                  value={rental.ability_level}
                  onChange={(e) => setRentalField('ability_level', e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-[13px] text-forest-900 outline-none focus:border-ice-400 focus:ring-2 focus:ring-ice-200"
                >
                  <option value="">{t('请选择…', 'Select…')}</option>
                  {['First Timer', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                    <option key={level} value={level}>
                      {t({ 'First Timer': '零基础', Beginner: '初级', Intermediate: '中级', Advanced: '高级', Expert: '专家' }[level], level)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('鞋码（雪鞋）', 'Boot size')} required error={errors.shoe_size}>
                <Input
                  value={rental.shoe_size}
                  onChange={(e) => setRentalField('shoe_size', e.target.value)}
                  placeholder={t('例如 27.5', 'e.g. 27.5')}
                  className="h-9 text-[13px]"
                />
              </Field>
              <Field label={t('身高（厘米）', 'Height (cm)')} required error={errors.height_cm}>
                <Input
                  type="number"
                  min={0}
                  value={rental.height_cm}
                  onChange={(e) => setRentalField('height_cm', e.target.value)}
                  className="h-9 text-[13px]"
                />
              </Field>
              <Field label={t('体重（公斤）', 'Weight (kg)')} required error={errors.weight_kg}>
                <Input
                  type="number"
                  min={0}
                  value={rental.weight_kg}
                  onChange={(e) => setRentalField('weight_kg', e.target.value)}
                  className="h-9 text-[13px]"
                />
              </Field>
            </div>
          </section>

          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">{formError}</p>
          )}

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('取消', 'Cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t('完成预抵达登记', 'Complete check-in')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}