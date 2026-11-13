import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import HomeTab from '@/components/website-builder/HomeTab';
import PagesTab from '@/components/website-builder/PagesTab';
import { useLang } from '@/lib/i18n';

export default function WebsiteBuilder() {
  const { t } = useLang();

  return (
    <div>
      <PageHeader
        eyebrow={t('行政管理', 'Administration')}
        title={t('网站构建器', 'Website Builder')}
        description={t(
          '无需开发人员即可编辑网站文案、图片与活动落地页。保存后前端页面立即更新。',
          'Edit website copy, images and campaign landing pages without a developer. Saving updates the front-end pages immediately.'
        )}
        actions={
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <a href="/site" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              {t('查看网站', 'View live site')}
            </a>
          </Button>
        }
      />

      <Tabs defaultValue="home">
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="home" className="px-3 py-1.5 text-[12px]">
            {t('首页', 'Home Page')}
          </TabsTrigger>
          <TabsTrigger value="products" className="px-3 py-1.5 text-[12px]">
            {t('产品页面', 'Product Pages')}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="px-3 py-1.5 text-[12px]">
            {t('活动落地页', 'Campaign Landing Pages')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-4">
          <HomeTab />
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <PagesTab pageType="Product" />
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <PagesTab pageType="Campaign" />
        </TabsContent>
      </Tabs>
    </div>
  );
}