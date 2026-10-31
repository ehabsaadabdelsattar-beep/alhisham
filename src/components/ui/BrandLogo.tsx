import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BrandLogoProps {
  variant?: 'horizontal' | 'vertical' | 'symbol';
  theme?: 'emerald' | 'white' | 'gold' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export default function BrandLogo({
  variant = 'horizontal',
  theme = 'auto',
  className = '',
  size = 'md',
}: BrandLogoProps) {
  const { isDark } = useTheme();

  // Resolve active color tone based on theme and mode
  let resolvedColor: 'white' | 'emerald' | 'gold' = 'emerald';
  if (theme === 'white') {
    resolvedColor = 'white';
  } else if (theme === 'gold') {
    resolvedColor = 'gold';
  } else if (theme === 'emerald') {
    resolvedColor = 'emerald';
  } else {
    // 'auto'
    resolvedColor = isDark ? 'white' : 'emerald';
  }

  // Sizing definitions
  const sizeMap = {
    sm: {
      heightClass: 'h-7 sm:h-8',
      symbolSize: 'h-7 w-7 sm:h-8 sm:w-8',
    },
    md: {
      heightClass: 'h-9 sm:h-11',
      symbolSize: 'h-9 w-9 sm:h-11 sm:w-11',
    },
    lg: {
      heightClass: 'h-12 sm:h-14',
      symbolSize: 'h-12 w-12 sm:h-14 sm:w-14',
    },
    xl: {
      heightClass: 'h-16 sm:h-20',
      symbolSize: 'h-16 w-16 sm:h-20 sm:w-20',
    },
  };

  const { heightClass, symbolSize } = sizeMap[size];

  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={`/logo-icon-${resolvedColor}.png`}
          alt="Al Hisham Emblem"
          className={`${symbolSize} object-contain transition-transform duration-300 hover:scale-105`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={`/logo-${resolvedColor}-cropped.png`}
        alt="الهشام للتطوير العقاري | AL HISHAM DEVELOPMENTS"
        className={`${heightClass} w-auto max-w-[280px] sm:max-w-none object-contain transition-opacity duration-300`}
        loading="eager"
      />
    </div>
  );
}
