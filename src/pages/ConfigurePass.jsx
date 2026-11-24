import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadWithRetry } from '@/lib/safeQuery';
import PassConfigurator from '@/components/product/PassConfigurator';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { localizedField } from '@/lib/i18n/localize';
import { catalogProduct } from '@/lib/cardronaProducts';
import BookingStepper from '@/components/BookingStepper';

export default function ConfigurePass() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWithRetry(() => base44.entities.Product.get(id))
      .then((record) => {
        if (active) setProduct(record || catalogProduct(id));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-[13px] text-muted-foreground">
        {lang === 'en' ? 'This product is unavailable' : '产品不存在或已下架'}
      </div>
    );
  }

  return (
    <div className="px-4 pb-16 pt-4">
      <BookingStepper
        steps={[lang === 'en' ? 'Pass' : '雪票', lang === 'en' ? 'Cart' : '购物车', lang === 'en' ? 'Date' : '日期', lang === 'en' ? 'Guests' : '游客', lang === 'en' ? 'Pay' : '支付', lang === 'en' ? 'Done' : '完成']}
        current={1}
      />
      <h1 className="font-heading text-[18px] leading-snug">
        {localizedField(product, 'name', lang)}
      </h1>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        {localizedField(product, 'summary', lang)}
      </p>

      <div className="mt-4">
        <PassConfigurator product={product} />
      </div>
    </div>
  );
}
