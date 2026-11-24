import { useState } from 'react';
import { ShoppingCart, Store, Package } from 'lucide-react';
import { Page, PageHeader, Tabs } from '../../components/Ui/kit';
import ShopsTab from './shops/ShopsTab';
import ProductsTab from './shops/ProductsTab';

/** Admin: manage input shops (wallets, selling permission) and the product catalogue. */
export default function ShopView() {
  const [tab, setTab] = useState('shops');
  return (
    <Page>
      <PageHeader
        icon={ShoppingCart}
        title="Manage Shops"
        subtitle="Input shops, their wallets and selling rights, and the product catalogue they sell from."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[{ id: 'shops', label: 'Shops', icon: Store }, { id: 'products', label: 'Product catalogue', icon: Package }]}
      />
      {tab === 'shops' ? <ShopsTab /> : <ProductsTab />}
    </Page>
  );
}
