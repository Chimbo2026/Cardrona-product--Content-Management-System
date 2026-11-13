import { ShieldCheck } from 'lucide-react';
import ModuleHeader from '@/components/common/ModuleHeader';
import Panel from '@/components/common/Panel';
import SupportRequestForm from '@/components/support/SupportRequestForm';
import { useLang } from '@/lib/i18n';

const HERO = 'https://images.ctfassets.net/2atbvuhykqrn/4sRoYUu5li9l11BZFsIKAu/52d8b3d29f3361046c7191b40c841b20/W24-about-us_Imagery-Home_Page_Hero_Image_-_Desktop.webp?w=1600&fm=webp&q=75';

export default function Support() {
  const { t } = useLang();

  return (
    <div>
      <ModuleHeader
        image={HERO}
        eyebrow={t('支持', 'Support')}
        title={t('支持与数据所有权', 'Support & Data Ownership')}
        description={t(
          '数据归度假村所有，培训与持续支持均包含在服务内。可通过下方表单申请系统培训或提交支持请求。',
          'Your data stays with the resort, and training and ongoing support are included. Use the form below to request training or raise a support case.'
        )}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Panel title={t('数据所有权与支持承诺', 'Data ownership & support commitment')}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="space-y-2">
              <p className="text-[15px] font-semibold leading-snug text-forest-900">
                The company owns its data. Training and support are included.
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t(
                  '公司拥有其数据。培训与支持已包含在内。',
                  'The company owns its data. Training and support are included.'
                )}
              </p>
            </div>
          </div>
          <dl className="mt-4 space-y-2.5 border-t border-border/60 pt-3.5 text-[12px]">
            <div className="flex items-start gap-2">
              <dt className="w-24 shrink-0 font-medium text-forest-900">{t('数据所有权', 'Data ownership')}</dt>
              <dd className="text-muted-foreground">
                {t('预订、宾客、员工与财务记录归度假村所有，可随时导出。', 'Booking, guest, staff and finance records belong to the resort and can be exported at any time.')}
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <dt className="w-24 shrink-0 font-medium text-forest-900">{t('培训', 'Training')}</dt>
              <dd className="text-muted-foreground">
                {t('上线培训与季度复训包含在服务内，可针对团队定制。', 'Onboarding and quarterly refresher sessions are included and tailored to each team.')}
              </dd>
            </div>
            <div className="flex items-start gap-2">
              <dt className="w-24 shrink-0 font-medium text-forest-900">{t('支持响应', 'Response time')}</dt>
              <dd className="text-muted-foreground">
                {t('工作日内 1 个工作日回复；雪季高峰提供优先支持。', 'Replies within one business day, with priority support during peak snow season.')}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel
          title={t('申请培训或支持', 'Request training or support')}
          description={t('填写以下信息，我们的团队会跟进。', 'Tell us what you need and our team will follow up.')}
        >
          <SupportRequestForm />
        </Panel>
      </div>
    </div>
  );
}