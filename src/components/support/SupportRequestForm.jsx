import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Field from '@/components/common/Field';
import { SelectNative } from '@/components/common/Controls';
import { useLang } from '@/lib/i18n';

const EMPTY = { name: '', email: '', company: '', topic: 'Training', message: '' };

export default function SupportRequestForm({ initialTopic = 'Training' }) {
  const { t } = useLang();
  const { toast } = useToast();
  const [values, setValues] = useState({ ...EMPTY, topic: initialTopic });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const topics = [
    { value: 'Training', label: t('培训需求', 'Training request') },
    { value: 'Support', label: t('技术支持', 'Technical support') },
    { value: 'Data ownership', label: t('数据所有权问题', 'Data ownership question') },
  ];

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = t('请填写姓名。', 'Enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = t('请填写有效的邮箱地址。', 'Enter a valid email address.');
    if (!values.message.trim()) next.message = t('请描述您的需求。', 'Describe your request.');
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      await base44.entities.SupportRequest.create({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        topic: values.topic,
        message: values.message.trim(),
        status: 'New',
      });
      setSentTo(values.email.trim());
      setValues({ ...EMPTY, topic: initialTopic });
      toast({ title: t('请求已提交', 'Request submitted'), description: t('我们会尽快与您联系。', 'We will be in touch shortly.') });
    } catch (error) {
      setErrors({ message: error.message || t('提交失败，请重试。', 'Could not submit, please try again.') });
    } finally {
      setSaving(false);
    }
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-start gap-3 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 text-forest-700">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-forest-900">{t('请求已收到', 'Request received')}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            {t(
              `我们已记录您的需求，并会在 1 个工作日内通过 ${sentTo} 与您联系。`,
              `We have logged your request and will reply to ${sentTo} within one business day.`
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSentTo(null)}>
          {t('再提交一条', 'Send another request')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label={t('姓名', 'Name')} required error={errors.name}>
          <Input value={values.name} onChange={set('name')} placeholder={t('您的姓名', 'Your name')} />
        </Field>
        <Field label={t('邮箱', 'Email')} required error={errors.email}>
          <Input type="email" value={values.email} onChange={set('email')} placeholder="name@company.com" />
        </Field>
        <Field label={t('公司 / 机构', 'Company')}>
          <Input value={values.company} onChange={set('company')} placeholder={t('选填', 'Optional')} />
        </Field>
        <Field label={t('需求类型', 'Request type')}>
          <SelectNative value={values.topic} onChange={set('topic')} options={topics} className="w-full" />
        </Field>
      </div>
      <Field label={t('需求说明', 'How can we help')} required error={errors.message}>
        <Textarea
          value={values.message}
          onChange={set('message')}
          rows={4}
          placeholder={t('例如：需要为 20 人的客服团队安排系统培训。', 'For example: onboard training for a 20-person guest services team.')}
        />
      </Field>
      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-muted-foreground">
          {t('提交后我们会记录请求，并安排培训或支持负责人跟进。', 'Requests are logged and routed to the training or support lead.')}
        </p>
        <Button type="submit" disabled={saving} className="shrink-0 gap-1.5">
          <Send className="h-3.5 w-3.5" />
          {saving ? t('提交中…', 'Sending…') : t('提交请求', 'Submit request')}
        </Button>
      </div>
    </form>
  );
}