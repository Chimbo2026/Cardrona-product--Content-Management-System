import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLang } from '@/lib/i18n';
import VoucherBuyPanel from '@/components/vouchers/VoucherBuyPanel';
import VoucherRedeemPanel from '@/components/vouchers/VoucherRedeemPanel';
import VoucherListPanel from '@/components/vouchers/VoucherListPanel';

export default function GiftVouchers() {
  const { t } = useLang();
  const [tab, setTab] = useState('buy');
  const [refreshKey, setRefreshKey] = useState(0);

  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <div>
      <PageHeader
        eyebrow={t('宾客与销售', 'Guests & Sales')}
        title={t('礼品卡', 'Gift Vouchers')}
        description={t(
          '出售与兑换卡德罗纳礼品卡：可作为礼物赠送，并在缆车票、课程、租赁或住宿中抵扣。',
          'Sell and redeem Cardrona gift vouchers — gift them to friends and use the credit on lift passes, lessons, rentals or accommodation.'
        )}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="buy">{t('购买礼品卡', 'Buy voucher')}</TabsTrigger>
          <TabsTrigger value="redeem">{t('兑换礼品卡', 'Redeem code')}</TabsTrigger>
          <TabsTrigger value="issued">{t('已售礼品卡', 'Issued vouchers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="buy">
          <VoucherBuyPanel onSold={bump} />
        </TabsContent>
        <TabsContent value="redeem">
          <VoucherRedeemPanel onRedeemed={bump} />
        </TabsContent>
        <TabsContent value="issued">
          <VoucherListPanel refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}