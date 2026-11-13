import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Panel from '@/components/common/Panel';
import SupportRequestForm from '@/components/support/SupportRequestForm';
import { useLang } from '@/lib/i18n';

const OWNED_DATA = [
  ['宾客记录', 'Guest records'],
  ['预订数据', 'Booking data'],
  ['财务报告', 'Financial reports'],
  ['员工与排班记录', 'Staff & roster records'],
];

export default function StaffOwnershipSupport() {
  const { t } = useLang();

  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Panel
        title={t('数据所有权', 'Data ownership')}
        description={t('归度假村所有的数据范围', 'What belongs to the resort')}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-600/10">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="space-y-1.5">
            <p className="text-[14px] font-semibold leading-snug text-forest-950">
              {t('公司拥有其账号与数据。', 'The company owns its accounts and data.')}
            </p>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              {t(
                '所有记录与报告均为度假村的财产，不属于软件供应商。您可以随时导出，并在需要时完整取回。',
                'All records and reports are the property of the resort, not the software supplier. Export them at any time and retrieve the full set on request.'
              )}
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 border-t border-border/60 pt-3.5">
          {OWNED_DATA.map(([zh, en]) => (
            <li key={en} className="flex items-center gap-2 text-[12.5px] text-forest-900">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-forest-600" />
              {t(zh, en)}
              <span className="ml-auto text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                {t('度假村所有', 'Resort owned')}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title={t('培训与技术支持', 'Training & support')}
        description={t('员工培训、系统维护与技术支持均已包含在内', 'Staff training, maintenance and technical support are included')}
        action={
          <Link
            to="/ownership-support"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-forest-700 hover:text-forest-900 hover:underline"
          >
            {t('完整页面', 'Full page')}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        }
      >
        <SupportRequestForm initialTopic="Training" />
      </Panel>
    </div>
  );
}