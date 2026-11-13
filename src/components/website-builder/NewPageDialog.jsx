import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import ImageUploadField from './ImageUploadField';
import { entityCache } from '@/hooks/useList';
import { useLang } from '@/lib/i18n';

const EMPTY = { title: '', slug: '', hero_image_url: '', promo_text: '' };

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function NewPageDialog({ open, onOpenChange, pageType, existingSlugs = [], onCreated }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isCampaign = pageType === 'Campaign';

  const set = (key) => (event) => {
    const value = event && event.target ? event.target.value : event;
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    const slug = slugify(values.slug || values.title);
    if (!values.title.trim()) next.title = t('请填写名称。', 'Enter a name.');
    if (!slug) next.slug = t('请填写 URL slug。', 'Enter a URL slug.');
    else if (existingSlugs.includes(slug)) next.slug = t('该 slug 已被使用。', 'That slug is already in use.');
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const record = await base44.entities.SitePage.create({
        page_type: pageType,
        title: values.title.trim(),
        slug,
        hero_title: values.title.trim(),
        hero_subtitle: '',
        hero_image_url: values.hero_image_url,
        body_text: '',
        promo_text: values.promo_text.trim(),
        status: 'Published',
        sort_order: 0,
      });
      entityCache.clear();
      setValues(EMPTY);
      setErrors({});
      onOpenChange(false);
      onCreated?.(record);
      toast({
        title: t('落地页已创建', 'Landing page created'),
        description: t(`已上线：/site/${slug}`, `Now live at /site/${slug}`),
      });
    } catch (error) {
      setErrors({ form: error.message || t('创建失败，请重试。', 'Could not create the page, please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px]">
            {isCampaign ? t('新建活动落地页', 'New campaign landing page') : t('新建产品页面', 'New product page')}
          </DialogTitle>
          <DialogDescription>
            {t(
              '填写后即可生成页面，访问地址为 /site/您的-slug。',
              'The page is generated instantly and lives at /site/your-slug.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3.5">
          <Field label={isCampaign ? t('活动名称', 'Campaign name') : t('产品名称', 'Product name')} required error={errors.title}>
            <Input
              value={values.title}
              onChange={set('title')}
              placeholder={isCampaign ? t('例如：早鸟季卡', 'e.g. Early Bird Season Pass') : t('例如：雪具租赁', 'e.g. Equipment Rentals')}
            />
          </Field>
          <Field
            label={t('URL slug', 'URL slug')}
            required
            error={errors.slug}
            hint={t('留空时自动根据名称生成。', 'Leave blank to generate it from the name.')}
          >
            <Input value={values.slug} onChange={set('slug')} placeholder="early-bird-season-pass" />
          </Field>
          <Field label={isCampaign ? t('活动图片', 'Campaign image') : t('页面主图', 'Page image')}>
            <ImageUploadField value={values.hero_image_url} onChange={set('hero_image_url')} />
          </Field>
          <Field label={t('推广文案', 'Promotional text')}>
            <Textarea value={values.promo_text} onChange={set('promo_text')} rows={3} />
          </Field>

          {errors.form && <p className="text-[12px] font-medium text-rose-600">{errors.form}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('取消', 'Cancel')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('创建中…', 'Creating…') : t('创建并上线', 'Create & publish')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}