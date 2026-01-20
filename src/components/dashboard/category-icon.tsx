import type { FC } from 'react';
import { Utensils, Car, Film, Receipt, Package } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface CategoryIconProps {
  category: Transaction['category'];
  className?: string;
}

const CategoryIcon: FC<CategoryIconProps> = ({ category, className }) => {
  switch (category) {
    case 'Alimentação':
      return <Utensils className={className} />;
    case 'Transporte':
      return <Car className={className} />;
    case 'Lazer':
      return <Film className={className} />;
    case 'Contas':
      return <Receipt className={className} />;
    default:
      return <Package className={className} />;
  }
};

export default CategoryIcon;
