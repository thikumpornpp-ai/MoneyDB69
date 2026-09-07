import React from 'react';
import {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Receipt,
  MoreHorizontal,
  Wallet,
  Award,
  Briefcase,
  TrendingUp,
  Gift,
  PlusCircle,
  ArrowRightLeft,
  QrCode,
  Banknote,
  CreditCard,
  CircleDot
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Utensils,
  Car,
  Home,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Receipt,
  MoreHorizontal,
  Wallet,
  Award,
  Briefcase,
  TrendingUp,
  Gift,
  PlusCircle,
  ArrowRightLeft,
  QrCode,
  Banknote,
  CreditCard,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const IconComponent = iconMap[name] || CircleDot;
  return <IconComponent className={className} size={size} />;
};
