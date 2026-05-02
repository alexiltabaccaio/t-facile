import React from 'react';
import { Product } from '../model/types';
import { formatToDisplayDate } from '@/shared/lib';
import { useTranslation } from 'react-i18next';
import { formatPackage } from '../lib/packageFormatter';

interface ProductDetailProps {
  product: Product;
}

const DetailRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-dark-border">
      <dt className="text-neutral-600 dark:text-dark-text-secondary">{label}</dt>
      <dd className="text-light-text dark:text-dark-text-primary font-medium text-right">{value ?? t('common.nd')}</dd>
    </div>
  );
};

const StatusRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => {
  const { t } = useTranslation();
  const isRetired = value === 'Radiato';
  const isOutOfCatalog = value === 'Fuori Catalogo';
  
  let statusColor = 'text-light-text dark:text-dark-text-primary';
  if (isRetired) statusColor = 'text-red-600 dark:text-red-500';
  if (isOutOfCatalog) statusColor = 'text-yellow-600 dark:text-yellow-500';

  let localizedStatus = value;
  if (value === 'Attivo') localizedStatus = t('product.status.active');
  else if (value === 'Radiato') localizedStatus = t('product.status.retired');
  else if (value === 'Fuori Catalogo') localizedStatus = t('product.status.outOfCatalog');

  return (
      <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-dark-border">
          <dt className="text-neutral-600 dark:text-dark-text-secondary">{label}</dt>
          <dd className={`font-medium text-right ${statusColor}`}>
              {localizedStatus ?? t('common.nd')}
          </dd>
      </div>
  );
};


const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const { t } = useTranslation();
  const formattedPrice = `€ ${product.pricing.currentPrice.toFixed(2).replace('.', ',')}`;

  const localizedCategory = t(`catalog.categories.${product.identity.category}`, { defaultValue: product.identity.category });
  const localizedPackage = formatPackage(product.identity.package, product.identity.packageInfo, t);

  const proFeatures = (
    <>
      {(product.lifecycle.status && product.lifecycle.status !== 'Attivo' ||
        product.lifecycle.retirementDate ||
        product.lifecycle.radiationDate ||
        product.identity.brand ||
        product.identity.manufacturer) && (
        <div className="mt-6 lg:p-4 lg:rounded-lg lg:bg-white lg:dark:bg-dark-card-bg lg:border lg:border-neutral-200 lg:dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">{t('productDetail.advancedInfo')}</h3>
          <dl>
              {product.lifecycle.status && product.lifecycle.status !== 'Attivo' && (
                <StatusRow label={t('productDetail.status')} value={product.lifecycle.status} />
              )}
              {product.lifecycle.radiationDate ? (
                <DetailRow label={t('productDetail.radiationDate')} value={formatToDisplayDate(product.lifecycle.radiationDate)} />
              ) : product.lifecycle.retirementDate ? (
                <DetailRow label={t('productDetail.radiationDate')} value={formatToDisplayDate(product.lifecycle.retirementDate)} />
              ) : null}
              {product.identity.brand && <DetailRow label={t('productDetail.brand')} value={product.identity.brand} />}
              {product.identity.manufacturer && <DetailRow label={t('productDetail.manufacturer')} value={product.identity.manufacturer} />}
          </dl>
        </div>
      )}

      {product.emissions && (
        <div className="mt-4 lg:p-4 lg:rounded-lg lg:bg-white lg:dark:bg-dark-card-bg lg:border lg:border-neutral-200 lg:dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">{t('productDetail.emissions')}</h3>
           <dl>
              <DetailRow label={t('productDetail.nicotine')} value={product.emissions.nicotine} />
              <DetailRow label={t('productDetail.tar')} value={product.emissions.tar} />
              <DetailRow label={t('productDetail.co')} value={product.emissions.co} />
           </dl>
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 w-full">
      <div className="mb-4 text-center">
        <h1 className="hidden lg:block text-2xl font-bold text-light-text dark:text-dark-text-primary break-words mb-3">{product.identity.name}</h1>
        
        {product.lifecycle.status === 'Radiato' && (
          <div className="inline-block px-4 py-2 mb-2 text-center bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700/50 rounded-lg">
              <p className="font-bold text-sm text-red-800 dark:text-red-200">{t('productDetail.retiredMessage')}</p>
          </div>
        )}
        {product.lifecycle.status === 'Fuori Catalogo' && (
          <div className="inline-block px-4 py-2 mb-2 text-center bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
              <p className="font-bold text-sm text-yellow-800 dark:text-yellow-200">{t('productDetail.outOfCatalogMessage')}</p>
          </div>
        )}
      </div>

      <div className="lg:p-4 lg:rounded-lg lg:bg-white lg:dark:bg-dark-card-bg lg:border lg:border-neutral-200 lg:dark:border-neutral-700">
        <h2 className="hidden lg:block text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">{t('productDetail.basicInfo')}</h2>
        <dl>
          <DetailRow label={t('productDetail.price')} value={formattedPrice} />
          <DetailRow label={t('productDetail.code')} value={product.identity.code} />
          <DetailRow label={t('productDetail.type')} value={localizedCategory} />
          <DetailRow label={t('productDetail.package')} value={localizedPackage} />
          {!!product.pricing.pricePerKg && <DetailRow label={t('productDetail.pricePerKg')} value={`€ ${product.pricing.pricePerKg.toFixed(2).replace('.', ',')}`} />}
          {!!product.pricing.conventionalPricePerKg && <DetailRow label={t('productDetail.conventionalPricePerKg')} value={`€ ${product.pricing.conventionalPricePerKg.toFixed(2).replace('.', ',')}`} />}
          {!!product.pricing.fiscalValuePer1000Pieces && <DetailRow label={t('productDetail.fiscalValue')} value={`€ ${product.pricing.fiscalValuePer1000Pieces.toFixed(2).replace('.', ',')}`} />}
        </dl>
      </div>
      
      {proFeatures}

    </div>
  );
};

export default ProductDetail;

