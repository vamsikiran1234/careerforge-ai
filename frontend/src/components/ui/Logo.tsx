import React from 'react';
import { BrandLogo, CareerForgeMark } from './BrandLogo';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'text' | 'minimal';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = ''
}) => {
  if (variant === 'icon' || variant === 'minimal') {
    const sizeMap = { xs: 20, sm: 26, md: 34, lg: 42, xl: 52, '2xl': 64 };
    return <CareerForgeMark size={sizeMap[size]} className={className} />;
  }

  if (variant === 'text') {
    return <BrandLogo size={size} variant="wordmark" className={className} />;
  }

  return <BrandLogo size={size} variant="default" className={className} />;
};

export const LogoSimple: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = ''
}) => {
  return <CareerForgeMark size={size} className={className} />;
};

export { CareerForgeMark };
export default Logo;
