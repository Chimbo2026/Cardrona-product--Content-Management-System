import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { NZD } from '@/lib/format';

const primary = (row, lang) => (lang === 'zh' ? row.title_zh || row.title : row.title);

const nameCell = (row, lang) => (
  <div>
    <p className="font-medium">{primary(row, lang)}</p>
    <p className="text-[10.5px] text-muted-foreground">{lang === 'zh' ? row.title : row.title_zh || '—'}</p>
  </div>
);

export default function ContentTable({ section, rows, loading, canWrite, onEdit }) {
  const { lang, t } = useLang();

  const editColumn = canWrite
    ? [{
        key: 'actions',
        label: '',
        align: 'right',
        render: (row) => (
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11.5px]" onClick={() => onEdit(row)}>
            <Pencil className="h-3 w-3" /> {t('编辑', 'Edit')}
          </Button>
        ),
      }]
    : [];

  const statusColumn = { key: 'status', label: t('状态', 'Status'), render: (row) => <StatusBadge status={row.status} /> };

  let columns;
  let emptyTitle;
  let emptyDescription;

  if (section === 'Translations') {
    emptyTitle = t('暂无翻译词条', 'No translation entries yet');
    emptyDescription = t('新增词条后可维护网站的中英文文案。', 'Add an entry to maintain the website copy in English and Chinese.');
    columns = [
      { key: 'key', label: t('词条 key', 'Key'), render: (row) => <span className="font-mono text-[11.5px]">{row.key || '—'}</span> },
      { key: 'title', label: t('英文文案', 'English'), render: (row) => row.title || '—' },
      { key: 'title_zh', label: t('中文文案', 'Chinese'), render: (row) => <span className="text-forest-950">{row.title_zh || '—'}</span> },
      statusColumn,
    ];
  } else if (section === 'Products') {
    emptyTitle = t('暂无产品', 'No products yet');
    emptyDescription = t('新增产品后即可在官网展示价格与说明。', 'Add a product to publish its price and description on the website.');
    columns = [
      { key: 'title', label: t('产品', 'Product'), render: (row) => nameCell(row, lang) },
      { key: 'category', label: t('分类', 'Category'), render: (row) => row.category || '—' },
      { key: 'price', label: t('价格', 'Price'), align: 'right', render: (row) => <span className="num">{NZD(row.price)}</span> },
      statusColumn,
    ];
  } else if (section === 'FAQs') {
    emptyTitle = t('暂无常见问题', 'No FAQs yet');
    emptyDescription = t('新增问答后即可在官网帮助中心展示。', 'Add a Q&A pair to show it in the website help centre.');
    columns = [
      { key: 'title', label: t('问题', 'Question'), render: (row) => nameCell(row, lang) },
      { key: 'category', label: t('分类', 'Category'), render: (row) => row.category || '—' },
      { key: 'body', label: t('回答', 'Answer'), render: (row) => <span className="line-clamp-2 block max-w-[420px] text-[11.5px] text-muted-foreground">{lang === 'zh' ? row.body_zh || row.body : row.body || '—'}</span> },
      statusColumn,
    ];
  } else {
    emptyTitle = t('暂无山地信息', 'No mountain information yet');
    emptyDescription = t('新增山地信息后即可在官网展示天气、交通与安全须知。', 'Add mountain information to publish weather, access and safety notices.');
    columns = [
      { key: 'title', label: t('标题', 'Title'), render: (row) => nameCell(row, lang) },
      { key: 'category', label: t('分类', 'Category'), render: (row) => row.category || '—' },
      { key: 'body', label: t('内容', 'Content'), render: (row) => <span className="line-clamp-2 block max-w-[420px] text-[11.5px] text-muted-foreground">{lang === 'zh' ? row.body_zh || row.body : row.body || '—'}</span> },
      statusColumn,
    ];
  }

  return (
    <DataTable
      columns={[...columns, ...editColumn]}
      rows={rows}
      loading={loading}
      compact
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
}