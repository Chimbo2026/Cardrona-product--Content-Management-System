import { useLang } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import RecordFormDialog from '@/components/common/RecordFormDialog';
import { MARKETING_SOURCES, sourceLabel } from '@/lib/marketing';
import { todayISO } from '@/lib/format';

export default function MetricDialog({ open, onOpenChange, metric, onSaved }) {
  const { lang, t } = useLang();

  const fields = [
    { name: 'metric_date', label: t('记录日期', 'Metric date'), type: 'date', required: true, defaultValue: todayISO() },
    { name: 'campaign', label: t('活动名称', 'Campaign'), type: 'text', required: true, placeholder: t('例如：早鸟季票推广', 'e.g. Early-bird season pass') },
    {
      name: 'source',
      label: t('渠道来源', 'Campaign source'),
      type: 'select',
      required: true,
      options: MARKETING_SOURCES.map((v) => ({ value: v, label: sourceLabel(v, lang) })),
    },
    { name: 'sessions', label: t('访问量', 'Sessions'), type: 'number', required: true },
    { name: 'new_visitors', label: t('新访客', 'New visitors'), type: 'number' },
    { name: 'conversions', label: t('转化数', 'Conversions'), type: 'number' },
    { name: 'bounce_rate', label: t('跳出率 %', 'Bounce rate %'), type: 'number', required: true, step: 0.1, hint: t('0–100', '0–100') },
    { name: 'revenue', label: t('带来营收 (NZD)', 'Revenue (NZD)'), type: 'number' },
    { name: 'logged_by', label: t('记录人', 'Logged by'), type: 'text', placeholder: t('例如：市场部', 'e.g. Marketing') },
    { name: 'notes', label: t('备注', 'Notes'), type: 'textarea', colSpan: 2 },
  ];

  const submit = async (payload) => {
    if (metric) await base44.entities.MarketingMetric.update(metric.id, payload);
    else await base44.entities.MarketingMetric.create(payload);
    onSaved();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={metric ? t('编辑营销记录', 'Edit marketing metric') : t('新增营销记录', 'Log marketing metric')}
      description={t('按活动记录访问量、跳出率与转化，用于渠道效果分析。', 'Log sessions, bounce rate and conversions per campaign for channel analysis.')}
      fields={fields}
      initialValues={metric || {}}
      onSubmit={submit}
      submitLabel={metric ? t('保存修改', 'Save changes') : t('添加记录', 'Add metric')}
    />
  );
}