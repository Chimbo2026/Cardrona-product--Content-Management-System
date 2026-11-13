import { useLang } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import RecordFormDialog from '@/components/common/RecordFormDialog';

const STATUS_VALUES = ['Published', 'Draft', 'Archived'];

export default function ContentDialog({ open, onOpenChange, section, entry, onSaved }) {
  const { t } = useLang();

  const statusField = {
    name: 'status',
    label: t('状态', 'Status'),
    type: 'select',
    required: true,
    defaultValue: 'Draft',
    options: STATUS_VALUES.map((v) => ({
      value: v,
      label: { Published: t('已发布', 'Published'), Draft: t('草稿', 'Draft'), Archived: t('已归档', 'Archived') }[v],
    })),
  };

  const orderField = {
    name: 'sort_order',
    label: t('排序', 'Display order'),
    type: 'number',
    defaultValue: 0,
    hint: t('数字越小越靠前', 'Lower numbers appear first'),
  };

  const updatedField = {
    name: 'updated_by',
    label: t('更新人', 'Updated by'),
    type: 'text',
    placeholder: t('例如：市场部', 'e.g. Marketing team'),
  };

  const fieldsBySection = {
    Products: [
      { name: 'title', label: t('产品名称（英文）', 'Product name (English)'), type: 'text', required: true },
      { name: 'title_zh', label: t('产品名称（中文）', 'Product name (Chinese)'), type: 'text' },
      {
        name: 'category',
        label: t('产品分类', 'Category'),
        type: 'select',
        options: ['Lift Passes', 'Lessons', 'Rentals', 'Accommodation', 'Events', 'Transport'].map((v) => ({
          value: v,
          label: {
            'Lift Passes': t('缆车票', 'Lift passes'),
            Lessons: t('滑雪课程', 'Lessons'),
            Rentals: t('装备租赁', 'Rentals'),
            Accommodation: t('住宿', 'Accommodation'),
            Events: t('活动', 'Events'),
            Transport: t('交通接驳', 'Transport'),
          }[v],
        })),
      },
      { name: 'price', label: t('价格 (NZD)', 'Price (NZD)'), type: 'number' },
      { name: 'body', label: t('产品说明（英文）', 'Description (English)'), type: 'textarea', colSpan: 2 },
      { name: 'body_zh', label: t('产品说明（中文）', 'Description (Chinese)'), type: 'textarea', colSpan: 2 },
      statusField,
      orderField,
      updatedField,
    ],
    Translations: [
      {
        name: 'key',
        label: t('词条 key', 'Translation key'),
        type: 'text',
        required: true,
        colSpan: 2,
        placeholder: 'home.hero.title',
        hint: t('与开发约定一致的唯一标识', 'Unique identifier shared with the website build'),
      },
      { name: 'title', label: t('英文文案', 'English text'), type: 'textarea', required: true, colSpan: 2 },
      { name: 'title_zh', label: t('中文文案', 'Chinese text'), type: 'textarea', required: true, colSpan: 2 },
      { name: 'body', label: t('使用场景说明', 'Context / usage notes'), type: 'textarea', colSpan: 2 },
      { name: 'status', ...statusField, label: t('发布状态', 'Publish state') },
      updatedField,
    ],
    FAQs: [
      { name: 'title', label: t('问题（英文）', 'Question (English)'), type: 'text', required: true },
      { name: 'title_zh', label: t('问题（中文）', 'Question (Chinese)'), type: 'text' },
      {
        name: 'category',
        label: t('问题分类', 'Category'),
        type: 'select',
        options: ['Booking', 'Passes', 'Lessons', 'Rentals', 'Getting Here', 'Other'].map((v) => ({
          value: v,
          label: {
            Booking: t('预订', 'Booking'),
            Passes: t('缆车票', 'Passes'),
            Lessons: t('滑雪学校', 'Lessons'),
            Rentals: t('租赁', 'Rentals'),
            'Getting Here': t('交通抵达', 'Getting here'),
            Other: t('其他', 'Other'),
          }[v],
        })),
      },
      { name: 'body', label: t('回答（英文）', 'Answer (English)'), type: 'textarea', colSpan: 2 },
      { name: 'body_zh', label: t('回答（中文）', 'Answer (Chinese)'), type: 'textarea', colSpan: 2 },
      statusField,
      orderField,
    ],
    'Mountain Information': [
      { name: 'title', label: t('标题（英文）', 'Title (English)'), type: 'text', required: true },
      { name: 'title_zh', label: t('标题（中文）', 'Title (Chinese)'), type: 'text' },
      {
        name: 'category',
        label: t('信息分类', 'Category'),
        type: 'select',
        options: ['Snow & Weather', 'Terrain & Lifts', 'Getting Here', 'Safety', 'Mountain Rules'].map((v) => ({
          value: v,
          label: {
            'Snow & Weather': t('雪况与天气', 'Snow & weather'),
            'Terrain & Lifts': t('地形与缆车', 'Terrain & lifts'),
            'Getting Here': t('交通抵达', 'Getting here'),
            Safety: t('安全须知', 'Safety'),
            'Mountain Rules': t('山地规则', 'Mountain rules'),
          }[v],
        })),
      },
      { name: 'body', label: t('内容（英文）', 'Details (English)'), type: 'textarea', colSpan: 2 },
      { name: 'body_zh', label: t('内容（中文）', 'Details (Chinese)'), type: 'textarea', colSpan: 2 },
      statusField,
      orderField,
      updatedField,
    ],
  };

  const labels = {
    Products: t('产品', 'Products'),
    Translations: t('翻译词条', 'Translations'),
    FAQs: t('常见问题', 'FAQs'),
    'Mountain Information': t('山地信息', 'Mountain Information'),
  };

  const submit = async (payload) => {
    const data = { ...payload, section };
    if (entry) await base44.entities.ContentItem.update(entry.id, data);
    else await base44.entities.ContentItem.create(data);
    onSaved();
  };

  return (
    <RecordFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${entry ? t('编辑', 'Edit') : t('新增', 'Add')} · ${labels[section] || section}`}
      description={t('保存后会立即更新内容库，供官网读取。', 'Saving updates the content library the website reads from.')}
      fields={fieldsBySection[section] || []}
      initialValues={entry || {}}
      onSubmit={submit}
      validate={(values) => {
        const errors = {};
        if (section === 'Translations' && !String(values.key || '').trim()) {
          errors.key = t('词条 key 为必填项', 'Key is required');
        }
        return errors;
      }}
      submitLabel={entry ? t('保存修改', 'Save changes') : t('添加内容', 'Add content')}
    />
  );
}