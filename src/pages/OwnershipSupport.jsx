import { useState } from 'react';
import { GraduationCap, LifeBuoy, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/common/Panel';
import SupportRequestForm from '@/components/support/SupportRequestForm';
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/i18n';

const OWNED_DATA = [
  ['宾客记录', 'Guest records'],
  ['预订数据', 'Booking data'],
  ['财务报告', 'Financial reports'],
];

export default function OwnershipSupport() {
  const { t } = useLang();
  const [topic, setTopic] = useState('Support');

  return (
    <div>
      <PageHeader
        eyebrow={t('行政管理', 'Administration')}
        title={t('所有权与支持', 'Ownership & Support')}
        description={t(
          '您的账号、数据与服务保障，以及培训和技术支持的联系方式。',
          'Where your accounts, data and service commitments live, plus how to reach training and technical support.'
        )}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel
          title={t('数据所有权', 'Data ownership')}
          description={t('归度假村所有的数据范围', 'What belongs to the resort')}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-600/10">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <p className="text-[15px] font-semibold leading-snug text-forest-950">
                {t('公司拥有其账号与数据。', 'The company owns its accounts and data.')}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t(
                  '所有宾客记录、预订数据与财务报告均为度假村的财产，不属于软件供应商。您可以随时导出，并在需要时完整取回。',
                  'All guest records, booking data and financial reports are the property of the resort, not the software supplier. You can export them at any time and retrieve the full set on request.'
                )}
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2 border-t border-border/60 pt-3.5">
            {OWNED_DATA.map(([zh, en]) => (
              <li key={en} className="flex items-center gap-2 text-[12.5px] text-forest-900">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-forest-600" />
                {t(zh, en)}
                <span className="ml-auto text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                  {t('度假村所有', 'Resort owned')}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t('培训与支持', 'Training & support')}
          description={t('包含在服务内的支持范围', 'Included with your service')}
        >
          <p className="text-[15px] font-semibold leading-snug text-forest-950">
            {t(
              '员工培训、系统维护与持续技术支持均已包含在内。',
              'Staff training, maintenance, and ongoing technical support are included.'
            )}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={topic === 'Support' ? 'default' : 'outline'}
              className="gap-1.5"
              onClick={() => setTopic('Support')}
            >
              <LifeBuoy className="h-3.5 w-3.5" />
              {t('申请技术支持', 'Request technical support')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={topic === 'Training' ? 'default' : 'outline'}
              className="gap-1.5"
              onClick={() => setTopic('Training')}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {t('预约培训课程', 'Schedule training')}
            </Button>
          </div>

          <div className="mt-4 border-t border-border/60 pt-4">
            <SupportRequestForm key={topic} initialTopic={topic} />
          </div>
        </Panel>
      </div>
    </div>
  );
}