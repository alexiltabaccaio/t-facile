import React from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '@/entities/product';

interface ProductShareButtonProps {
  product: Product;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({ product }) => {
  const { t } = useTranslation();

  const handleShare = async () => {
    const formattedPrice = `€ ${product.pricing.currentPrice.toFixed(2).replace('.', ',')}`;
    const shareText = `📦 ${product.identity.name}\n🔑 Codice ADM: ${product.identity.code}\n💶 Prezzo: ${formattedPrice}\n\n🔗 Guarda la scheda completa su T-Facile:\nhttps://t-facile.vercel.app/catalog/${product.identity.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `T-Facile - ${product.identity.name}`,
          text: shareText,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        // Toast logic could be added here if a global toast system exists
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="text-neutral-600 hover:text-light-text dark:text-dark-text-secondary dark:hover:text-dark-text-primary p-1"
      title={t('common.share')}
      aria-label={t('common.share')}
    >
      <Share2 size={20} />
    </button>
  );
};
