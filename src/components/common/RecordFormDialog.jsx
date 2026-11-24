import { useEffect, useRef, useState } from 'react';
import { ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Field from '@/components/common/Field';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

const emptyFor = (fields) =>
  fields.reduce((acc, f) => {
    acc[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    return acc;
  }, {});

export default function RecordFormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  submitLabel,
  validate,
  note,
}) {
  const { t } = useLang();
  const [values, setValues] = useState(() => emptyFor(fields));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  const wasOpen = useRef(false);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setValues({ ...emptyFor(fields), ...(initialValues || {}) });
      setErrors({});
      setFormError('');
    }
    wasOpen.current = open;
  }, [open, fields, initialValues]);

  const set = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const uploadImage = async (name, file) => {
    if (!file) return;
    setUploading(name);
    setFormError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set(name, file_url);
    } catch (err) {
      setFormError(err?.message || t('图片上传失败，请重试。', 'Image upload failed. Please try again.'));
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    fields.filter((f) => !f.hidden && (!f.showWhen || f.showWhen(values))).forEach((f) => {
      const raw = values[f.name];
      if (f.required && (raw === '' || raw === null || raw === undefined)) {
        nextErrors[f.name] = t(`${f.label} 为必填项`, `${f.label} is required`);
      }
      if (f.type === 'number' && raw !== '' && Number.isNaN(Number(raw))) {
        nextErrors[f.name] = t('请输入数字', 'Enter a number');
      }
    });
    if (validate) Object.assign(nextErrors, validate(values) || {});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = { ...values };
    fields.forEach((f) => {
      if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
    });

    setSaving(true);
    setFormError('');
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      setFormError(err?.message || t('操作失败，请重试。', 'Something went wrong. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const visible = fields.filter((f) => !f.hidden && (!f.showWhen || f.showWhen(values)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {note && (
            <div className="rounded-lg border border-ice-200 bg-ice-50 px-3 py-2 text-[11.5px] text-ice-900">
              {note}
            </div>
          )}
          <div className="grid gap-3.5 sm:grid-cols-2">
            {visible.map((f) => (
              <div key={f.name} className={cn(f.colSpan === 2 && 'sm:col-span-2')}>
                <Field label={f.label} required={f.required} hint={f.hint} error={errors[f.name]}>
                  {f.type === 'select' ? (
                    <select
                      value={values[f.name] ?? ''}
                      onChange={(e) => set(f.name, e.target.value)}
                      className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-[13px] text-forest-900 outline-none focus:border-ice-400 focus:ring-2 focus:ring-ice-200"
                    >
                      <option value="">{t('请选择…', 'Select…')}</option>
                      {(f.options || []).map((o) => {
                        const opt = typeof o === 'string' ? { value: o, label: o } : o;
                        return (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        );
                      })}
                    </select>
                  ) : f.type === 'image' ? (
                    <div className="flex items-start gap-3">
                      <div className="h-[76px] w-[124px] shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                        {values[f.name] ? (
                          <Image src={values[f.name]} alt="" fittingType="fill" className="h-full w-full" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label
                          className={cn(
                            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-white px-2.5 text-[12px] font-medium text-forest-900 hover:bg-secondary',
                            uploading === f.name && 'pointer-events-none opacity-60'
                          )}
                        >
                          {uploading === f.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {uploading === f.name ? t('上传中…', 'Uploading…') : values[f.name] ? t('更换图片', 'Replace image') : t('上传图片', 'Upload image')}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              uploadImage(f.name, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {values[f.name] && (
                          <button
                            type="button"
                            onClick={() => set(f.name, '')}
                            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted-foreground hover:text-rose-700"
                          >
                            <Trash2 className="h-3 w-3" /> {t('移除图片', 'Remove image')}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : f.type === 'textarea' ? (
                    <Textarea
                      value={values[f.name] ?? ''}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      rows={3}
                      className="text-[13px]"
                    />
                  ) : (
                    <Input
                      type={f.type === 'number' ? 'number' : f.type === 'time' ? 'time' : f.type === 'date' ? 'date' : 'text'}
                      value={values[f.name] ?? ''}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      min={f.type === 'number' ? 0 : undefined}
                      step={f.step}
                      className="h-9 text-[13px]"
                    />
                  )}
                </Field>
                {f.caption && <p className="mt-1 text-[11px] text-muted-foreground">{f.caption}</p>}
              </div>
            ))}
          </div>
          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-700">{formError}</p>
          )}
          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t('取消', 'Cancel')}
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitLabel || t('保存', 'Save record')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}