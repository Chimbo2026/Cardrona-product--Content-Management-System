import { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { useLang } from '@/lib/i18n';
import SeasonPassInfo from '@/components/ski/SeasonPassInfo';
import SeasonPassConfigurator from '@/components/ski/SeasonPassConfigurator';
import ItemSummary from '@/components/ski/ItemSummary';
import PassCart from '@/components/ski/PassCart';
import { ageLabel, priceFor, shortPassName } from '@/lib/seasonPasses';

export default function Ski() {
  const { t } = useLang();
  const { toast } = useToast();
  const [plan, setPlan] = useState('Pay Now');
  const [passType, setPassType] = useState('Winter Unlimited Season Pass');
  const [age, setAge] = useState('Adult');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [cart, setCart] = useState([]);

  const price = priceFor(passType, age);
  const requiresRules = passType === 'Winter Saver Season Pass';
  const canAdd = !requiresRules || rulesAccepted;

  const addToCart = () => {
    const label = `${shortPassName(passType)} · ${ageLabel(age)}`;
    setCart((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, label, price, planLabel: t(plan === 'Pay Now' ? '立即支付' : '先买后付', plan) },
    ]);
    toast({ title: t('已加入购物车', 'Added to cart'), description: label });
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('冬季雪季', 'Winter season')}
        title={t('滑雪', 'Ski')}
        description={t(
          '选择 Winter 27 季票、支付方式与年龄段，查看价格并加入购物车。价格为可配置的演示数值。',
          'Choose your Winter 27 season pass, payment plan and age band, then review the price and add it to the cart. Prices are configurable demo figures.'
        )}
      />

      <SeasonPassInfo />

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_320px]">
        <SeasonPassConfigurator
          plan={plan}
          onPlanChange={setPlan}
          passType={passType}
          onPassTypeChange={(v) => {
            setPassType(v);
            setRulesAccepted(false);
          }}
          age={age}
          onAgeChange={setAge}
          rulesAccepted={rulesAccepted}
          onRulesChange={setRulesAccepted}
        />
        <ItemSummary
          passType={passType}
          age={age}
          plan={plan}
          price={price}
          canAdd={canAdd}
          onAdd={addToCart}
          blockedReason={t('请先勾选接受 Winter Saver 的使用规则。', 'Accept the rules of the Winter Saver to continue.')}
        />
      </div>

      {cart.length > 0 && (
        <div className="mt-4">
          <PassCart items={cart} onRemove={(id) => setCart((prev) => prev.filter((i) => i.id !== id))} />
        </div>
      )}
    </div>
  );
}