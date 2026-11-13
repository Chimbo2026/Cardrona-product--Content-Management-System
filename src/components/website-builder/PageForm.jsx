import { useState } from 'react';
import { Eye, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import ImageUploadField from './ImageUploadField';
import PreviewDialog from './PreviewDialog';
import { entityCache } from '@/hooks/useList';
import { useLang } from '@/lib/i18n';

export default function PageForm({ page, pageType, onSaved }) {
  const { t } = useLang();
  const { toast } = useToast();
  const isHome = pageType === 'Home';

  const [values, setValues] = useState(() => ({
    title: page?.title || (isHome ? 'Home' : ''),
    slug: page?.slug || (isHome ? 'home' : ''),
    hero_title: page?.hero_title || '',
    hero_subtitle: page?.hero_subtitle || '',
    hero_image_url: page?.hero_image_url || '',
    body_text: page?.body_text || '',
    promo_text: page?.promo_text || '',
    status: page?.status || 'Draft',
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = (key) => (event) => {
    const value = event && event.target ? event.target.value : event;
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const save = async (event) => {
    event.preventDefault();
    const next = {};
    if (!isHome && !values.title.trim()) next.title = t('请填写页面名称。', 'Enter a page name.');
    if (!isHome && !values.slug.trim()) next.slug = t('请填写 URL slug。', 'Enter a URL slug.');
    if (!values.hero_title.trim()) next.hero_title = t('请填写主标题。', 'Enter a hero title.');
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...values,
        page_type: pageType,
        title: isHome ? 'Home' : values.title.trim(),
        slug: isHome
          ? 'home'
          : values.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        sort_order: page?.sort_order || 0,
      };
      if (page) await base44.entities.SitePage.update(page.id, payload);
      else await base44.entities.SitePage.create(payload);
      entityCache.clear();
      toast({
        title: t('已保存', 'Saved'),
        description: t('前端页面已使用新的内容。', 'The front-end page now shows the new content.'),
      });
      onSaved?.();
    } catch (error) {
      setErrors({ form: error.message || t('保存失败，请重试。', 'Could not save, please try again.') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      {!isHome && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label={t('页面名称', 'Page name')} required error={errors.title}>
            <Input
              value={values.title}
              onChange={set('title')}
              placeholder={t('例如：早鸟季卡', 'e.g. Early Bird Season Pass')}
            />
          </Field>
          <Field label={t('URL slug', 'URL slug')} required error={errors.slug} hint={t('访问地址：/site/…', 'Lives at: /site/…')}>
            <Input value={values.slug} onChange={set('slug')} placeholder="early-bird-season-pass" />
          </Field>
        </div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label={t('主标题', 'Hero title')} required error={errors.hero_title}>
          <Input
            value={values.hero_title}
            onChange={set('hero_title')}
            placeholder={t('页面大标题', 'The big page headline')}
          />
        </Field>
        <Field label={t('副标题', 'Hero subtitle')}>
          <Input value={values.hero_subtitle} onChange={set('hero_subtitle')} />
        </Field>
      </div>

      <Field
        label={t('主图', 'Hero image')}
        hint={t('建议使用 1600px 以上的横向图片。', 'Use a landscape image at least 1600px wide.')}
      >
        <ImageUploadField value={values.hero_image_url} onChange={set('hero_image_url')} />
      </Field>

      <Field label={t('正文内容', 'Body text')} hint={t('每次换行会显示为一个段落。', 'Each line break becomes a new paragraph.')}>
        <Textarea value={values.body_text} onChange={set('body_text')} rows={5} />
      </Field>

      <Field label={t('推广文案', 'Promotional text')}>
        <Textarea value={values.promo_text} onChange={set('promo_text')} rows={2} />
      </Field>

      <Field label={t('发布状态', 'Publish state')}>
        <SelectNative
          value={values.status}
          onChange={set('status')}
          className="w-full sm:w-64"
          options={[
            { value: 'Draft', label: t('草稿（仅预览）', 'Draft (preview only)') },
            { value: 'Published', label: t('已发布（公开可见）', 'Published (live)') },
          ]}
        />
      </Field>

      {errors.form && <p className="text-[12px] font-medium text-rose-600">{errors.form}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
          <Eye className="h-3.5 w-3.5" />
          {t('实时预览', 'Live preview')}
        </Button>
        <div className="flex items-center gap-3">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            {values.status === 'Published'
              ? t('保存后即刻上线。', 'Saves straight to the live page.')
              : t('草稿不会对公众显示。', 'Drafts stay hidden from the public.')}
          </p>
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            {saving ? t('保存中…', 'Saving…') : t('保存修改', 'Save changes')}
          </Button>
        </div>
      </div>

      <PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} page={{ ...values, page_type: pageType }} />
    </form>
  );
}