import { Heart } from 'lucide-react';
import { toggleFavourite, useFavourites } from '@/lib/favourites';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function FavouriteButton({ product, id, className = '' }) {
  const { t } = useLanguage();
  const itemId = id || product?.id;
  const saved = useFavourites().includes(itemId);

  return (
    <button
      type="button"
      aria-label={t('product.fav')}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavourite(itemId);
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition active:scale-95 ${className}`}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} />
    </button>
  );
}