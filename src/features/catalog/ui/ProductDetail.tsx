import React from 'react';
import { Product } from '@/entities/product';
import { formatToDisplayDate } from '../../admin/utils/dateUtils';

interface ProductDetailProps {
  product: Product;
}

const DetailRow: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
  <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-dark-border">
    <dt className="text-neutral-600 dark:text-dark-text-secondary">{label}</dt>
    <dd className="text-light-text dark:text-dark-text-primary font-medium text-right">{value ?? 'N/D'}</dd>
  </div>
);

const StatusRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => {
  const isRetired = value === 'Radiato';
  const isOutOfCatalog = value === 'Fuori Catalogo';
  
  let statusColor = 'text-light-text dark:text-dark-text-primary';
  if (isRetired) statusColor = 'text-red-600 dark:text-red-500';
  if (isOutOfCatalog) statusColor = 'text-yellow-600 dark:text-yellow-500';

  return (
      <div className="flex justify-between py-3 border-b border-neutral-200 dark:border-dark-border">
          <dt className="text-neutral-600 dark:text-dark-text-secondary">{label}</dt>
          <dd className={`font-medium text-right ${statusColor}`}>
              {value ?? 'N/D'}
          </dd>
      </div>
  );
};


const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const formattedPrice = `€ ${product.pricing.currentPrice.toFixed(2).replace('.', ',')}`;

  const proFeatures = (
    <>
      {(product.lifecycle.status && product.lifecycle.status !== 'Attivo' ||
        product.lifecycle.retirementDate ||
        product.lifecycle.radiationDate ||
        product.identity.brand ||
        product.identity.manufacturer) && (
        <div className="mt-6 p-4 rounded-lg bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">Informazioni Avanzate</h3>
          <dl>
              {product.lifecycle.status && product.lifecycle.status !== 'Attivo' && (
                <StatusRow label="Stato" value={product.lifecycle.status} />
              )}
              {product.lifecycle.radiationDate ? (
                <DetailRow label="Data Radiazione" value={formatToDisplayDate(product.lifecycle.radiationDate)} />
              ) : product.lifecycle.retirementDate ? (
                <DetailRow label="Data Radiazione" value={formatToDisplayDate(product.lifecycle.retirementDate)} />
              ) : null}
              {product.identity.brand && <DetailRow label="Marca" value={product.identity.brand} />}
              {product.identity.manufacturer && <DetailRow label="Produttore" value={product.identity.manufacturer} />}
          </dl>
        </div>
      )}

      {product.emissions && (
        <div className="mt-4 p-4 rounded-lg bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">Dati su Emissioni</h3>
           <dl>
              <DetailRow label="Catrame (mg)" value={product.emissions.tar} />
              <DetailRow label="Nicotina (mg)" value={product.emissions.nicotine} />
              <DetailRow label="Monossido di C. (mg)" value={product.emissions.co} />
           </dl>
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 w-full">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text-primary break-words mb-3">{product.identity.name}</h1>
        
        {product.lifecycle.status === 'Radiato' && (
          <div className="inline-block px-4 py-2 mb-2 text-center bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-700/50 rounded-lg">
              <p className="font-bold text-sm text-red-800 dark:text-red-200">Prodotto non più in commercio</p>
          </div>
        )}
        {product.lifecycle.status === 'Fuori Catalogo' && (
          <div className="inline-block px-4 py-2 mb-2 text-center bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700/50 rounded-lg">
              <p className="font-bold text-sm text-yellow-800 dark:text-yellow-200">Prodotto Fuori Catalogo</p>
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg bg-white dark:bg-dark-card-bg border border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold mb-3 text-light-text dark:text-dark-text-primary">Informazioni Base</h2>
        <dl>
          <DetailRow label="Prezzo" value={formattedPrice} />
          <DetailRow label="Codice" value={product.identity.code} />
          <DetailRow label="Tipologia" value={product.identity.category} />
          <DetailRow label="Confezione" value={product.identity.packageInfo} />
          {!!product.pricing.pricePerKg && <DetailRow label="Prezzo al Kg" value={`€ ${product.pricing.pricePerKg.toFixed(2).replace('.', ',')}`} />}
          {!!product.pricing.conventionalPricePerKg && <DetailRow label="Conventional Price/Kg" value={`€ ${product.pricing.conventionalPricePerKg.toFixed(2).replace('.', ',')}`} />}
          {!!product.pricing.fiscalValuePer1000Pieces && <DetailRow label="Fiscal Value/1000 pcs" value={`€ ${product.pricing.fiscalValuePer1000Pieces.toFixed(2).replace('.', ',')}`} />}
        </dl>
      </div>
      
      {proFeatures}

    </div>
  );
};

export default ProductDetail;
