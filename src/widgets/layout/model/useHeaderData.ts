import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCatalogStore } from '@/entities/product';

/**
 * Hook to extract and manage Header-specific data and logic.
 * Decouples the Header UI from routing and store details.
 */
export const useHeaderData = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const products = useCatalogStore(state => state.products);

  const isProductDetail = location.pathname.startsWith('/catalog/') && location.pathname !== '/catalog';
  const productId = isProductDetail ? location.pathname.replace('/catalog/', '') : null;
  const currentProduct = isProductDetail ? products.find(p => p.identity.code === productId) : null;
  
  const isCatalog = location.pathname === '/catalog' || location.pathname === '/';
  const showBackButton = !isCatalog;

  const getTitleData = (): { mobile: string; desktop: string; isProduct?: boolean } => {
    const path = location.pathname;
    if (path.startsWith('/catalog/')) {
      const id = path.replace('/catalog/', '');
      const product = products.find(p => p.identity.code === id);
      if (product) {
        return {
          mobile: product.identity.name,
          desktop: t('common.details') as string,
          isProduct: true
        };
      }
      return { mobile: t('common.details') as string, desktop: t('common.details') as string };
    }
    
    let titleKey = 'layout.header.catalog';
    if (path === '/notifications') titleKey = 'layout.sidebar.updates';
    else if (path.startsWith('/notifications/')) titleKey = 'common.details';
    else if (path === '/settings') titleKey = 'layout.sidebar.settings';
    else if (path === '/settings/legal') titleKey = 'layout.sidebar.legal';
    else if (path === '/settings/report') titleKey = 'layout.sidebar.report';
    else if (path === '/settings/about') titleKey = 'layout.sidebar.info';
    else if (path === '/admin') titleKey = 'layout.sidebar.admin';
    
    const translated = t(titleKey as any) as string;
    return { mobile: translated, desktop: translated };
  };

  return {
    isProductDetail,
    currentProduct,
    isCatalog,
    showBackButton,
    title: getTitleData(),
    location
  };
};
